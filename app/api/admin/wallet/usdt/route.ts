import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Aggregate stats for USDT Wallet based on Withdrawals
    const stats = await db.collection('Withdrawal').aggregate([
      { $match: { type: 'usdt' } },
      {
        $group: {
          _id: null,
          totalUSDT: { 
            $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, '$usdtAmount', 0] } 
          },
          pendingUSDT: { 
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, '$usdtAmount', 0] } 
          },
          rejectedUSDT: { 
            $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, '$usdtAmount', 0] } 
          }
        }
      }
    ]).toArray()

    const walletStats = stats.length > 0 ? stats[0] : { totalUSDT: 0, pendingUSDT: 0, rejectedUSDT: 0 }

    // Fetch recent USDT withdrawals
    const withdrawals = await db.collection('Withdrawal').find({
      type: 'usdt'
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

    const transformedTransactions = withdrawals.map(w => ({
      id: w._id.toString(),
      type: w.status === 'SUCCESS' ? 'Debit' : 'Pending',
      amount: `$${w.usdtAmount?.toFixed(2)}`,
      description: `USDT Withdrawal for ${w.merchantName || 'Merchant'}`,
      txHash: w.txHash || 'N/A',
      timestamp: w.createdAt.toISOString().replace('T', ' ').substring(0, 16),
    }))

    return NextResponse.json({
      stats: [
        { title: "Total Paid Out", value: `$${walletStats.totalUSDT.toFixed(2)}`, change: "+0%", icon: "Wallet" },
        { title: "Pending Payouts", value: `$${walletStats.pendingUSDT.toFixed(2)}`, change: "+0%", icon: "TrendingUp" },
        { title: "Rejected", value: `$${walletStats.rejectedUSDT.toFixed(2)}`, change: "+0%", icon: "TrendingDown" },
      ],
      transactions: transformedTransactions
    })
  } catch (error) {
    console.error('Fetch Admin USDT Wallet error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
