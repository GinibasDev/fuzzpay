import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    const { action, remark } = body // action: 'APPROVE' or 'REJECT'

    const { db } = await connectToDatabase()
    const withdrawal = await db.collection('Withdrawal').findOne({ _id: new ObjectId(id) })

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    }

    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 })
    }

    if (action === 'APPROVE') {
      await db.collection('Withdrawal').updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status: 'COMPLETED', 
            remark: remark || 'Approved by admin',
            updatedAt: new Date() 
          } 
        }
      )
      // Balance was already deducted at request time.
      return NextResponse.json({ message: 'Withdrawal approved' })
    } 
    
    if (action === 'REJECT') {
      // Refund the balance
      const wallet = await db.collection('Wallet').findOne({ merchantId: withdrawal.merchantId })
      
      await db.collection('Wallet').updateOne(
        { merchantId: withdrawal.merchantId },
        { 
          $inc: { balance: withdrawal.amountINR }, 
          $set: { updatedAt: new Date() } 
        }
      )

      await db.collection('WalletLog').insertOne({
        merchantId: withdrawal.merchantId,
        type: 'CREDIT',
        amount: withdrawal.amountINR,
        previousBalance: wallet?.balance || 0,
        newBalance: (wallet?.balance || 0) + withdrawal.amountINR,
        description: `Refund for rejected withdrawal - ${id}`,
        createdAt: new Date(),
      })

      await db.collection('Withdrawal').updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status: 'REJECTED', 
            remark: remark || 'Rejected by admin',
            updatedAt: new Date() 
          } 
        }
      )

      return NextResponse.json({ message: 'Withdrawal rejected and balance refunded' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin withdrawal action error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
