import { UserRole, ROLE_PERMISSIONS } from '../types'
import React from 'react'
import { useUserRole } from '../stores/authStore'

// Middleware function to check user role and permissions
export const requireRole = (userRole: UserRole | null, requiredRole: UserRole): boolean => {
  return userRole === requiredRole
}

// Middleware function to check if user has any of the required roles
export const requireAnyRole = (userRole: UserRole | null, requiredRoles: UserRole[]): boolean => {
  return userRole ? requiredRoles.includes(userRole) : false
}

// Middleware function to check specific permissions
export const requirePermission = (
  userRole: UserRole | null,
  permission: keyof typeof ROLE_PERMISSIONS[UserRole]
): boolean => {
  if (!userRole) return false

  return ROLE_PERMISSIONS[userRole]?.[permission] || false
}

// Higher-order function for role-based route protection
export const withRoleProtection = (
  handler: (req: Request, context?: any) => Promise<Response>,
  requiredRole?: UserRole,
  requiredRoles?: UserRole[],
  requiredPermission?: keyof typeof import('../types').ROLE_PERMISSIONS[UserRole]
) => {
  return async (req: Request, context?: any) => {
    // Get user session and role from the request
    const userRole = await getUserRoleFromRequest(req)

    if (!userRole) {
      return new Response('Unauthorized - No user session found', { status: 401 })
    }

    // Check role requirements
    if (requiredRole && !requireRole(userRole, requiredRole)) {
      return new Response('Forbidden - Insufficient role privileges', { status: 403 })
    }

    if (requiredRoles && !requireAnyRole(userRole, requiredRoles)) {
      return new Response('Forbidden - Role not allowed', { status: 403 })
    }

    if (requiredPermission && !requirePermission(userRole, requiredPermission)) {
      return new Response('Forbidden - Permission denied', { status: 403 })
    }

    // If all checks pass, execute the original handler
    return handler(req, context)
  }
}

// Helper function to extract user role from request
export const getUserRoleFromRequest = async (_req: Request): Promise<UserRole | null> => {
  try {
    // This would need to be implemented based on your auth system
    // For now, we'll need to create a server-side auth helper
    const { createServerClient } = await import('../supabase')
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get user profile with role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role || null
  } catch {
    // Error logged silently for debugging
    return null
  }
}

// React component wrapper for role-based UI protection
export const RoleProtectedComponent = ({
  userRole,
  requiredRole,
  requiredRoles,
  requiredPermission,
  children,
  fallback = null,
}: {
  userRole: UserRole | null
  requiredRole?: UserRole
  requiredRoles?: UserRole[]
  requiredPermission?: keyof typeof import('../types').ROLE_PERMISSIONS[UserRole]
  children: React.ReactNode
  fallback?: React.ReactNode
}) => {
  if (!userRole) {
    return <>{fallback}</>
  }

  if (requiredRole && !requireRole(userRole, requiredRole)) {
    return <>{fallback}</>
  }

  if (requiredRoles && !requireAnyRole(userRole, requiredRoles)) {
    return <>{fallback}</>
  }

  if (requiredPermission && !requirePermission(userRole, requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Hook for client-side role checking
export const useRoleProtection = () => {
  const userRole = useUserRole()

  return {
    userRole,
    isAdmin: userRole === 'admin',
    isPerawat: userRole === 'perawat',
    isPasien: userRole === 'pasien',
    hasRole: (role: UserRole) => requireRole(userRole, role),
    hasAnyRole: (roles: UserRole[]) => requireAnyRole(userRole, roles),
    hasPermission: (permission: keyof typeof import('../types').ROLE_PERMISSIONS[UserRole]) =>
      requirePermission(userRole, permission),
  }
}