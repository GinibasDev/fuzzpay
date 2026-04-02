import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const { pathname } = request.nextUrl

  // Handle generic login page redirect for authenticated users
  if (pathname === '/login') {
    if (session) {
      try {
        const userData = JSON.parse(session.value)
        if (userData.role === 'MERCHANT') {
          return NextResponse.redirect(new URL('/merchant/dashboard', request.url))
        } else if (userData.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
      } catch (e) {
        // Invalid session, continue to login page
      }
    }
    return NextResponse.next()
  }

  // Protected routes under /admin
  if (pathname.startsWith('/admin')) {
    // Allow access to the login page itself
    if (pathname === '/admin/login') {
      // If already logged in as admin, redirect to dashboard
      if (session) {
        try {
          const userData = JSON.parse(session.value)
          if (userData.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
          }
        } catch (e) {
          // Invalid session, continue to login page
        }
      }
      return NextResponse.next()
    }

    // Check for session
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const userData = JSON.parse(session.value)
      if (userData.role !== 'ADMIN') {
        // Not an admin, redirect to generic login or unauthorized
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch (e) {
      // Invalid session
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // List of top-level routes that require authentication
  const protectedTopLevelRoutes = [
    '/dashboard',
    '/merchants',
    '/notifications',
    '/payin',
    '/payout',
    '/reports',
    '/settlement',
    '/wallet',
    '/withdrawals'
  ]

  // Protected routes under /merchant and generic top-level routes
  const isMerchantRoute = pathname.startsWith('/merchant')
  const isProtectedTopLevelRoute = protectedTopLevelRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  if (isMerchantRoute || isProtectedTopLevelRoute) {
    // Check for session
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const userData = JSON.parse(session.value)
      if (userData.role !== 'MERCHANT' && userData.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // If merchant tries to access admin-only top-level routes, redirect them to their merchant version
      if (userData.role === 'MERCHANT' && isProtectedTopLevelRoute) {
        const merchantPath = pathname.replace(/^\//, '/merchant/')
        // Check if we should redirect or just block. For now, let's redirect to merchant dashboard
        // as a safe default if the specific merchant route might not exist or be different.
        if (pathname === '/dashboard') {
          return NextResponse.redirect(new URL('/merchant/dashboard', request.url))
        }
        return NextResponse.redirect(new URL('/merchant/dashboard', request.url))
      }
    } catch (e) {
      // Invalid session
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/admin/:path*', 
    '/merchant/:path*', 
    '/dashboard',
    '/merchants/:path*',
    '/notifications/:path*',
    '/payin/:path*',
    '/payout/:path*',
    '/reports/:path*',
    '/settlement/:path*',
    '/wallet/:path*',
    '/withdrawals/:path*',
  ],
}
