import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { verifySync } from 'otplib'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = JSON.parse(session.value)
    const { db } = await connectToDatabase()

    const user = await db.collection('User').findOne({ _id: new ObjectId(userData.id) })

    if (!user || !user.tempTwoFactorSecret) {
      return NextResponse.json({ error: 'Setup not initiated' }, { status: 400 })
    }

    const result = verifySync({
      token: code,
      secret: user.tempTwoFactorSecret
    })

    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Enable 2FA
    await db.collection('User').updateOne(
      { _id: new ObjectId(userData.id) },
      { 
        $set: { 
          twoFactorEnabled: true, 
          twoFactorSecret: user.tempTwoFactorSecret 
        },
        $unset: { tempTwoFactorSecret: "" }
      }
    )

    // Update session cookie to reflect 2FA verification
    const updatedUserData = { ...userData, twoFactorVerified: true }
    cookieStore.set('session', JSON.stringify(updatedUserData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({ message: '2FA enabled successfully' })
  } catch (error) {
    console.error('2FA Verify error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
