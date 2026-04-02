import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = JSON.parse(session.value)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    const { db } = await connectToDatabase()
    
    let query: any = {}
    
    if (userData.role === 'MERCHANT') {
      const user = await db.collection('User').findOne({ _id: new ObjectId(userData.id) })
      if (!user || !user.merchantId) {
        return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
      }
      query.merchantId = user.merchantId
    } else {
      const merchantId = searchParams.get('merchantId')
      if (merchantId) {
        query.merchantId = new ObjectId(merchantId)
      }
    }

    if (status) {
      query.status = status
    }

    const settlements = await db.collection('Settlement').aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'Merchant',
          localField: 'merchantId',
          foreignField: '_id',
          as: 'merchant'
        }
      },
      { $unwind: { path: '$merchant', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ]).toArray()

    const transformed = settlements.map(s => ({
      id: s._id.toString(),
      merchant: s.merchant?.name || 'Unknown',
      orderNumber: s.orderNumber,
      date: s.createdAt.toISOString().split('T')[0],
      amountReceived: s.amountReceived,
      settlementAmount: s.settlementAmount,
      settledAmount: s.settledAmount,
      pendingAmount: s.pendingAmount,
      status: s.status,
      transactionCount: s.transactionCount || 1,
      completedAt: s.completedAt ? s.completedAt.toISOString().split('T')[0] : (s.status === 'SUCCESS' ? s.createdAt.toISOString().split('T')[0] : '-')
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Fetch settlements error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
