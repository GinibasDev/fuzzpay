import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { initiateOkPayPayOut, initiateVeloPayPayOut } from '@/lib/gateway-utils'
import { z } from 'zod'
import { ObjectId } from 'mongodb'

const payoutRequestSchema = z.object({
  merchantId: z.string(),
  amount: z.number().positive(),
  orderNumber: z.string(),
  account: z.string(),
  userName: z.string(),
  ifsc: z.string(),
  notifyUrl: z.string().url(),
})

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const { merchantId, amount, orderNumber, account, userName, ifsc, notifyUrl } = payoutRequestSchema.parse(body)

    const merchantObjectId = new ObjectId(merchantId)
    const wallet = await db.collection('Wallet').findOne({ merchantId: merchantObjectId })

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const internalTransaction = {
      orderNumber,
      amount,
      merchantId: merchantObjectId,
      type: 'PAYOUT',
      status: 'PENDING',
      currency: 'INR',
      gateway: 'OKPAY',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const txnResult = await db.collection('Transaction').insertOne(internalTransaction)
    const internalId = txnResult.insertedId.toString()

    const data = {
      mchId: merchantId,
      amount,
      orderNumber,
      account,
      userName,
      ifsc,
      notifyUrl,
      returnUrl: '',
      internalId: internalId,
    }

    let result: any
    let gatewayUsed = 'OKPAY'

    try {
      // Try Primary Gateway (OkPay)
      result = await initiateOkPayPayOut(data)
      if (result.code !== 0) throw new Error(result.msg || 'OkPay failed')
    } catch (error) {
      console.warn('OkPay failed, switching to VeloPay:', error)
      gatewayUsed = 'VELOPAY'
      try {
        result = await initiateVeloPayPayOut(data)
        if (result.status !== 'PENDING' && result.status !== 'SUCCESS') throw new Error(result.message || 'VeloPay failed')
      } catch (veloError: any) {
        console.error('All gateways failed')
        await db.collection('Transaction').updateOne(
          { _id: txnResult.insertedId },
          { $set: { status: 'FAILED', callbackRawData: veloError.message, updatedAt: new Date() } }
        )
        return NextResponse.json({ success: false, error: 'All gateways failed' }, { status: 500 })
      }
    }

    // Success with either gateway - deduct balance
    await db.collection('Wallet').updateOne(
      { merchantId: merchantObjectId },
      { $inc: { balance: -amount }, $set: { updatedAt: new Date() } }
    )

    await db.collection('Transaction').updateOne(
      { _id: txnResult.insertedId },
      { 
        $set: { 
          gateway: gatewayUsed,
          gatewayTransactionId: gatewayUsed === 'OKPAY' ? result.data.transaction_Id : result.id,
          updatedAt: new Date()
        } 
      }
    )

    return NextResponse.json({
      success: true,
      gateway: gatewayUsed,
      transactionId: gatewayUsed === 'OKPAY' ? result.data.transaction_Id : result.id,
    })

  } catch (error: any) {
    console.error('PayOut initiation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
