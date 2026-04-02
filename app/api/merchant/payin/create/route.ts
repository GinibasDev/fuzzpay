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
      gateway: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const txnResult = await db.collection('Transaction').insertOne(internalTransaction)
    const internalId = txnResult.insertedId.toString()

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fuzzpay.vercel.app'
    const basePayInData = {
      mchId: '',
      amount: internalTransaction.amount,
      orderNumber: internalTransaction.orderNumber,
      returnUrl: `${baseUrl}/merchant/payin`,
      internalId,
    }

    async function tryOkPay(): Promise<{ gateway: string; result: { data: { url: string; transaction_Id: string } } }> {
      const res = await initiateOkPayPayIn({
        ...basePayInData,
        notifyUrl: `${baseUrl}/api/callback/okpay/payin`,
      })
      if (res.code !== 0) {
        throw new Error(res.msg || 'OkPay failed')
      }
      return { gateway: 'Channel 1', result: res }
    }

    async function tryVeloPay(): Promise<{ gateway: string; result: { data: { url: string; transaction_Id: string } } }> {
      const raw = await initiateVeloPayPayIn({
        ...basePayInData,
        notifyUrl: `${baseUrl}/api/callback/velopay/payin`,
      })
      if (raw.status !== 'SUCCESS') {
        throw new Error(raw.message || raw.msg || 'VeloPay failed')
      }
      const result = {
        data: {
          url: raw.pay_link,
          transaction_Id: raw.id,
        },
      }
      return { gateway: 'Channel 2', result }
    }

    const tryOkFirst = Math.random() < 0.5
    const attempts = tryOkFirst ? [tryOkPay, tryVeloPay] : [tryVeloPay, tryOkPay]
    const channelLabels = tryOkFirst ? ['Channel 1 (OkPay)', 'Channel 2 (VeloPay)'] : ['Channel 2 (VeloPay)', 'Channel 1 (OkPay)']

    console.log(`Payin gateway order (random): ${channelLabels.join(' → ')}`)

    const errors: string[] = []
    let gatewayUsed = ''
    let result: { data: { url: string; transaction_Id: string } } | null = null

    for (let i = 0; i < attempts.length; i++) {
      try {
        const out = await attempts[i]()
        gatewayUsed = out.gateway
        result = out.result
        break
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        errors.push(`${channelLabels[i]}: ${msg}`)
        console.error(`Payin ${channelLabels[i]} failed:`, e)
      }
    }

    if (!result) {
      await db.collection('Transaction').updateOne(
        { _id: txnResult.insertedId },
        {
          $set: {
            status: 'FAILED',
            failureReason: errors.join(' | '),
            updatedAt: new Date(),
          },
        }
      )
      return NextResponse.json({ error: 'Payment gateway unavailable. Please try again later.' }, { status: 503 })
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

