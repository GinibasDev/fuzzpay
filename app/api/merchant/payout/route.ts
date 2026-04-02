import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifySignature, initiatePayOutFailover } from '@/lib/gateway-utils'
import { z } from 'zod'

const merchantPayoutSchema = z.object({
  mchId: z.string(),
  money: z.coerce.number().positive(),
  out_trade_no: z.string(),
  account: z.string(),
  userName: z.string(),
  ifsc: z.string(),
  notify_url: z.string().url(),
  sign: z.string(),
})

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    
    // 1. Validate request body
    const validatedData = merchantPayoutSchema.parse(body)
    
    // 2. Find Merchant
    const merchant = await db.collection('Merchant').findOne({ mchId: validatedData.mchId })
    if (!merchant) {
      return NextResponse.json({ code: 4, msg: 'merchant not found' }, { status: 400 })
    }

    // 3. Verify Merchant Signature
    if (!verifySignature(body, merchant.apiKey, validatedData.sign)) {
      return NextResponse.json({ code: 5, msg: 'sign error' }, { status: 400 })
    }

    // 4. Check internal balance
    const wallet = await db.collection('Wallet').findOne({ merchantId: merchant._id })

    if (!wallet || wallet.balance < validatedData.money) {
      return NextResponse.json({ code: 9, msg: 'Insufficient balance' }, { status: 400 })
    }

    const rate = merchant.payoutRate || 0
    const serviceFee = (validatedData.money * rate) / 100
    const paymentAmount = validatedData.money - serviceFee

    // 5. Create internal transaction record
    const internalTransaction = {
      orderNumber: validatedData.out_trade_no,
      amount: validatedData.money,
      paymentAmount: paymentAmount,
      serviceFee: serviceFee,
      merchantId: merchant._id,
      type: 'PAYOUT',
      status: 'PENDING',
      currency: 'INR',
      bankDetails: {
        account: validatedData.account,
        userName: validatedData.userName,
        ifsc: validatedData.ifsc,
      },
      notify_url: validatedData.notify_url,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const txnResult = await db.collection('Transaction').insertOne(internalTransaction)
    const internalId = txnResult.insertedId.toString()

    // 6. Deduct balance immediately
    await db.collection('Wallet').updateOne(
      { merchantId: merchant._id },
      { $inc: { balance: -validatedData.money }, $set: { updatedAt: new Date() } }
    )

    // 7. Initiate Gateway Payout (Failover)
    const payOutData = {
      mchId: merchant.mchId,
      amount: validatedData.money,
      orderNumber: validatedData.out_trade_no,
      account: validatedData.account,
      userName: validatedData.userName,
      ifsc: validatedData.ifsc,
      notifyUrl: validatedData.notify_url,
      returnUrl: '',
      internalId: internalId,
    }

    const initResult = await initiatePayOutFailover(payOutData)

    if (initResult.success) {
      const { gateway, result } = initResult
      await db.collection('Transaction').updateOne(
        { _id: txnResult.insertedId },
        { 
          $set: { 
            gateway,
            gatewayTransactionId: gateway === 'OKPAY' ? result.data.transaction_Id : result.id,
            updatedAt: new Date()
          } 
        }
      )

      return NextResponse.json({
        code: 0,
        msg: 'success',
        data: {
          transaction_Id: internalId,
          gateway: gateway
        }
      })
    } else {
      // If gateway initiation fails, we still keep it as PENDING or mark as FAILED?
      // Usually, if all gateways fail, we mark as FAILED and refund balance
      await db.collection('Transaction').updateOne(
        { _id: txnResult.insertedId },
        { $set: { status: 'FAILED', callbackRawData: initResult.error, updatedAt: new Date() } }
      )
      
      // Refund balance
      await db.collection('Wallet').updateOne(
        { merchantId: merchant._id },
        { $inc: { balance: validatedData.money }, $set: { updatedAt: new Date() } }
      )

      return NextResponse.json({ code: 1, msg: initResult.error || 'Gateway initiation failed' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Merchant PayOut error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 1, msg: 'parameter error', errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ code: 1, msg: 'Internal Server Error' }, { status: 500 })
  }
}
