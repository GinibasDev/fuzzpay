import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'
import crypto from 'crypto'
import { ObjectId } from 'mongodb'

const merchantSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  businessType: z.string().optional(),
  initialBalance: z.number().default(0),
  payinRate: z.number().default(7),
  payoutRate: z.number().default(4),
  telegramChatId: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''

    const { db } = await connectToDatabase()
    
    const match: any = {}
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mchId: { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ]
    }

    const merchants = await db.collection('Merchant').aggregate([
      {
        $lookup: {
          from: 'User',
          localField: '_id',
          foreignField: 'merchantId',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $match: match },
      {
        $lookup: {
          from: 'Wallet',
          localField: '_id',
          foreignField: 'merchantId',
          as: 'wallet'
        }
      },
      { $unwind: { path: '$wallet', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          mchId: 1,
          businessType: 1,
          status: 1,
          createdAt: 1,
          payinRate: 1,
          payoutRate: 1,
          'wallet._id': 1,
          'wallet.balance': 1,
          'wallet.merchantId': 1,
          'user.email': 1,
          'user.name': 1
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }]
        }
      }
    ]).toArray()

    const data = merchants[0].data
    const total = merchants[0].total[0]?.count || 0

    const transformed = data.map((m: any) => ({
      ...m,
      id: m._id.toString(),
      email: m.user?.email || '',
      wallet: m.wallet ? { ...m.wallet, id: m.wallet._id.toString(), merchantId: m.wallet.merchantId.toString() } : null
    }))

    return NextResponse.json({
      merchants: transformed,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Fetch merchants error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const { name, email, username, password, businessType, initialBalance, payinRate, payoutRate, telegramChatId } = merchantSchema.parse(body)

    // Check if email already exists
    const existingUser = await db.collection('User').findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex')

    // Generate 5-digit mchId
    const lastMerchant = await db.collection('Merchant').find({ mchId: { $exists: true } }).sort({ mchId: -1 }).limit(1).toArray()
    let nextMchId = '10001'
    if (lastMerchant.length > 0 && lastMerchant[0].mchId) {
      nextMchId = (parseInt(lastMerchant[0].mchId) + 1).toString()
    }

    const apiKey = crypto.randomBytes(16).toString('hex')

    // 1. Create Merchant
    const merchantResult = await db.collection('Merchant').insertOne({
      name,
      mchId: nextMchId,
      apiKey,
      businessType,
      payinRate,
      payoutRate,
      telegramChatId,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const merchantId = merchantResult.insertedId

    // 2. Create User for Merchant
    await db.collection('User').insertOne({
      email,
      name: username,
      password: hashedPassword,
      role: 'MERCHANT',
      merchantId: merchantId,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 3. Create Wallet
    await db.collection('Wallet').insertOne({
      balance: initialBalance,
      merchantId: merchantId,
      updatedAt: new Date(),
    })

    if (initialBalance > 0) {
      await db.collection('WalletLog').insertOne({
        merchantId: merchantId,
        type: 'CREDIT',
        amount: initialBalance,
        previousBalance: 0,
        newBalance: initialBalance,
        description: 'Initial balance',
        createdAt: new Date(),
      })
    }

    return NextResponse.json({ id: merchantId.toString(), name, businessType }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create merchant error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
