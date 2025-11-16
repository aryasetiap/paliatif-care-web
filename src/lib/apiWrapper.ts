import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit, authRateLimit, screeningRateLimit, guestRateLimit } from './rateLimit'

type ApiHandler = (request: NextRequest, context?: any) => Promise<NextResponse>

interface ApiOptions {
  rateLimit?: 'api' | 'auth' | 'screening' | 'guest'
  requireAuth?: boolean
}

export function withApiHandler(
  handler: ApiHandler,
  options: ApiOptions = {}
) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResult = await getRateLimiter(options.rateLimit)(request)
        if (rateLimitResult instanceof NextResponse) {
          return rateLimitResult
        }
      }

      // Call the actual handler
      const response = await handler(request, context)

      // Add rate limit headers if applicable
      if (options.rateLimit) {
        const rateLimitResult = await getRateLimiter(options.rateLimit)(request)
        if ('headers' in rateLimitResult) {
          Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
            response.headers.set(key, value as string)
          })
        }
      }

      return response

    } catch {
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'Something went wrong. Please try again later.'
        },
        { status: 500 }
      )
    }
  }
}

function getRateLimiter(type: ApiOptions['rateLimit']) {
  switch (type) {
    case 'auth':
      return authRateLimit
    case 'screening':
      return screeningRateLimit
    case 'guest':
      return guestRateLimit
    default:
      return apiRateLimit
  }
}

// Convenience functions for specific use cases
export function withPublicApi(handler: ApiHandler) {
  return withApiHandler(handler, { rateLimit: 'api' })
}

export function withAuthApi(handler: ApiHandler) {
  return withApiHandler(handler, { rateLimit: 'auth', requireAuth: true })
}

export function withScreeningApi(handler: ApiHandler) {
  return withApiHandler(handler, { rateLimit: 'screening' })
}

export function withGuestApi(handler: ApiHandler) {
  return withApiHandler(handler, { rateLimit: 'guest' })
}