import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { signUp, signIn, signOut, getCurrentUser, getProfile } from '../supabase'

interface AuthState {
  user: User | null
  profile: any | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  loadProfile: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      profile: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ loading: true, error: null })

        try {
          const { user } = await signIn(email, password)
          set({
            user,
            isAuthenticated: true,
            loading: false
          })

          // Load user profile after successful login
          if (user) {
            await get().loadProfile()
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            loading: false
          })
          throw error
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        set({ loading: true, error: null })

        try {
          const { user } = await signUp(email, password, fullName)
          set({
            user,
            isAuthenticated: true,
            loading: false
          })

          // Load user profile after successful registration
          if (user) {
            await get().loadProfile()
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            loading: false
          })
          throw error
        }
      },

      logout: async () => {
        set({ loading: true })

        try {
          await signOut()
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            loading: false,
            error: null
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Logout failed',
            loading: false
          })
        }
      },

      loadUser: async () => {
        set({ loading: true })

        try {
          const user = await getCurrentUser()
          set({
            user,
            isAuthenticated: !!user,
            loading: false
          })

          // Load profile if user exists
          if (user) {
            await get().loadProfile()
          }
        } catch {
          // Don't show error for unauthorized users
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            loading: false,
            error: null
          })
        }
      },

      loadProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          const profile = await getProfile(user.id)
          set({ profile })
        } catch {
          // Profile might not exist yet, which is okay for new users
          // Optional: Log this for debugging
          // console.warn('Profile not found:', error)
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ loading })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        // Reload user data when store rehydrates
        if (state?.isAuthenticated) {
          state.loadUser()
        }
      }
    }
  )
)

// Selectors
export const useUser = () => useAuthStore((state) => state.user)
export const useProfile = () => useAuthStore((state) => state.profile)
export const useAuthLoading = () => useAuthStore((state) => state.loading)
export const useAuthError = () => useAuthStore((state) => state.error)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)