import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifySignature } from '@/lib/gateway-utils'
import { ObjectId } from 'mongodb'

const VELOPAY_KEY = process.env.VELOPAY_KEY || 'test_key_placeholder'

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const data = await req.json()
    console.log('VeloPay PayIn Callback received:', data)

    // 1. Verify Signature
    const receivedSign = data.sign
    if (!receivedSign || !verifySignature(data, VELOPAY_KEY, receivedSign)) {
      console.error('Invalid signature in VeloPay PayIn callback')
      return new Response('fail', { status: 400 })
    }

    const { txn_id, status, amount } = data

    // 2. Find transaction
    const transaction = await db.collection('Transaction').findOne({ 
      orderNumber: txn_id, 
      gateway: 'VELOPAY' 
    })

    if (!transaction) {
      console.error('Transaction not found:', txn_id)
      return new Response('SUCCESS')
    }

    if (transaction.status !== 'PENDING') {
      return new Response('SUCCESS')
    }

    // 3. Process status
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

      await db.collection('Wallet').updateOne(
        { merchantId: transaction.merchantId },
        { $inc: { balance: payAmount }, $set: { updatedAt: new Date() } },
        { upsert: true }
      )
    }

    return new Response('SUCCESS')
  } catch (error) {
    console.error('VeloPay PayIn callback error:', error)
    return new Response('fail', { status: 500 })
  }
}
