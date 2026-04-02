import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = JSON.parse(session.value)
    const { db } = await connectToDatabase()

    const user = await db.collection('User').findOne({ _id: new ObjectId(userData.id) })
    if (!user || !user.merchantId) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    const merchantId = user.merchantId

    const [
      payinStats,
      payoutStats,
      withdrawalStats,
      settlementStats,
      wallet,
      recentTransactions
    ] = await Promise.all([
      db.collection('Transaction').aggregate([
        { $match: { merchantId: merchantId, type: 'PAYIN', status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$paymentAmount' } } }
      ]).toArray(),
      db.collection('Transaction').aggregate([
        { $match: { merchantId: merchantId, type: 'PAYOUT', status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      db.collection('Withdrawal').aggregate([
        { $match: { merchantId: merchantId, status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amountINR' } } }
      ]).toArray(),
      db.collection('Settlement').aggregate([
        { $match: { merchantId: merchantId, status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$settledAmount' } } }
      ]).toArray(),
      db.collection('Wallet').findOne({ merchantId: merchantId }),
      db.collection('Transaction').find({ merchantId: merchantId })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
    ])

    return NextResponse.json({
      stats: [
        {
          title: "Total Payin Amount",
          value: `₹${(payinStats[0]?.total || 0).toLocaleString()}`,
          trend: "Total",
          color: "text-green-600",
        },
        {
          title: "Total Payout Amount",
          value: `₹${(payoutStats[0]?.total || 0).toLocaleString()}`,
          trend: "Total",
          color: "text-blue-600",
        },
        {
          title: "Total Settlements",
          value: `₹${(settlementStats[0]?.total || 0).toLocaleString()}`,
          trend: "Completed",
          color: "text-purple-600",
        },
        {
          title: "Total Withdrawals",
          value: `₹${(withdrawalStats[0]?.total || 0).toLocaleString()}`,
          trend: "Successful",
          color: "text-orange-600",
        },
        {
          title: "Current Balance",
          value: `₹${(wallet?.balance || 0).toLocaleString()}`,
          trend: "Available",
          color: "text-emerald-600",
        },
      ],
      recentTransactions: recentTransactions.map(tx => ({
        id: tx._id.toString(),
        type: tx.type === 'PAYIN' ? 'Payin' : 'Payout',
        amount: `₹${tx.amount.toLocaleString()}`,
        status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase(),
        date: tx.createdAt.toISOString().replace('T', ' ').substring(0, 19),
      }))
    })
  } catch (error) {
    console.error('Merchant dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
