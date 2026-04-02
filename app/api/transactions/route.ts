import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'

const transactionSchema = z.object({
  amount: z.number().positive(),
  merchantId: z.string(),
  type: z.enum(['PAYIN', 'PAYOUT']),
  currency: z.string().default('INR'),
  orderNumber: z.string(),
  merchantOrderNumber: z.string().optional(),
  serviceFee: z.number().default(0),
  recipientName: z.string().optional(),
  cardNumber: z.string().optional(),
  ifsc: z.string().optional(),
  failureReason: z.string().optional(),
  gateway: z.string().optional(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const merchantId = searchParams.get('merchantId')
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit
  const search = searchParams.get('search') || ''

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

  try {
    const { db } = await connectToDatabase()
    const match: any = {}
    
    if (!isAdmin && userMerchantId) {
      match.merchantId = new ObjectId(userMerchantId)
    } else if (merchantId) {
      match.merchantId = new ObjectId(merchantId)
    }

    if (type) match.type = type.toUpperCase()
    if (status) match.status = status.toUpperCase()
    
    if (search) {
      match.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { merchantOrderNumber: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await db.collection('Transaction').countDocuments(match)

    const transactions = await db.collection('Transaction').aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
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

    const filteredTransactions = transactions.map(tx => {
      const { gateway, ...rest } = tx
      return {
        ...rest,
        id: tx._id.toString(),
        merchant: {
          ...tx.merchant,
          id: tx.merchant._id.toString()
        },
        gatewayTransactionId: tx.gatewayTransactionId,
        channelName: gateway
      }
    })

    return NextResponse.json({
      transactions: filteredTransactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Fetch transactions error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const { 
      amount, merchantId, type, currency, orderNumber, 
      merchantOrderNumber, recipientName, 
      cardNumber, ifsc, failureReason, gateway
    } = transactionSchema.parse(body)
    
    let { serviceFee } = body
    const merchantObjectId = new ObjectId(merchantId)
    const merchant = await db.collection('Merchant').findOne({ _id: merchantObjectId })

    if (serviceFee === undefined || serviceFee === null || serviceFee === 0) {
      if (merchant) {
        const rate = type === 'PAYIN' ? (merchant.payinRate || 0) : (merchant.payoutRate || 0)
        serviceFee = (amount * rate) / 100
      } else {
        serviceFee = 0
      }
    }

    const paymentAmount = amount - serviceFee

    const transactionData = {
      amount,
      paymentAmount,
      serviceFee,
      merchantId: merchantObjectId,
      type,
      currency,
      orderNumber,
      merchantOrderNumber,
      recipientName,
      cardNumber,
      ifsc,
      failureReason,
      gateway,
      status: 'SUCCESS',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('Transaction').insertOne(transactionData)

    if (type === 'PAYIN') {
      await db.collection('Wallet').updateOne(
        { merchantId: merchantObjectId },
        { $inc: { balance: paymentAmount }, $set: { updatedAt: new Date() } },
        { upsert: true }
      )
    } else {
      const wallet = await db.collection('Wallet').findOne({ merchantId: merchantObjectId })

      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance')
      }

      await db.collection('Wallet').updateOne(
        { merchantId: merchantObjectId },
        { $inc: { balance: -amount }, $set: { updatedAt: new Date() } }
      )
    }

    return NextResponse.json({ id: result.insertedId.toString(), ...transactionData }, { status: 201 })
  } catch (error: any) {
    console.error('Create transaction error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    if (error.message === 'Insufficient balance') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
