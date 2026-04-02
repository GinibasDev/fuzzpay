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
      walletType: 'INR', // Assuming INR for now as per schema
      type: log.type === 'CREDIT' ? 'Credit' : 'Debit',
      amount: `₹${log.amount.toLocaleString()}`,
      previousBalance: `₹${log.previousBalance.toLocaleString()}`,
      newBalance: `₹${log.newBalance.toLocaleString()}`,
      description: log.description,
      reference: log.merchant?.name || 'Unknown',
      timestamp: log.createdAt ? new Date(log.createdAt).toISOString().replace('T', ' ').substring(0, 16) : 'N/A',
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Fetch Admin Wallet Logs error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
