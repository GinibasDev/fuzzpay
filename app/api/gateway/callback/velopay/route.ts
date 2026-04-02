import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifySignature } from '@/lib/gateway-utils'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const data = await req.json()

    console.log('VeloPay Callback received:', data)

    // 1. Verify Signature
    const receivedSign = data.sign
    const gatewayKey = process.env.VELOPAY_KEY || '1c639bd1bb094de8aa256dcc285bd05e'
    if (!receivedSign || !verifySignature(data, gatewayKey, receivedSign)) {
      console.error('Invalid signature in VeloPay callback')
      return new Response('FAIL', { status: 400 })
    }

    const { txn_id, status, amount, id } = data

    // 2. Find transaction
    const transaction = await db.collection('Transaction').findOne({ 
      orderNumber: txn_id 
    })

    if (!transaction) {
      console.error('Transaction not found:', txn_id)
      return new Response('SUCCESS')
    }

    // 3. Prevent double processing
    if (transaction.status !== 'PENDING') {
      return new Response('SUCCESS')
    }

    // 4. Process status
    if (status === 'SUCCESS') {
      const payAmount = parseFloat(amount)
      
      await db.collection('Transaction').updateOne(
        { _id: transaction._id },
        {
          $set: {
            status: 'SUCCESS',
            paymentAmount: payAmount,
            callbackRawData: JSON.stringify(data),
            updatedAt: new Date(),
          },
        }
      )

      const wallet = await db.collection('Wallet').findOne({ merchantId: transaction.merchantId })
      const previousBalance = wallet?.balance || 0
      const newBalance = previousBalance + payAmount

      await db.collection('Wallet').updateOne(
        { merchantId: transaction.merchantId },
        { $inc: { balance: payAmount }, $set: { updatedAt: new Date() } },
        { upsert: true }
      )

      await db.collection('WalletLog').insertOne({
        merchantId: transaction.merchantId,
        type: 'CREDIT',
        amount: payAmount,
        previousBalance,
        newBalance,
        description: `Payin settlement for ${transaction.orderNumber} (VeloPay)`,
        createdAt: new Date(),
      })
    } else {
      await db.collection('Transaction').updateOne(
        { _id: transaction._id },
        {
          $set: {
            status: 'FAILED',
            callbackRawData: JSON.stringify(data),
            updatedAt: new Date(),
          },
        }
      )
    }

    // Return plain text 'SUCCESS' as required by VeloPay
    return new Response('SUCCESS')
  } catch (error) {
    console.error('VeloPay callback processing error:', error)
    return new Response('FAIL', { status: 500 })
  }
}
