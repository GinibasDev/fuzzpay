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
      gateway: 'Channel 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const txnResult = await db.collection('Transaction').insertOne(internalTransaction)
    const internalId = txnResult.insertedId.toString()

    const payInData = {
      mchId: '', // Handled by utility from env
      amount: internalTransaction.amount,
      orderNumber: internalTransaction.orderNumber,
      notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://fuzzpay.vercel.app'}/api/callback/okpay/payin`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://fuzzpay.vercel.app'}/merchant/payin`,
      internalId: internalId
    }

    let result: any;
    let gatewayUsed = 'Channel 1';

    try {
      // Attempt Channel 1 (OkPay)
      console.log('Attempting Channel 1 (OkPay)...');
      result = await initiateOkPayPayIn(payInData);
      
      if (result.code !== 0) {
        throw new Error(result.msg || 'OkPay failed');
      }
    } catch (okPayError) {
      console.error('Channel 1 failed, attempting failover to Channel 2 (VeloPay):', okPayError);
      
      gatewayUsed = 'Channel 2';
      const veloPayData = {
        ...payInData,
        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://fuzzpay.vercel.app'}/api/callback/velopay/payin`,
      }
      
      try {
        result = await initiateVeloPayPayIn(veloPayData);
        
        // VeloPay response structure: { status: "SUCCESS", message: "...", pay_link: "...", id: "..." }
        if (result.status !== 'SUCCESS') {
          throw new Error(result.message || result.msg || 'VeloPay failed');
        }
        
        // Normalize result for the rest of the logic
        result = {
          code: 0,
          data: {
            url: result.pay_link,
            transaction_Id: result.id
          }
        };
      } catch (veloPayError: any) {
        console.error('Channel 2 also failed:', veloPayError);
        
        await db.collection('Transaction').updateOne(
          { _id: txnResult.insertedId },
          {
            $set: {
              status: 'FAILED',
              failureReason: `Failover failed. Ch1: ${okPayError instanceof Error ? okPayError.message : 'Unknown'}, Ch2: ${veloPayError.message || 'Unknown'}`,
              updatedAt: new Date(),
            },
          }
        )
        return NextResponse.json({ error: 'Payment gateway unavailable. Please try again later.' }, { status: 503 })
      }
    }

    // Success with either gateway
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
      channel: gatewayUsed
    })

  } catch (error) {
    console.error('Create payin error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
