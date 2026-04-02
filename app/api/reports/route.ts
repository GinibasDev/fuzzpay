import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { startOfDay, endOfDay, format } from 'date-fns'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'payin'
  const startDateStr = searchParams.get('startDate')
  const endDateStr = searchParams.get('endDate')
  const merchantId = searchParams.get('merchantId')

  const startDate = startDateStr ? new Date(startDateStr) : undefined
  const endDate = endDateStr ? new Date(endDateStr) : undefined

  try {
    const { db } = await connectToDatabase()
    let data: any[] = []
    const match: any = {}
    
    if (merchantId) {
      match.merchantId = new ObjectId(merchantId)
    }

    if (startDate || endDate) {
      match.createdAt = {}
      if (startDate) match.createdAt.$gte = startOfDay(startDate)
      if (endDate) match.createdAt.$lte = endOfDay(endDate)
    }

    if (type === 'payin' || type === 'payout') {
      match.type = type.toUpperCase()
      data = await db.collection('Transaction').find(match).sort({ createdAt: -1 }).toArray()
    } else if (type === 'settlement') {
      data = await db.collection('Settlement').find(match).sort({ createdAt: -1 }).toArray()
    } else if (type === 'withdrawal') {
      data = await db.collection('Withdrawal').find(match).sort({ createdAt: -1 }).toArray()
    }

    // Group by date
    const groupedData = data.reduce((acc: any, item: any) => {
      const dateKey = format(new Date(item.createdAt), 'yyyy-MM-dd')
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          count: 0,
          totalAmount: 0,
          serviceFee: 0,
          netAmount: 0,
          status: 'Complete' // Simplified for report
        }
      }

      acc[dateKey].count += 1
      
      let amount = 0
      let serviceFee = item.serviceFee || 0

      if (type === 'payin' || type === 'payout') {
        amount = item.amount || 0
      } else if (type === 'settlement') {
        amount = item.settlementAmount || item.amountReceived || 0
      } else if (type === 'withdrawal') {
        amount = item.amountINR || item.amount || 0
      }

      acc[dateKey].totalAmount += amount
      acc[dateKey].serviceFee += serviceFee
      
      if (type === 'payin') {
        acc[dateKey].netAmount += (item.paymentAmount || (amount - serviceFee))
      } else if (type === 'payout') {
         acc[dateKey].netAmount += (amount + serviceFee)
      } else {
        acc[dateKey].netAmount += amount
      }

      return acc
    }, {})

    const reportRows = Object.values(groupedData).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json(reportRows)
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
