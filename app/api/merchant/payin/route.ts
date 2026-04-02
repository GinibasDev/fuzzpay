import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifySignature } from '@/lib/gateway-utils'
import { z } from 'zod'

const merchantPayinSchema = z.object({
  mchId: z.string(),
  money: z.coerce.number().positive(),
  out_trade_no: z.string(),
  notify_url: z.string().url(),
  return_url: z.string().url(),
  sign: z.string(),
})

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    
    // 1. Validate request body
    const validatedData = merchantPayinSchema.parse(body)

    // 2. Find Merchant
    const merchant = await db.collection('Merchant').findOne({ mchId: validatedData.mchId })
    if (!merchant) {
      return NextResponse.json({ code: 4, msg: 'merchant not found' }, { status: 400 })
    }
    
    // 3. Verify Merchant Signature
    if (!verifySignature(body, merchant.apiKey, validatedData.sign)) {
      return NextResponse.json({ code: 5, msg: 'sign error' }, { status: 400 })
    }

    // 4. Create internal transaction record
    const internalTransaction = {
      orderNumber: validatedData.out_trade_no,
      amount: validatedData.money,
      merchantId: merchant._id,
      type: 'PAYIN',
      status: 'PENDING',
      currency: 'INR',
      notifyUrl: validatedData.notify_url,
      returnUrl: validatedData.return_url,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const txnResult = await db.collection('Transaction').insertOne(internalTransaction)
    const internalId = txnResult.insertedId.toString()

    // 5. Return FuzzPay Checkout URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
    const checkoutUrl = `${baseUrl}/payin/process/${internalId}`

    return NextResponse.json({
      code: 0,
      msg: 'success',
      data: {
        url: checkoutUrl,
        transaction_Id: internalId,
      }
    })

  } catch (error: any) {
    console.error('Merchant PayIn error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 1, msg: 'parameter error', errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ code: 1, msg: 'Internal Server Error' }, { status: 500 })
  }
}
