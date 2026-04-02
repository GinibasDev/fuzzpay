import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifySignature } from '@/lib/gateway-utils'
import { ObjectId } from 'mongodb'

const VELOPAY_KEY = process.env.VELOPAY_KEY || 'test_key_placeholder'

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const data = await req.json()
    console.log('VeloPay PayOut Callback received:', data)

    // 1. Verify Signature
    const receivedSign = data.sign
    if (!receivedSign || !verifySignature(data, VELOPAY_KEY, receivedSign)) {
      console.error('Invalid signature in VeloPay PayOut callback')
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
      await db.collection('Transaction').updateOne(
        { _id: transaction._id },
        {
          $set: {
            status: 'SUCCESS',
            callbackRawData: JSON.stringify(data),
            updatedAt: new Date(),
          },
        }
      )
    } else if (status === 'FAILED') {
      // Refund
      const refundAmount = parseFloat(amount) / 100 // VeloPay uses integer amount (cents/paise)
      
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

      await db.collection('Wallet').updateOne(
        { merchantId: transaction.merchantId },
        { $inc: { balance: refundAmount }, $set: { updatedAt: new Date() } }
      )
    }

    return new Response('SUCCESS')
  } catch (error) {
    console.error('VeloPay PayOut callback error:', error)
    return new Response('fail', { status: 500 })
  }
}
