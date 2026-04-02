import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

const updateMerchantSchema = z.object({
  name: z.string().min(2),
  businessType: z.string().optional(),
  payinRate: z.number(),
  payoutRate: z.number(),
  telegramChatId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const { db } = await connectToDatabase()

    const merchant = await db.collection('Merchant').aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'User',
          localField: '_id',
          foreignField: 'merchantId',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          mchId: 1,
          businessType: 1,
          status: 1,
          payinRate: 1,
          payoutRate: 1,
          telegramChatId: 1,
          'user.email': 1,
          'user.name': 1
        }
      }
    ]).next()

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...merchant,
      id: merchant._id.toString(),
      email: merchant.user?.email || '',
      username: merchant.user?.name || ''
    })
  } catch (error) {
    console.error('Fetch merchant error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = updateMerchantSchema.parse(body)
    const { db } = await connectToDatabase()

    const result = await db.collection('Merchant').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: validatedData.name,
          businessType: validatedData.businessType,
          payinRate: validatedData.payinRate,
          payoutRate: validatedData.payoutRate,
          telegramChatId: validatedData.telegramChatId,
          status: validatedData.status,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Merchant updated successfully' })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Update merchant error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
