import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Profile, UserRole, ROLE_PERMISSIONS } from '../types'
import { signUp, signIn, signOut, getCurrentUser, getProfile, resetPassword, updatePassword, updateProfileRole, createClient } from '../supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  userRole: UserRole | null
  permissions: typeof ROLE_PERMISSIONS[UserRole] | null
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
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS[UserRole]) => boolean
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

      register: async (email: string, password: string, fullName: string, role: UserRole) => {
        set({ loading: true, error: null })

        try {
          const { user } = await signUp(email, password, fullName, role)
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
            userRole: null,
            permissions: null,
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
          const userRole = profile?.role || null
          const permissions = userRole ? ROLE_PERMISSIONS[userRole as UserRole] : null

          set({
            profile,
            userRole,
            permissions
          })
        } catch {
          // Profile doesn't exist, create it automatically
          // Profile not found, creating automatically

          // Get user metadata for role and name
          const userMetadata = user?.user_metadata || {}
          const fullName = userMetadata.full_name || 'Unknown User'
          const role = (userMetadata.role as UserRole) || 'pasien'

          try {
            const supabase = createClient()

            // First check if profile exists (avoid duplicate creation)
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id, full_name, role')
              .eq('id', user.id)
              .single()

            if (existingProfile) {
              // Profile already exists, using existing profile
              const permissions = existingProfile.role ? ROLE_PERMISSIONS[existingProfile.role as UserRole] : null

              set({
                profile: {
                  ...existingProfile,
                  created_at: (existingProfile as any).created_at || new Date().toISOString()
                },
                userRole: existingProfile.role,
                permissions
              })
              return
            }

            // Profile doesn't exist, create it
            const { error: createError } = await supabase.rpc('create_user_profile', {
              p_user_id: user.id,
              p_full_name: fullName,
              p_role: role
            })

            if (createError) {
              // Auto profile creation failed
              set({
                profile: null,
                userRole: null,
                permissions: null
              })
            } else {
              // Retry loading the profile
              const profile = await getProfile(user.id)
              const permissions = role ? ROLE_PERMISSIONS[role] : null

              set({
                profile,
                userRole: role,
                permissions
              })

              // Profile created successfully
            }
          } catch {
            // Auto profile creation error
            set({
              profile: null,
              userRole: null,
              permissions: null
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
            loading: false
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
            loading: false
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
            loading: false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update role',
            loading: false
          })
          throw error
        }
      },

      hasPermission: (permission: keyof typeof ROLE_PERMISSIONS[UserRole]) => {
        const { permissions } = get()
        return permissions ? permissions[permission] : false
      },

      setLoading: (loading: boolean) => set({ loading })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        permissions: state.permissions
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
export const useUserRole = () => useAuthStore((state) => state.userRole)
export const usePermissions = () => useAuthStore((state) => state.permissions)
export const useHasPermission = (permission: keyof typeof ROLE_PERMISSIONS[UserRole]) =>
  useAuthStore((state) => state.permissions ? state.permissions[permission] : false)

// Role-based hooks
export const useIsAdmin = () => useAuthStore((state) => state.userRole === 'admin')
export const useIsPerawat = () => useAuthStore((state) => state.userRole === 'perawat')
export const useIsPasien = () => useAuthStore((state) => state.userRole === 'pasien')