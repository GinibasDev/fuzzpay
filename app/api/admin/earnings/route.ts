import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { startOfDay, endOfDay, startOfMonth, startOfYear, subDays } from 'date-fns'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  let isAdmin = false

  if (session) {
    try {
      const userData = JSON.parse(session.value)
      isAdmin = userData.role === 'ADMIN'
    } catch (e) {}
  }

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { db } = await connectToDatabase()
    
    const now = new Date()
    const todayStart = startOfDay(now)
    const yesterdayStart = startOfDay(subDays(now, 1))
    const yesterdayEnd = endOfDay(subDays(now, 1))
    const monthStart = startOfMonth(now)
    const yearStart = startOfYear(now)

    const calculateEarnings = (type: string, gateway: string, amount: number) => {
      if (type === 'PAYIN') {
        if (gateway === 'OKPAY') return amount * 0.055
        if (gateway === 'VELOPAY') return amount * 0.045
      } else if (type === 'PAYOUT') {
        if (gateway === 'OKPAY' || gateway === 'VELOPAY') return amount * 0.03 + 6
      }
      return 0
    }

    const match = { status: 'SUCCESS' }

    const transactions = await db.collection('Transaction').find(match).toArray()

    const stats = {
      total: { earn: 0, payin: 0, payout: 0 },
      today: { earn: 0, payin: 0, payout: 0 },
      yesterday: { earn: 0, payin: 0, payout: 0 },
      thisMonth: { earn: 0, payin: 0, payout: 0 },
      thisYear: { earn: 0, payin: 0, payout: 0 },
    }

    transactions.forEach((tx: any) => {
      const earn = tx.serviceFee !== undefined ? tx.serviceFee : calculateEarnings(tx.type, tx.gateway, tx.amount)
      const date = new Date(tx.createdAt)

      // Total
      stats.total.earn += earn
      if (tx.type === 'PAYIN') stats.total.payin += earn
      else if (tx.type === 'PAYOUT') stats.total.payout += earn

      // Today
      if (date >= todayStart) {
        stats.today.earn += earn
        if (tx.type === 'PAYIN') stats.today.payin += earn
        else if (tx.type === 'PAYOUT') stats.today.payout += earn
      }

      // Yesterday
      if (date >= yesterdayStart && date <= yesterdayEnd) {
        stats.yesterday.earn += earn
        if (tx.type === 'PAYIN') stats.yesterday.payin += earn
        else if (tx.type === 'PAYOUT') stats.yesterday.payout += earn
      }

      // This Month
      if (date >= monthStart) {
        stats.thisMonth.earn += earn
        if (tx.type === 'PAYIN') stats.thisMonth.payin += earn
        else if (tx.type === 'PAYOUT') stats.thisMonth.payout += earn
      }

      // This Year
      if (date >= yearStart) {
        stats.thisYear.earn += earn
        if (tx.type === 'PAYIN') stats.thisYear.payin += earn
        else if (tx.type === 'PAYOUT') stats.thisYear.payout += earn
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Earnings fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
