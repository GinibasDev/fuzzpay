import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { initiateOkPayPayIn, initiateVeloPayPayIn } from '@/lib/gateway-utils'
import { z } from 'zod'
import { ObjectId } from 'mongodb'

const payinRequestSchema = z.object({
  merchantId: z.string(),
  amount: z.number().positive(),
  orderNumber: z.string(),
  notifyUrl: z.string().url(),
  returnUrl: z.string().url(),
})

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const { merchantId, amount, orderNumber, notifyUrl, returnUrl } = payinRequestSchema.parse(body)

    const merchantObjectId = new ObjectId(merchantId)
    const internalTransaction = {
      orderNumber,
      amount,
      merchantId: merchantObjectId,
      type: 'PAYIN',
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
      notifyUrl,
      returnUrl,
      internalId: internalId,
    }

    let result: any
    let gatewayUsed = 'OKPAY'

    try {
      // Try Primary Gateway (OkPay)
      result = await initiateOkPayPayIn(data)
      if (result.code !== 0) throw new Error(result.msg || 'OkPay failed')
    } catch (error) {
      console.warn('OkPay failed, switching to VeloPay:', error)
      gatewayUsed = 'VELOPAY'
      try {
        result = await initiateVeloPayPayIn(data)
        // VeloPay returns status: "SUCCESS" or similar
        if (result.status !== 'SUCCESS') throw new Error(result.message || 'VeloPay failed')
      } catch (veloError: any) {
        console.error('All gateways failed')
        await db.collection('Transaction').updateOne(
          { _id: txnResult.insertedId },
          { $set: { status: 'FAILED', callbackRawData: veloError.message, updatedAt: new Date() } }
        )
        return NextResponse.json({ success: false, error: 'All gateways failed' }, { status: 500 })
      }
    }

    // Success with either gateway
    await db.collection('Transaction').updateOne(
      { _id: txnResult.insertedId },
      {
        $set: {
          gateway: gatewayUsed,
          gatewayTransactionId: gatewayUsed === 'OKPAY' ? result.data.transaction_Id : result.id,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      gateway: gatewayUsed,
      paymentUrl: gatewayUsed === 'OKPAY' ? result.data.url : result.pay_link,
      transactionId: gatewayUsed === 'OKPAY' ? result.data.transaction_Id : result.id,
    })

  } catch (error: any) {
    console.error('PayIn initiation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
