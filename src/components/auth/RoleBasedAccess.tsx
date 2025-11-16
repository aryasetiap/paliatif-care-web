'use client'

import React from 'react'
import { useUserRole, usePermissions } from '@/lib/stores/authStore'
import { UserRole } from '@/lib/types'

interface RoleBasedAccessProps {
  children: React.ReactNode
  roles?: UserRole[]
  role?: UserRole
  permission?: keyof typeof import('@/lib/types').ROLE_PERMISSIONS[UserRole]
  fallback?: React.ReactNode
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  roles,
  role,
  permission,
  fallback = null
}) => {
  const userRole = useUserRole()
  const permissions = usePermissions()

  // If no user is logged in
  if (!userRole) {
    return <>{fallback}</>
  }

  // Check if user has the required specific role
  if (role && userRole !== role) {
    return <>{fallback}</>
  }

  // Check if user has any of the required roles
  if (roles && !roles.includes(userRole)) {
    return <>{fallback}</>
  }

  // Check if user has the required permission
  if (permission && permissions && !permissions[permission]) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Higher-order component for role protection
export const withRoleProtection = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    roles?: UserRole[]
    role?: UserRole
    permission?: keyof typeof import('@/lib/types').ROLE_PERMISSIONS[UserRole]
    fallback?: React.ReactNode
  }
) => {
  const WrappedComponent = (props: P) => (
    <RoleBasedAccess {...options}>
      <Component {...props} />
    </RoleBasedAccess>
  )

  WrappedComponent.displayName = `withRoleProtection(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Specific role components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleBasedAccess role="admin" fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const PerawatOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleBasedAccess role="perawat" fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const PasienOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleBasedAccess role="pasien" fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const NotPasien: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleBasedAccess roles={['admin', 'perawat']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

// Permission-based components
export const CanAccessAdminDashboard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleBasedAccess permission="canAccessAdminDashboard" fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const CanManageUsers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleBasedAccess permission="canManageUsers" fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const CanViewAllPatients: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleBasedAccess permission="canViewAllPatients" fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const CanScreenSelf: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleBasedAccess permission="canScreenSelf" fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

// Hook for role-based conditional rendering
export const useRoleBasedAccess = () => {
  const userRole = useUserRole()
  const permissions = usePermissions()

  return {
    userRole,
    permissions,
    isAdmin: userRole === 'admin',
    isPerawat: userRole === 'perawat',
    isPasien: userRole === 'pasien',
    canAccess: (role: UserRole) => userRole === role,
    canAccessAny: (roles: UserRole[]) => userRole ? roles.includes(userRole) : false,
    hasPermission: (permission: keyof typeof import('@/lib/types').ROLE_PERMISSIONS[UserRole]) =>
      permissions ? permissions[permission] : false
  }
}