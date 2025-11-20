'use client'

import { Loader2, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  )
}

interface FullPageLoadingProps {
  message?: string
  showLogo?: boolean
}

export function FullPageLoading({
  message = 'Memuat...',
  showLogo = true
}: FullPageLoadingProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {showLogo && (
        <div className="mb-8 flex items-center space-x-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">Sihat</span>
        </div>
      )}

      <LoadingSpinner size="lg" className="text-primary mb-4" />

      <p className="text-muted-foreground animate-pulse">{message}</p>

      {/* Additional loading animation */}
      <div className="mt-8 flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-primary/60"
            style={{
              animation: `pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
  lines?: number
  showAvatar?: boolean
}

export function SkeletonCard({
  className,
  lines = 3,
  showAvatar = false
}: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border p-6 space-y-4', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <div className="skeleton-healthcare h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skeleton-healthcare h-4 w-3/4 rounded" />
            <div className="skeleton-healthcare h-3 w-1/2 rounded" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'skeleton-healthcare h-4 rounded',
              i === lines - 1 && 'w-3/4'
            )}
          />
        ))}
      </div>
    </div>
  )
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className
}: SkeletonTableProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Table header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton-healthcare h-8 rounded" />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 border-t pt-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="skeleton-healthcare h-6 rounded" />
          ))}
        </div>
      ))}
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-current"
          style={{
            animation: `pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

interface ProgressLoadingProps {
  progress?: number
  showPercentage?: boolean
  className?: string
}

export function ProgressLoading({
  progress = 0,
  showPercentage = true,
  className
}: ProgressLoadingProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Memproses...</span>
        {showPercentage && (
          <span className="font-medium">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}