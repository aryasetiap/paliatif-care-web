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
            // Only clear auth state if it's a true auth failure (not network issues)
            const currentState = get()
            // If we have existing user data, might be a temporary issue - don't clear immediately
            if (currentState.user) {
              set({ loading: false })
              return
            }

            // Clear auth state if no existing user data
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
          // Check if it's a network/temporary error vs auth error
          const errorMessage = error instanceof Error ? error.message : String(error)

          if (
            errorMessage.includes('Invalid session') ||
            errorMessage.includes('session expired')
          ) {
            // Clear auth state for auth errors
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
            set({ loading: false })
          }
        }
      },

      loadProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          const profile = await getProfile(user.id)
          let userRole = profile?.role || null

          // If no role in profile, try multiple fallbacks
          if (!userRole) {
            // Fallback 1: Check user metadata
            if (user.user_metadata?.role) {
              userRole = user.user_metadata.role as UserRole
            }
            // Fallback 2: Default to 'pasien'
            else {
              userRole = 'pasien'
            }
          }

          const permissions = userRole ? ROLE_PERMISSIONS[userRole as UserRole] : null

          set({
            profile,
            userRole,
            permissions,
          })
        } catch {
          // Profile doesn't exist, create it automatically
          // Profile not found, creating automatically

          // Get user metadata for role and name
          const userMetadata = user?.user_metadata || {}
          const fullName = userMetadata.full_name || 'Unknown User'

          // CRITICAL FIX: Don't use fallback 'pasien' if we have a different role intent
          // Check if there was a role passed during registration
          const roleFromMetadata = userMetadata.role as UserRole
          const role = roleFromMetadata || 'pasien' // Only fallback to pasien if no role in metadata

          try {
            const supabase = createClient()

            // First check if profile exists (avoid duplicate creation)
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id, full_name, role, created_at')
              .eq('id', user.id)
              .single()

            if (existingProfile) {
              // Profile already exists, using existing profile
              const permissions = existingProfile.role
                ? ROLE_PERMISSIONS[existingProfile.role as UserRole]
                : null

              set({
                profile: existingProfile,
                userRole: existingProfile.role,
                permissions,
              })
              return
            }

            // Profile doesn't exist, create it
            const { error: createError } = await supabase.rpc('create_user_profile', {
              p_user_id: user.id,
              p_full_name: fullName,
              p_role: role,
            })

            if (createError) {
              // Fallback: Try direct insert
              const { error: insertError } = await supabase.from('profiles').insert({
                id: user.id,
                full_name: fullName,
                role: role,
              })

              if (insertError) {
                // Auto profile creation failed
                set({
                  profile: null,
                  userRole: null,
                  permissions: null,
                })
              } else {
                // Profile created successfully via direct insert
                set({
                  profile: { id: user.id, full_name: fullName, role, created_at: new Date().toISOString() },
                  userRole: role,
                  permissions: role ? ROLE_PERMISSIONS[role] : null,
                })
              }
            } else {
              // Retry loading the profile to ensure it was created correctly
              const profile = await getProfile(user.id)
              const finalRole: UserRole = profile?.role || role
              const permissions = finalRole ? ROLE_PERMISSIONS[finalRole] : null

              set({
                profile,
                userRole: finalRole,
                permissions,
              })

              // Profile created successfully
            }
          } catch {
            // Auto profile creation error
            set({
              profile: null,
              userRole: null,
              permissions: null,
            })
          }
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
        // Reload user data when store rehydrates, but with better error handling
        if (state?.isAuthenticated && typeof window !== 'undefined') {
          // Add longer delay to avoid immediate API calls on rehydration
          setTimeout(() => {
            // Check if user still exists before loading
            if (state?.user) {
              state.loadUser().catch((error) => {
                // Don't immediately logout on refresh - let middleware handle session validation
                // Only logout if it's a critical auth error
                if (
                  error?.message?.includes('Invalid session') ||
                  error?.message?.includes('session expired')
                ) {
                  state.logout()
                }
                // For other errors (network issues, race conditions), keep the session
              })
            }
          }, 500) // Increased delay to 500ms
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
