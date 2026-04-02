import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { initiatePayInFailover } from '@/lib/gateway-utils'
import { ObjectId } from 'mongodb'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { db } = await connectToDatabase()

    const transaction = await db.collection('Transaction').findOne({ _id: new ObjectId(id) })
    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Transaction already processed' }, { status: 400 })
    }

    const merchant = await db.collection('Merchant').findOne({ _id: transaction.merchantId })
    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 400 })
    }

    const payInData = {
      mchId: merchant.mchId,
      amount: transaction.amount,
      orderNumber: transaction.orderNumber,
      notifyUrl: transaction.notifyUrl,
      returnUrl: transaction.returnUrl,
      internalId: id,
    }

    const initResult = await initiatePayInFailover(payInData)

    if (initResult.success) {
      const { gateway, result } = initResult
      
      const updateData: any = {
        gateway,
        gatewayTransactionId: gateway === 'OKPAY' ? result.data.transaction_Id : result.id,
        updatedAt: new Date(),
      }

      await db.collection('Transaction').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )

      return NextResponse.json({
        success: true,
        paymentUrl: gateway === 'OKPAY' ? result.data.url : result.pay_link,
      })
    } else {
      await db.collection('Transaction').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'FAILED', callbackRawData: initResult.error, updatedAt: new Date() } }
      )
      return NextResponse.json({ success: false, error: initResult.error }, { status: 500 })
    }

  } catch (error: any) {
    console.error('PayIn initiation API error:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
