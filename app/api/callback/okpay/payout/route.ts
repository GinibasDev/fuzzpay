import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifySignature, generateSignature } from '@/lib/gateway-utils'

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const contentType = req.headers.get('content-type') || ''
    
    let body: Record<string, any> = {}
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      formData.forEach((value, key) => {
        body[key] = value
      })
    } else {
      body = await req.json()
    }

    console.log('OkPay Payout Callback Body:', body)

    const okpayKey = process.env.OKPAY_KEY || '009c69aaaafc468e889db30a71b0a5d9'
    
    // 1. Verify Signature
    if (!verifySignature(body, okpayKey, body.sign)) {
      console.error('OkPay Signature Verification Failed')
      return new Response('fail', { status: 400 })
    }

    // 2. Identify Transaction
    // OkPay sends internal ID in 'attach'
    const transactionId = body.attach
    if (!transactionId) {
      console.error('OkPay Callback: Missing attach (transactionId)')
      return new Response('fail', { status: 400 })
    }

    const transaction = await db.collection('Transaction').findOne({ 
      _id: new ObjectId(transactionId) 
    })

    if (!transaction) {
      console.error('OkPay Callback: Transaction not found', transactionId)
      return new Response('fail', { status: 404 })
    }

    // 3. Update Transaction Status
    const status = body.status === '1' ? 'SUCCESS' : 'FAILED'
    
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
        previousBalance: 0, // Should fetch real previous balance if possible
        newBalance: 0, // Should fetch real new balance if possible
        description: `Refund for failed payout: ${transaction.orderNumber}`,
        createdAt: new Date(),
      })
    }

    await db.collection('Transaction').updateOne(
      { _id: new ObjectId(transactionId) },
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

    return new Response('success')

  } catch (error: any) {
    console.error('OkPay Payout Callback Error:', error)
    return new Response('fail', { status: 500 })
  }
}
