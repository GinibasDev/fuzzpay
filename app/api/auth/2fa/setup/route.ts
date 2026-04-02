import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { generateSecret, generateURI } from 'otplib'
import QRCode from 'qrcode'
import { ObjectId } from 'mongodb'

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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate secret
    const secret = generateSecret()
    const otpauth = generateURI({ 
      issuer: 'FuzzPay', 
      label: user.email, 
      secret 
    })
    const qrCodeUrl = await QRCode.toDataURL(otpauth)

    // Store temporary secret (or just return it and let client send it back for verification)
    // We'll store it in the user document as tempTwoFactorSecret
    await db.collection('User').updateOne(
      { _id: new ObjectId(userData.id) },
      { $set: { tempTwoFactorSecret: secret } }
    )

    return NextResponse.json({
      secret,
      qrCodeUrl
    })
  } catch (error) {
    console.error('2FA Setup error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
