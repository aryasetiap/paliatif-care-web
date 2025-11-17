'use client'

import { createClient } from '@/lib/supabase'

interface SessionCleanupOptions {
  redirectTo?: string
  showSuccessMessage?: boolean
}

/**
 * Clears the current user session and optionally redirects
 * Useful for handling invalid/expired sessions
 */
export const clearSession = async (options: SessionCleanupOptions = {}) => {
  const supabase = createClient()
  const { redirectTo = '/login', showSuccessMessage = false } = options

  try {
    // First try to clear session via API for comprehensive cleanup
    try {
      const response = await fetch('/api/auth/force-logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'session_cleanup' }),
      })

      if (!response.ok) {
      }
    } catch {}

    // Always do client-side cleanup as fallback
    await supabase.auth.signOut({ scope: 'global' })

    // Clear any local storage data related to authentication
    if (typeof window !== 'undefined') {
      // Clear auth-related localStorage keys
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Clear session storage
      sessionStorage.clear()

      // Clear any cookies related to auth (client-side only)
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        if (name.includes('supabase') || name.includes('auth')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
        }
      })
    }

    // Redirect if specified
    if (redirectTo && typeof window !== 'undefined') {
      const url = new URL(redirectTo, window.location.origin)
      if (showSuccessMessage) {
        url.searchParams.set('message', 'Session cleared successfully')
      }
      window.location.href = url.toString()
    }

    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

/**
 * Hook for session cleanup with better UX
 */
export const useSessionCleanup = () => {

  const handleExpiredSession = async (redirectTo?: string) => {
    await clearSession({
      redirectTo: redirectTo || '/login?sessionExpired=true',
      showSuccessMessage: false,
    })
  }

  const handleManualLogout = async (redirectTo?: string) => {
    await clearSession({
      redirectTo: redirectTo || '/login?loggedOut=true',
      showSuccessMessage: true,
    })
  }

  return {
    clearSession,
    handleExpiredSession,
    handleManualLogout,
  }
}

/**
 * Validates if current session is still valid
 * Returns true if valid, false if invalid
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const supabase = createClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return false
    }

    // Validate user exists
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(session.access_token)

    if (userError || !user) {
      return false
    }

    // Validate profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return false
    }

    return true
  } catch {
    return false
  }
}
