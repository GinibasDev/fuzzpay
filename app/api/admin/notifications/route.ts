import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')

  try {
    const { db } = await connectToDatabase()
    const match: any = {}
    
    if (search) {
      match.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { merchantName: { $regex: search, $options: 'i' } }
      ]
    }

    const transactions = await db.collection('Transaction').aggregate([
      { $match: match },
      { $sort: { updatedAt: -1 } },
      { $limit: 50 },
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

    const notifications = transactions.map((tx) => ({
      id: tx._id.toString(),
      type: tx.type === 'PAYIN' ? 'Payin Callback' : 'Payout Callback',
      merchant: tx.merchant?.name || 'Unknown',
      transactionId: tx.orderNumber,
      status: tx.status === 'SUCCESS' ? 'Success' : tx.status === 'FAILED' ? 'Failed' : 'Pending',
      attempts: tx.notificationCount || 1,
      lastAttempt: tx.updatedAt ? new Date(tx.updatedAt).toISOString().replace('T', ' ').substring(0, 16) : 'N/A',
      createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString().replace('T', ' ').substring(0, 16) : 'N/A',
    }))

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Fetch admin notifications error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
