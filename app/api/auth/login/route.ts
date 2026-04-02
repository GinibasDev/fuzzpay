import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { verifySync } from 'otplib'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  twofaCode: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, twofaCode } = loginSchema.parse(body)

    const { db } = await connectToDatabase()
    const user = await db.collection('User').findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex')

    if (hashedPassword !== user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twofaCode) {
        return NextResponse.json({
          requires2FA: true,
          message: '2FA code required'
        })
      }

      const result = verifySync({
        token: twofaCode,
        secret: user.twoFactorSecret
      })

      if (!result.valid) {
        return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 })
      }
    }

    const requiresSetup = user.role === 'MERCHANT' && !user.twoFactorEnabled

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      twoFactorVerified: !!user.twoFactorEnabled,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    return NextResponse.json({
      message: 'Login successful',
      requiresSetup,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
