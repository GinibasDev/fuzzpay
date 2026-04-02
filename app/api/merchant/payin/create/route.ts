import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'
import { initiateOkPayPayIn, initiateVeloPayPayIn } from '@/lib/gateway-utils'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = JSON.parse(session.value)
    if (userData.role !== 'MERCHANT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const user = await db.collection('User').findOne({ _id: new ObjectId(userData.id) })

    if (!user || !user.merchantId) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    const body = await req.json()
    const { amount, orderNumber } = body

    const numericAmount = parseFloat(amount)
    if (!numericAmount || numericAmount < 100 || numericAmount > 50000) {
      return NextResponse.json({ error: 'Amount must be between ₹100 and ₹50,000' }, { status: 400 })
    }

    const merchant = await db.collection('Merchant').findOne({ _id: user.merchantId })
    const rate = merchant?.payinRate || 0
    const serviceFee = (numericAmount * rate) / 100
    const paymentAmount = numericAmount - serviceFee

    const internalTransaction = {
      orderNumber: `TXN_${Date.now()}`,
      merchantOrderNumber: orderNumber || `ORD_${Date.now()}`,
      amount: numericAmount,
      paymentAmount: paymentAmount,
      serviceFee: serviceFee,
      merchantId: user.merchantId,
      type: 'PAYIN',
      status: 'PENDING',
      currency: 'INR',
      gateway: 'Channel 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const txnResult = await db.collection('Transaction').insertOne(internalTransaction)
    const internalId = txnResult.insertedId.toString()

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fuzzpay.vercel.app'
    const payInData = {
      mchId: '',
      amount: internalTransaction.amount,
      orderNumber: internalTransaction.orderNumber,
      notifyUrl: `${baseUrl}/api/callback/okpay/payin`,
      returnUrl: `${baseUrl}/merchant/payin`,
      internalId,
    }

    let result: any
    let gatewayUsed = 'Channel 2'

    try {
      console.log('Attempting Channel 2 (VeloPay)...')
      const veloPayData = {
        ...payInData,
        notifyUrl: `${baseUrl}/api/callback/velopay/payin`,
      }
      const veloRaw = await initiateVeloPayPayIn(veloPayData)

      if (veloRaw.status !== 'SUCCESS') {
        throw new Error(veloRaw.message || veloRaw.msg || 'VeloPay failed')
      }
      if (!veloRaw.pay_link) {
        throw new Error('VeloPay: no pay_link in response')
      }

      result = {
        code: 0,
        data: {
          url: veloRaw.pay_link,
          transaction_Id: veloRaw.id,
        },
      }
    } catch (veloPayError) {
      console.error('Channel 2 failed, attempting failover to Channel 1 (OkPay):', veloPayError)

      gatewayUsed = 'Channel 1'
      try {
        result = await initiateOkPayPayIn(payInData)

        if (result.code !== 0) {
          throw new Error(result.msg || 'OkPay failed')
        }
      } catch (okPayError: any) {
        console.error('Channel 1 also failed:', okPayError)

        await db.collection('Transaction').updateOne(
          { _id: txnResult.insertedId },
          {
            $set: {
              status: 'FAILED',
              failureReason: `Failover failed. Ch2: ${veloPayError instanceof Error ? veloPayError.message : 'Unknown'}, Ch1: ${okPayError?.message || 'Unknown'}`,
              updatedAt: new Date(),
            },
          }
        )
        return NextResponse.json({ error: 'Payment gateway unavailable. Please try again later.' }, { status: 503 })
      }
    }

    await db.collection('Transaction').updateOne(
      { _id: txnResult.insertedId },
      {
        $set: {
          gateway: gatewayUsed,
          gatewayTransactionId: result.data.transaction_Id,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      paymentUrl: result.data.url,
      transactionId: result.data.transaction_Id,
      channel: gatewayUsed,
    })
  } catch (error) {
    console.error('Create payin error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
