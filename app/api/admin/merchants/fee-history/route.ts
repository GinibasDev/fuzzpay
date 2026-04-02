import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const fees = await db.collection('Transaction').aggregate([
      { $match: { serviceFee: { $gt: 0 } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'Merchant',
          localField: 'merchantId',
          foreignField: '_id',
          as: 'merchant'
        }
      },
      { $unwind: { path: '$merchant', preserveNullAndEmptyArrays: true } }
    ]).toArray()

    const transformed = fees.map(fee => ({
      id: fee._id.toString(),
      merchant: fee.merchant?.name || 'Unknown',
      transactionType: fee.type, // 'PAYIN' or 'PAYOUT'
      transactionId: fee.orderNumber,
      amount: fee.amount,
      feeRate: fee.type === 'PAYIN' ? (fee.merchant?.payinRate || 0) : (fee.merchant?.payoutRate || 0),
      feeAmount: fee.serviceFee,
      createdAt: fee.createdAt,
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Fetch fee history error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
