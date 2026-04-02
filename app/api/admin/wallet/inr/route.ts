import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Aggregate stats for INR Wallet (based on service fees)
    const stats = await db.collection('Transaction').aggregate([
      { $match: { status: 'SUCCESS', currency: 'INR' } },
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$serviceFee' },
          totalCredits: { 
            $sum: { 
              $cond: [{ $eq: ['$type', 'PAYIN'] }, '$serviceFee', 0] 
            } 
          },
          totalDebits: { 
            $sum: { 
              $cond: [{ $eq: ['$type', 'PAYOUT'] }, '$serviceFee', 0] 
            } 
          }
        }
      }
    ]).toArray()

    const walletStats = stats.length > 0 ? stats[0] : { totalBalance: 0, totalCredits: 0, totalDebits: 0 }

    // Fetch recent transactions that contributed to admin wallet (i.e., had service fees)
    const transactions = await db.collection('Transaction').find({
      status: 'SUCCESS',
      serviceFee: { $gt: 0 },
      currency: 'INR'
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

    const transformedTransactions = transactions.map(tx => ({
      id: tx._id.toString(),
      type: 'Credit',
      amount: `₹${tx.serviceFee.toLocaleString()}`,
      description: `Service fee from ${tx.type} ${tx.orderNumber}`,
      timestamp: tx.createdAt.toISOString().replace('T', ' ').substring(0, 16),
    }))

    return NextResponse.json({
      stats: [
        { title: "Total Balance", value: `₹${walletStats.totalBalance.toLocaleString()}`, change: "+0%", icon: "Wallet" },
        { title: "Total Credits", value: `₹${walletStats.totalCredits.toLocaleString()}`, change: "+0%", icon: "TrendingUp" },
        { title: "Total Debits", value: `₹${walletStats.totalDebits.toLocaleString()}`, change: "+0%", icon: "TrendingDown" },
      ],
      transactions: transformedTransactions
    })
  } catch (error) {
    console.error('Fetch Admin INR Wallet error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
