'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/authStore'

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [mounted, setMounted] = useState(false)
  const { loadUser } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Only load user data after component is mounted
      // This prevents hydration issues and aggressive session validation
      const initializeAuth = async () => {
        try {
          await loadUser()
        } catch {}
      }

      // Add small delay to ensure app is fully loaded
      const timer = setTimeout(initializeAuth, 100)

      return () => clearTimeout(timer)
    }
  }, [mounted, loadUser])

  // Set up auth state listener
  useEffect(() => {
    if (!mounted) return

    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in
        useAuthStore.getState().setUser(session.user)
        await useAuthStore.getState().loadProfile()
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        useAuthStore.getState().logout()
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed - this is normal, don't logout
      }
    })

    return () => subscription.unsubscribe()
  }, [mounted])

  // Don't render children until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
