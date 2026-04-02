import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    
    const { db } = await connectToDatabase()
    
    const query: any = {}
    if (type) query.type = type
    if (status) query.status = status

    const withdrawals = await db.collection('Withdrawal')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(withdrawals)
  } catch (error) {
    console.error('Admin fetch withdrawals error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
