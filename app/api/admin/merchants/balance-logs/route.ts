import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const logs = await db.collection('WalletLog').aggregate([
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

    const transformed = logs.map(log => ({
      id: log._id.toString(),
      merchant: log.merchant?.name || 'Unknown',
      type: log.type, // 'CREDIT' or 'DEBIT'
      amount: log.amount,
      previousBalance: log.previousBalance,
      newBalance: log.newBalance,
      description: log.description,
      createdAt: log.createdAt,
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Fetch balance logs error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
