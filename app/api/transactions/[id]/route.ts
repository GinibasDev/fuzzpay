import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const { db } = await connectToDatabase()
    
    const cookieStore = await cookies()
    const session = cookieStore.get('session')
    let isAdmin = false
    let userMerchantId = null

    if (session) {
      try {
        const userData = JSON.parse(session.value)
        isAdmin = userData.role === 'ADMIN'
        userMerchantId = userData.merchantId
      } catch (e) {}
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transaction = await db.collection('Transaction').findOne({
      _id: new ObjectId(id)
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check if the user has access to this transaction
    if (!isAdmin && userMerchantId && transaction.merchantId.toString() !== userMerchantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Lookup merchant details
    const merchant = await db.collection('Merchant').findOne({
      _id: transaction.merchantId
    })

    const result = {
      ...transaction,
      id: transaction._id.toString(),
      merchant: merchant ? {
        ...merchant,
        id: merchant._id.toString()
      } : null,
      gatewayTransactionId: transaction.gatewayTransactionId,
      channelName: transaction.gateway
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Fetch transaction by ID error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
