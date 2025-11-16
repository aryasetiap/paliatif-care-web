import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Define role-based routes
  const adminRoutes = ['/admin']
  const perawatRoutes = ['/dashboard', '/screening', '/edukasi']
  const pasienRoutes = ['/pasien']
  const publicRoutes = ['/login', '/register', '/screening/guest', '/test-esas-forms']
  const protectedRoutes = ['/dashboard', '/pasien', '/screening', '/edukasi', '/profile', '/admin']

  // Get user role if authenticated
  let userRole = null
  if (session) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      userRole = profile?.role
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  // Check if current path is auth route
  const isAuthRoute = ['/login', '/register'].includes(pathname)

  // Redirect authenticated users from auth routes to role-based dashboard
  if (isAuthRoute && session && userRole) {
    const dashboardUrl = getRoleBasedRedirect(userRole, req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Handle root redirect
  if (pathname === '/') {
    if (session && userRole) {
      const dashboardUrl = getRoleBasedRedirect(userRole, req.url)
      return NextResponse.redirect(dashboardUrl)
    } else {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Check route access based on role
  if (session && userRole) {
    // Admin routes access
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const dashboardUrl = getRoleBasedRedirect(userRole, req.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Pasien routes access
    if (pathname.startsWith('/pasien') && userRole !== 'pasien') {
      const dashboardUrl = getRoleBasedRedirect(userRole, req.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Perawat routes access (admin and perawat can access)
    if (perawatRoutes.some(route => pathname.startsWith(route)) &&
        !['admin', 'perawat'].includes(userRole)) {
      const dashboardUrl = getRoleBasedRedirect(userRole, req.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // Redirect unauthenticated users from protected routes to login
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route) && !publicRoutes.includes(pathname)
  )

  if (isProtectedRoute && !session && !pathname.startsWith('/screening/guest')) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

function getRoleBasedRedirect(role: string, baseUrl: string): URL {
  switch (role) {
    case 'admin':
      return new URL('/admin/dashboard', baseUrl)
    case 'perawat':
      return new URL('/dashboard', baseUrl)
    case 'pasien':
      return new URL('/pasien/dashboard', baseUrl)
    default:
      return new URL('/dashboard', baseUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - assets (static assets like images, logos)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|assets).*)',
  ],
}