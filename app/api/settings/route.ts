import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection('SystemSettings').findOne({ key: 'global_config' })
    
    if (!settings) {
      // Return default values if not found
      return NextResponse.json({
        usdt_rate: 90,
        min_usdt_withdrawal: 1000
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Fetch settings error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const { usdt_rate, min_usdt_withdrawal } = body

    await db.collection('SystemSettings').updateOne(
      { key: 'global_config' },
      { 
        $set: { 
          usdt_rate: parseFloat(usdt_rate),
          min_usdt_withdrawal: parseFloat(min_usdt_withdrawal),
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    )

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
