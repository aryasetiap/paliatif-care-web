import { createClient } from './supabase'

export interface AuthenticatedUser {
  id: string
  email: string
  role?: string
}

/**
 * Safely gets the current authenticated user with proper error handling
 * Returns null if user is not authenticated or session is invalid
 */
export const getAuthenticatedUser = async (): Promise<AuthenticatedUser | null> => {
  try {
    const supabase = createClient()

    // Get session first
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return null
    }

    // Verify user still exists in auth system
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(session.access_token)

    if (userError || !user) {
      return null
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, return user info without role
    // This allows the app to handle missing profiles gracefully
    if (profileError) {
      return {
        id: user.id,
        email: user.email || '',
      }
    }

    return {
      id: user.id,
      email: user.email || '',
      role: profile.role,
    }
  } catch {
    return null
  }
}

/**
 * Validates if user is authenticated and has specific role
 */
export const validateUserWithRole = async (
  requiredRole?: string
): Promise<AuthenticatedUser | null> => {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  if (requiredRole && user.role !== requiredRole) {
    return null
  }

  return user
}

/**
 * Middleware-like function for API routes to check authentication
 */
export const requireAuth = async (requiredRole?: string) => {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  if (requiredRole && user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`)
  }

  return user
}

/**
 * Gets user ID with fallback for compatibility
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await getAuthenticatedUser()
  return user?.id || null
}

/**
 * Gets user email with fallback for compatibility
 */
export const getCurrentUserEmail = async (): Promise<string | null> => {
  const user = await getAuthenticatedUser()
  return user?.email || null
}
