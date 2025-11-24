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

  // Set up auth state listener with better WebSocket management
  useEffect(() => {
    if (!mounted) return

    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id)

      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in
        useAuthStore.getState().setUser(session.user)
        await useAuthStore.getState().loadProfile()
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        useAuthStore.getState().logout()
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed - this is normal, don't logout
        console.log('Token refreshed successfully')
      } else if (event === 'INITIAL_SESSION') {
        // Initial session loaded - handle gracefully
        if (session?.user) {
          useAuthStore.getState().setUser(session.user)
          // Don't load profile immediately to avoid race conditions
          setTimeout(() => {
            useAuthStore.getState().loadProfile()
          }, 500)
        }
      }
    })

    return () => {
      // Properly cleanup subscription to prevent memory leaks
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [mounted])

  // Add cleanup on page unload to prevent lingering connections
  useEffect(() => {
    const handleBeforeUnload = () => {
      const supabase = createClient()
      supabase.removeAllChannels()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

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
