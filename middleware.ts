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
  const publicRoutes = ['/login', '/register', '/register/from-guest', '/screening/guest', '/test-esas-forms']
  const protectedRoutes = ['/dashboard', '/pasien', '/screening', '/edukasi', '/profile', '/admin']

  // Get user role if authenticated
  let userRole = null
  let isSessionValid = true

  if (session) {
    try {
      // For refresh scenarios, first try to get the user from the session
      // This is more reliable than calling getUser() which can fail on refresh
      const user = session.user

      if (!user) {
        console.log('Session exists but no user data - clearing session')
        isSessionValid = false
        const logoutUrl = new URL('/login', req.url)
        logoutUrl.searchParams.set('sessionExpired', 'true')
        logoutUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(logoutUrl)
      }

      // Only validate with getUser() for critical operations, not on every refresh
      // This prevents auto-logout on page refresh due to temporary token issues
      const isCriticalRoute = ['/admin', '/profile'].some(route => pathname.startsWith(route))
      const isPasienDashboard = pathname.startsWith('/pasien/dashboard')

      if (isCriticalRoute) {
        // For critical routes, validate the session more strictly
        const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser(session.access_token)

        if (userError || !validatedUser) {
          console.log('Critical route: Session validation failed - clearing session')
          isSessionValid = false
          const logoutUrl = new URL('/login', req.url)
          logoutUrl.searchParams.set('sessionExpired', 'true')
          logoutUrl.searchParams.set('redirectTo', pathname)
          return NextResponse.redirect(logoutUrl)
        }
      }

      // For patient dashboard refresh, be more lenient but still validate gently
      if (isPasienDashboard) {
        const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser(session.access_token)

        // Only redirect if it's a clear auth error, not temporary issues
        if (userError && (userError.message.includes('Invalid session') || userError.message.includes('expired'))) {
          console.log('Patient dashboard: Clear auth error - clearing session')
          isSessionValid = false
          const logoutUrl = new URL('/login', req.url)
          logoutUrl.searchParams.set('sessionExpired', 'true')
          logoutUrl.searchParams.set('redirectTo', pathname)
          return NextResponse.redirect(logoutUrl)
        }

        // For other validation errors, allow the request to proceed
        if (userError) {
          console.log('Patient dashboard: Temporary validation error, allowing request')
        }
      }

      // Get user profile with role - use cached approach for non-critical routes
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // Only treat as error if it's a critical route
        if (profileError && isCriticalRoute) {
          console.log('Critical route: Profile not found - clearing session')
          isSessionValid = false
          const logoutUrl = new URL('/login', req.url)
          logoutUrl.searchParams.set('sessionExpired', 'true')
          logoutUrl.searchParams.set('redirectTo', pathname)
          return NextResponse.redirect(logoutUrl)
        }

        // For non-critical routes, prioritize database profile, then metadata, then default
        userRole = profile?.role || user.user_metadata?.role || 'pasien'
        console.log('🔍 Middleware: userRole set to:', userRole, 'from profile:', profile?.role, 'metadata:', user.user_metadata?.role, 'fallback: pasien')
      } catch (profileError) {
        if (isCriticalRoute) {
          console.log('Critical route: Profile error - clearing session')
          isSessionValid = false
          const logoutUrl = new URL('/login', req.url)
          logoutUrl.searchParams.set('sessionExpired', 'true')
          logoutUrl.searchParams.set('redirectTo', pathname)
          return NextResponse.redirect(logoutUrl)
        }
        // For non-critical routes, fallback to metadata then default
        userRole = user.user_metadata?.role || 'pasien'
        console.log('🔍 Middleware: Catch block - userRole set to:', userRole, 'from metadata:', user.user_metadata?.role, 'fallback: pasien')
      }
    } catch (error) {
      console.error('Error in middleware session validation:', error)
      // Only clear session for critical errors on critical routes
      const isCriticalRoute = ['/admin', '/profile'].some(route => pathname.startsWith(route))
      if (isCriticalRoute) {
        isSessionValid = false
        const logoutUrl = new URL('/login', req.url)
        logoutUrl.searchParams.set('sessionExpired', 'true')
        logoutUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(logoutUrl)
      }
      // For dashboard refresh, be more lenient - try to get role from metadata
      userRole = session.user?.user_metadata?.role || 'pasien'
    }
  }

  // Check if current path is auth route
  const isAuthRoute = ['/login', '/register'].includes(pathname)

  // Redirect authenticated users from auth routes to role-based dashboard
  if (isAuthRoute && session && userRole && isSessionValid) {
    console.log('🔍 Middleware: Auth route redirect for role:', userRole, 'from:', pathname)
    const dashboardUrl = getRoleBasedRedirect(userRole, req.url)
    console.log('🔍 Middleware: Redirecting to:', dashboardUrl.toString())
    return NextResponse.redirect(dashboardUrl)
  }

  // Handle root redirect
  if (pathname === '/') {
    if (session && userRole && isSessionValid) {
      const dashboardUrl = getRoleBasedRedirect(userRole, req.url)
      return NextResponse.redirect(dashboardUrl)
    } else {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Check route access based on role
  if (session && userRole && isSessionValid) {
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