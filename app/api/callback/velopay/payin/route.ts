import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifySignature, generateSignature } from '@/lib/gateway-utils'

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()

    console.log('VeloPay PayIn Callback Body:', body)

    const velopayKey = process.env.VELOPAY_KEY || '1c639bd1bb094de8aa256dcc285bd05e'
    
    // 1. Verify Signature
    if (!verifySignature(body, velopayKey, body.sign)) {
      console.error('VeloPay PayIn Signature Verification Failed')
      return new Response('fail', { status: 400 })
    }

    // 2. Identify Transaction
    const orderNumber = body.txn_id
    if (!orderNumber) {
      console.error('VeloPay PayIn Callback: Missing txn_id')
      return new Response('fail', { status: 400 })
    }

    const transaction = await db.collection('Transaction').findOne({ 
      orderNumber: orderNumber 
    })

    if (!transaction) {
      console.error('VeloPay PayIn Callback: Transaction not found', orderNumber)
      return new Response('fail', { status: 404 })
    }

    if (transaction.status === 'SUCCESS') {
      return new Response('SUCCESS')
    }

    // 3. Update Transaction Status
    const status = (body.status === 'SUCCESS' || body.status === 1) ? 'SUCCESS' : 'FAILED'
    
    // If successful, credit merchant balance
    if (status === 'SUCCESS' && transaction.status !== 'SUCCESS') {
      const amount = parseFloat(body.amount)
      
      await db.collection('Wallet').updateOne(
        { merchantId: transaction.merchantId },
        { $inc: { balance: amount }, $set: { updatedAt: new Date() } }
      )
      
      await db.collection('WalletLog').insertOne({
        merchantId: transaction.merchantId,
        type: 'DEBIT',
        amount: amount,
        description: `VeloPay PayIn successful: ${transaction.orderNumber}`,
        createdAt: new Date(),
      })
    }

    await db.collection('Transaction').updateOne(
      { _id: transaction._id },
      { 
        $set: { 
          status: status,
          gatewayCallback: body,
          paymentAmount: parseFloat(body.amount),
          updatedAt: new Date()
        } 
      }
    )

    // 4. Notify Merchant
    if (transaction.notifyUrl) {
      try {
        const merchant = await db.collection('Merchant').findOne({ _id: transaction.merchantId })
        const merchantKey = merchant?.apiKey || '009c69aaaafc468e889db30a71b0a5d9'

        const callbackData: Record<string, any> = {
          mchId: merchant?.mchId || transaction.merchantId.toString(),
          out_trade_no: transaction.orderNumber,
          money: transaction.amount.toString(),
          pay_money: body.amount.toString(),
          status: status === 'SUCCESS' ? '1' : '2',
          attach: transaction.attach || '',
        }
        callbackData.sign = generateSignature(callbackData, merchantKey)

        const formData = new URLSearchParams()
        for (const [key, value] of Object.entries(callbackData)) {
          formData.append(key, value)
        }

        fetch(transaction.notifyUrl, {
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
    console.error('VeloPay PayIn Callback Error:', error)
    return new Response('fail', { status: 500 })
  }
}
