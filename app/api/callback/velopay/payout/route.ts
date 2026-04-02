import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifySignature, generateSignature } from '@/lib/gateway-utils'

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const contentType = req.headers.get('content-type') || ''
    
    let body: Record<string, any> = {}
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const formData = await req.formData()
      formData.forEach((value, key) => {
        body[key] = value
      })
    }

    console.log('VeloPay Payout Callback Body:', body)

    const velopayKey = process.env.VELOPAY_KEY || '1c639bd1bb094de8aa256dcc285bd05e'
    
    // 1. Verify Signature
    if (!verifySignature(body, velopayKey, body.sign)) {
      console.error('VeloPay Signature Verification Failed')
      return new Response('FAIL', { status: 400 })
    }

    // 2. Identify Transaction
    // VeloPay sends internal ID in 'attach' if provided, otherwise use txn_id
    const transactionId = body.attach || body.txn_id
    if (!transactionId) {
      console.error('VeloPay Callback: Missing transaction identifier')
      return new Response('FAIL', { status: 400 })
    }

    let transaction
    if (ObjectId.isValid(transactionId)) {
      transaction = await db.collection('Transaction').findOne({ 
        _id: new ObjectId(transactionId) 
      })
    }

    if (!transaction) {
      // Fallback to searching by orderNumber (txn_id)
      transaction = await db.collection('Transaction').findOne({ 
        orderNumber: body.txn_id,
        type: 'PAYOUT'
      })
    }

    if (!transaction) {
      console.error('VeloPay Callback: Transaction not found', transactionId)
      return new Response('FAIL', { status: 404 })
    }

    // 3. Update Transaction Status
    // Assuming status 1 = Success for VeloPay as well
    const status = (body.status === '1' || body.status === 1) ? 'SUCCESS' : 'FAILED'
    
    // If failed, refund merchant balance
    if (status === 'FAILED' && transaction.status !== 'FAILED') {
      await db.collection('Wallet').updateOne(
        { merchantId: transaction.merchantId },
        { $inc: { balance: transaction.amount }, $set: { updatedAt: new Date() } }
      )
      
      await db.collection('WalletLog').insertOne({
        merchantId: transaction.merchantId,
        type: 'CREDIT',
        amount: transaction.amount,
        previousBalance: 0,
        newBalance: 0,
        description: `Refund for failed payout: ${transaction.orderNumber}`,
        createdAt: new Date(),
      })
    }

    await db.collection('Transaction').updateOne(
      { _id: transaction._id },
      { 
        $set: { 
          status: status,
          gatewayCallback: body,
          updatedAt: new Date()
        } 
      }
    )

    // Update Withdrawal record if exists
    if (transaction.withdrawalId) {
      await db.collection('Withdrawal').updateOne(
        { _id: new ObjectId(transaction.withdrawalId) },
        { 
          $set: { 
            status: status === 'SUCCESS' ? 'Completed' : 'Rejected',
            updatedAt: new Date()
          } 
        }
      )
    }

    // 4. Notify Merchant
    if (transaction.notify_url) {
      try {
        const merchant = await db.collection('Merchant').findOne({ _id: transaction.merchantId })
        const merchantKey = merchant?.apiKey || 'eb6080dbc8dc429ab86a1cd1c337975d'

        const callbackData: Record<string, any> = {
          mchId: transaction.merchantId.toString(),
          out_trade_no: transaction.orderNumber,
          money: transaction.amount.toString(),
          status: status === 'SUCCESS' ? '1' : '2',
          attach: transaction.attach || '',
        }
        callbackData.sign = generateSignature(callbackData, merchantKey)

        const formData = new URLSearchParams()
        for (const [key, value] of Object.entries(callbackData)) {
          formData.append(key, value)
        }

        fetch(transaction.notify_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        }).catch(err => console.error('Failed to notify merchant:', err))

      } catch (err) {
        console.error('Error during merchant notification:', err)
      }
    }

    return new Response('SUCCESS')

  } catch (error: any) {
    console.error('VeloPay Payout Callback Error:', error)
    return new Response('FAIL', { status: 500 })
  }
}
