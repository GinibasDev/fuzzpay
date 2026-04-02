import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { initiateOkPayPayOut, initiateVeloPayPayOut } from '@/lib/gateway-utils'

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const { transactionId, channel } = await req.json()

    if (!transactionId || !channel) {
      return NextResponse.json({ error: 'Missing transactionId or channel' }, { status: 400 })
    }

    const transaction = await db.collection('Transaction').findOne({ 
      _id: new ObjectId(transactionId),
      type: 'PAYOUT',
      status: 'PENDING'
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found or not pending' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const okpayCallbackUrl = `${baseUrl}/api/callback/okpay/payout`
    const velopayCallbackUrl = `${baseUrl}/api/callback/velopay/payout`

    const payoutData = {
      mchId: transaction.merchantId.toString(),
      amount: transaction.amount,
      orderNumber: transaction.orderNumber,
      notifyUrl: channel === 1 ? okpayCallbackUrl : velopayCallbackUrl,
      returnUrl: '',
      internalId: transactionId,
      account: transaction.bankDetails?.account || '',
      userName: transaction.bankDetails?.userName || '',
      ifsc: transaction.bankDetails?.ifsc || '',
    }

    let result
    let gatewayName = ''

    if (channel === 1) {
      gatewayName = 'Channel 1 (OkPay)'
      result = await initiateOkPayPayOut(payoutData)
    } else if (channel === 2) {
      gatewayName = 'Channel 2 (VeloPay)'
      result = await initiateVeloPayPayOut(payoutData)
    } else {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    if (result && (result.code === 0 || result.status === 'success' || result.success === true)) {
      // Gateway accepted the request
      await db.collection('Transaction').updateOne(
        { _id: new ObjectId(transactionId) },
        { 
          $set: { 
            status: 'PROCESSING',
            gateway: gatewayName,
            gatewayResponse: result,
            updatedAt: new Date()
          } 
        }
      )
      return NextResponse.json({ success: true, msg: 'Payout sent to gateway successfully', result })
    } else {
      // Gateway rejected the request
      return NextResponse.json({ 
        success: false, 
        error: 'Gateway rejected the request', 
        result 
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Send to channel error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
