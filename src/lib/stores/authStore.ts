import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Profile, UserRole, ROLE_PERMISSIONS } from '../types'
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getProfile,
  resetPassword,
  updatePassword,
  updateProfileRole,
  createClient,
} from '../supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  userRole: UserRole | null
  permissions: (typeof ROLE_PERMISSIONS)[UserRole] | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  loadProfile: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (newPassword: string) => Promise<void>
  updateUserRole: (role: UserRole) => Promise<void>
  hasPermission: (permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]) => boolean
  clearError: () => void
  setLoading: (loading: boolean) => void
  setUser: (user: User) => void
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
      userRole: null,
      permissions: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ loading: true, error: null })

        try {
          // Clear persistent storage first to ensure fresh state
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage')
          }

          const { user } = await signIn(email, password)

          // Clear any existing state to ensure fresh load
          set({
            user,
            profile: null,
            isAuthenticated: true,
            userRole: null,
            permissions: null,
            loading: false,
          })

          // Force load profile from database to ensure correct role
          await get().loadProfile()

          const finalUserRole = get().userRole

          // Double-check role from metadata if still null
          if (!finalUserRole) {
            if (user.user_metadata?.role) {
              const metadataRole = user.user_metadata.role as UserRole
              set({ userRole: metadataRole })
            } else {
              set({ userRole: 'pasien' })
            }
          }

          // CRITICAL: Double-check the role by directly querying the database one more time
          // This ensures we have the most up-to-date role from the database
          try {
            const supabase = createClient()
            const { data: freshProfile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single()

            if (freshProfile?.role) {
              const freshRole = freshProfile.role as UserRole
              const permissions = ROLE_PERMISSIONS[freshRole]
              set({
                userRole: freshRole,
                permissions,
              })
            }
          } catch {
            // Could not refresh role from database, using loaded role
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            loading: false,
          })
          throw error
        }
      },

      register: async (email: string, password: string, fullName: string, role: UserRole) => {
        set({ loading: true, error: null })

        try {
          const { user } = await signUp(email, password, fullName, role)

          set({
            user,
            isAuthenticated: true,
            loading: false,
          })

          // Load user profile after successful registration
          if (user) {
            await get().loadProfile()
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            loading: false,
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
            userRole: null,
            permissions: null,
            loading: false,
            error: null,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Logout failed',
            loading: false,
          })
        }
      },

      loadUser: async () => {
        set({ loading: true })

        try {
          const user = await getCurrentUser()

          // Check if user session is valid
          if (!user) {
            // More lenient session validation - check if we have existing state
            const currentState = get()

            // If we have existing user data and no clear auth error, might be temporary
            if (currentState.user && currentState.isAuthenticated) {
              set({ loading: false })
              return
            }

            // Clear auth state only if no existing valid session
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              userRole: null,
              permissions: null,
              loading: false,
              error: null,
            })
            return
          }

          set({
            user,
            isAuthenticated: true,
            loading: false,
          })

          // Load profile if user exists
          await get().loadProfile()
        } catch (error) {
          // More lenient error handling - distinguish between auth and network errors
          const errorMessage = error instanceof Error ? error.message : String(error)

          const isAuthError =
            errorMessage.includes('Invalid session') ||
            errorMessage.includes('session expired') ||
            errorMessage.includes('refresh_token_not_found') ||
            errorMessage.includes('invalid claim')

          if (isAuthError) {
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              userRole: null,
              permissions: null,
              loading: false,
              error: null,
            })
          } else {
            // For network/temporary errors, keep existing session
            const currentState = get()
            if (currentState.user) {
              set({ loading: false })
            } else {
              // Only clear if we have no existing user
              set({
                user: null,
                profile: null,
                isAuthenticated: false,
                userRole: null,
                permissions: null,
                loading: false,
                error: null,
              })
            }
          }
        }
      },

      loadProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          // Try to get profile from database first
          const profile = await getProfile(user.id)

          if (profile && profile.role) {
            // Profile exists and has role - use it directly
            const userRole = profile.role as UserRole
            const permissions = ROLE_PERMISSIONS[userRole]

            set({
              profile,
              userRole,
              permissions,
            })
            return
          }

          // If no valid profile from getProfile, try direct database query
          try {
            const supabase = createClient()
            const { data: freshProfile } = await supabase
              .from('profiles')
              .select('id, full_name, role, created_at')
              .eq('id', user.id)
              .single()

            if (freshProfile && freshProfile.role) {
              const userRole = freshProfile.role as UserRole
              const permissions = ROLE_PERMISSIONS[userRole]

              set({
                profile: freshProfile,
                userRole,
                permissions,
              })
              return
            }
          } catch {}

          // Fallback to metadata ONLY as last resort
          let userRole = null
          if (user.user_metadata?.role) {
            userRole = user.user_metadata.role as UserRole
          } else {
            // Last resort: default to 'pasien' only if everything else fails
            userRole = 'pasien'
          }

          const permissions = userRole ? ROLE_PERMISSIONS[userRole as UserRole] : null
          const fallbackProfile: Profile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || 'Unknown User',
            role: userRole as UserRole,
            created_at: new Date().toISOString(),
          }

          set({
            profile: fallbackProfile,
            userRole: userRole as UserRole,
            permissions,
          })
        } catch {
          // Final fallback to metadata
          const userRole = (user.user_metadata?.role as UserRole) || 'pasien'
          const permissions = ROLE_PERMISSIONS[userRole]
          const fallbackProfile: Profile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || 'Unknown User',
            role: userRole,
            created_at: new Date().toISOString(),
          }

          set({
            profile: fallbackProfile,
            userRole: userRole as UserRole,
            permissions,
          })
        }
      },

      forgotPassword: async (email: string) => {
        set({ loading: true, error: null })

        try {
          await resetPassword(email)
          set({ loading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Password reset failed',
            loading: false,
          })
          throw error
        }
      },

      resetPassword: async (newPassword: string) => {
        set({ loading: true, error: null })

        try {
          await updatePassword(newPassword)
          set({ loading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Password update failed',
            loading: false,
          })
          throw error
        }
      },

      clearError: () => set({ error: null }),

      updateUserRole: async (role: UserRole) => {
        const { user } = get()
        if (!user) throw new Error('User not authenticated')

        set({ loading: true, error: null })
        try {
          await updateProfileRole(user.id, role)

          // Update local state with new role and permissions
          const permissions = ROLE_PERMISSIONS[role]
          set({
            userRole: role,
            permissions,
            loading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update role',
            loading: false,
          })
          throw error
        }
      },

      hasPermission: (permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]) => {
        const { permissions } = get()
        return permissions ? permissions[permission] : false
      },

      setLoading: (loading: boolean) => set({ loading }),

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        // Reload user data when store rehydrates, but with much better error handling
        if (state?.isAuthenticated && state?.user && typeof window !== 'undefined') {
          // Gentle revalidation - don't be aggressive about logging out
          setTimeout(async () => {
            try {
              // Only attempt to load user if we have a valid user object
              if (state?.user?.id) {
                await state.loadUser()
              }
            } catch (error) {
              // Only logout for clear authentication errors, not network issues
              const errorMessage = error instanceof Error ? error.message : String(error)
              const isAuthError =
                errorMessage.includes('Invalid session') ||
                errorMessage.includes('session expired') ||
                errorMessage.includes('refresh_token_not_found')

              if (isAuthError) {
                await state.logout()
              } else {
                // For network/temporary errors, keep the session alive
              }
            }
          }, 1000) // Increased delay to allow for stable app state
        }
      },
    }
  )
)

// Selectors
export const useUser = () => useAuthStore((state) => state.user)
export const useProfile = () => useAuthStore((state) => state.profile)
export const useAuthLoading = () => useAuthStore((state) => state.loading)
export const useAuthError = () => useAuthStore((state) => state.error)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useUserRole = () => useAuthStore((state) => state.userRole)
export const usePermissions = () => useAuthStore((state) => state.permissions)
export const useHasPermission = (permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]) =>
  useAuthStore((state) => (state.permissions ? state.permissions[permission] : false))

// Role-based hooks
export const useIsAdmin = () => useAuthStore((state) => state.userRole === 'admin')
export const useIsPerawat = () => useAuthStore((state) => state.userRole === 'perawat')
export const useIsPasien = () => useAuthStore((state) => state.userRole === 'pasien')
