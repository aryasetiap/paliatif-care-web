import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Simple in-memory store for rate limiting
// In production, consider using Redis or external cache
const store: RateLimitStore = {}

function cleanupStore() {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime <= now) {
      delete store[key]
    }
  })
}

export function rateLimit(options: {
  windowMs?: number
  max?: number
  message?: string
} = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later.'
  } = options

  return async (request: NextRequest) => {
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      cleanupStore()
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'

    const key = `rl:${ip}`
    const now = Date.now()

    // Get or initialize rate limit data
    if (!store[key] || store[key].resetTime <= now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      }
    } else {
      store[key].count++
    }

    const record = store[key]

    // Set rate limit headers
    const headers = {
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': Math.max(0, max - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
      'X-RateLimit-Reset-After': Math.max(0, Math.ceil((record.resetTime - now) / 1000)).toString()
    }

    // Check if limit exceeded
    if (record.count > max) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message
        },
        {
          status: 429,
          headers
        }
      )
    }

    return { headers }
  }
}

// Specific rate limits for different endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many API requests, please try again later.'
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strict limit for auth endpoints
  message: 'Too many authentication attempts, please try again later.'
})

export const screeningRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Allow 10 screenings per minute
  message: 'Too many screening requests, please wait before trying again.'
})

export const guestRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Strict limit for guest users
  message: 'Too many guest requests, please wait before trying again.'
})