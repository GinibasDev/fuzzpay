import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const [
      payinStats,
      payoutStats,
      withdrawalStats,
      settlementStats,
      merchantBalances,
      pendingFailedTxns
    ] = await Promise.all([
      db.collection('Transaction').aggregate([
        { $match: { type: 'PAYIN', status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$paymentAmount' } } }
      ]).toArray(),
      db.collection('Transaction').aggregate([
        { $match: { type: 'PAYOUT', status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      db.collection('Withdrawal').aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      db.collection('Settlement').aggregate([
        { $match: { status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      db.collection('Merchant').aggregate([
        {
          $lookup: {
            from: 'Wallet',
            localField: '_id',
            foreignField: 'merchantId',
            as: 'wallet'
          }
        },
        { $unwind: { path: '$wallet', preserveNullAndEmptyArrays: true } },
        { $limit: 10 }
      ]).toArray(),
      db.collection('Transaction').aggregate([
        { $match: { status: { $in: ['PENDING', 'FAILED'] } } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'Merchant',
            localField: 'merchantId',
            foreignField: '_id',
            as: 'merchant'
          }
        },
        { $unwind: '$merchant' }
      ]).toArray()
    ])

    return NextResponse.json({
      stats: {
        totalPayin: payinStats[0]?.total || 0,
        totalPayout: payoutStats[0]?.total || 0,
        totalWithdrawals: withdrawalStats[0]?.total || 0,
        totalSettlements: settlementStats[0]?.total || 0,
      },
      merchantBalances: merchantBalances.map(m => ({
        merchant: m.name,
        inr: m.wallet?.balance || 0,
        usdt: 0,
        status: m.status
      })),
      pendingFailedTxns: pendingFailedTxns.map(tx => ({
        id: tx._id.toString(),
        type: tx.type,
        merchant: tx.merchant.name,
        amount: tx.amount,
        status: tx.status,
        channelName: tx.gateway
      }))
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
