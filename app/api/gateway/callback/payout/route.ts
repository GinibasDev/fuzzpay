import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifySignature } from '@/lib/gateway-utils'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const text = await req.text()
    const searchParams = new URLSearchParams(text)
    const data = Object.fromEntries(searchParams.entries())

    console.log('PayOut Callback received:', data)

    // 1. Verify Signature
    const receivedSign = data.sign
    const gatewayKey = process.env.OKPAY_KEY || '009c69aaaafc468e889db30a71b0a5d9'
    if (!receivedSign || !verifySignature(data, gatewayKey, receivedSign)) {
      console.error('Invalid signature in PayOut callback')
      return new Response('fail', { status: 400 })
    }

    const { out_trade_no, status, money, attach } = data

    // 2. Find transaction
    const query: any = {}
    if (attach && ObjectId.isValid(attach)) {
      query._id = new ObjectId(attach)
    } else {
      query.orderNumber = out_trade_no
    }

    const transaction = await db.collection('Transaction').findOne(query)

    if (!transaction) {
      console.error('Transaction not found:', out_trade_no)
      return new Response('success')
    }

    // 3. Prevent double processing
    if (transaction.status !== 'PENDING') {
      return new Response('success')
    }

    // 4. Process status
    if (status === '1') {
      // Success
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
    } else if (status === '2') {
      // Failed - Refund the amount to merchant wallet
      const refundAmount = parseFloat(money)
      
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

    // Return plain text 'success' as required by gateway
    return new Response('success')
  } catch (error) {
    console.error('PayOut callback processing error:', error)
    return new Response('fail', { status: 500 })
  }
}
