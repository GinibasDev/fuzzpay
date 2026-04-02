import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'

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

    let merchant = await db.collection('Merchant').findOne({ _id: user.merchantId })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    // Auto-generate API key if not exists
    if (!merchant.apiKey) {
      const newApiKey = crypto.randomBytes(16).toString('hex')
      await db.collection('Merchant').updateOne(
        { _id: user.merchantId },
        { $set: { apiKey: newApiKey } }
      )
      merchant.apiKey = newApiKey
    }

    // Auto-generate 5-digit mchId if not exists
    if (!merchant.mchId) {
      // Find highest existing mchId to increment, or start from 10000
      const lastMerchant = await db.collection('Merchant').find({ mchId: { $exists: true } }).sort({ mchId: -1 }).limit(1).toArray()
      let nextMchId = '10001'
      if (lastMerchant.length > 0 && lastMerchant[0].mchId) {
        nextMchId = (parseInt(lastMerchant[0].mchId) + 1).toString()
      }
      
      await db.collection('Merchant').updateOne(
        { _id: user.merchantId },
        { $set: { mchId: nextMchId } }
      )
      merchant.mchId = nextMchId
    }

    const wallet = await db.collection('Wallet').findOne({ merchantId: user.merchantId })

    const profile = {
      merchantName: merchant.name,
      merchantId: merchant.mchId, // Use 5-digit ID
      mongodbId: merchant._id.toString(), // Keep internal ID if needed for any reason, but profile mainly uses mchId now
      balance: `₹${(wallet?.balance || 0).toLocaleString()}`,
      withdrawalAmount: `₹${(merchant.withdrawalAmount || 0).toLocaleString()}`,
      payinRate: `${merchant.payinRate || 0}%`,
      payoutRate: `${merchant.payoutRate || 0}%`,
      customerNumber: merchant.customerNumber || 'N/A',
      paymentCallbackUrl: merchant.paymentCallbackUrl || 'N/A',
      apiKey: merchant.apiKey,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Fetch merchant profile error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
