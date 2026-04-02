import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const merchantId = searchParams.get('merchantId')
  const search = searchParams.get('search')

  try {
    const { db } = await connectToDatabase()
    const match: any = {}
    
    if (merchantId && ObjectId.isValid(merchantId)) {
      match.merchantId = new ObjectId(merchantId)
    }

    if (search) {
      match.orderNumber = { $regex: search, $options: 'i' }
    }

    const transactions = await db.collection('Transaction').find(match)
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray()

    // Map transactions to notification log format
    const notifications = transactions.map((tx) => ({
      id: tx._id.toString().substring(tx._id.toString().length - 6).toUpperCase(),
      type: tx.type === 'PAYIN' ? 'Payin Callback' : 'Payout Callback',
      orderNumber: tx.orderNumber,
      timestamp: tx.updatedAt instanceof Date ? tx.updatedAt.toISOString() : new Date(tx.updatedAt).toISOString(),
      status: tx.status === 'SUCCESS' ? 'Success' : tx.status === 'FAILED' ? 'Failed' : 'Pending',
      retryCount: tx.notificationCount || 0,
      response: tx.callbackRawData ? (tx.callbackRawData.length > 50 ? tx.callbackRawData.substring(0, 50) + '...' : tx.callbackRawData) : 'No response yet',
    }))

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
