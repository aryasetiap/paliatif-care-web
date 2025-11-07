'use client'

import { useState } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Footer } from './footer'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { cn } from '@/lib/utils'

interface LayoutWrapperProps {
  children: React.ReactNode
  showSidebar?: boolean
  showFooter?: boolean
  user?: {
    name: string
    email: string
    avatar?: string
  }
  className?: string
}

export function LayoutWrapper({
  children,
  showSidebar = true,
  showFooter = true,
  user
}: LayoutWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header user={user} />

        <div className="flex">
          {showSidebar && (
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={toggleSidebar}
              className="hidden md:block"
            />
          )}

          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            <div className="container mx-auto px-4 py-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>

            {showFooter && <Footer />}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Alternative layout for public pages (no sidebar)
export function PublicLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className={cn("flex-1", className)}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  )
}

// Minimal layout for auth pages
export function AuthLayout({
  children,
  title,
  description
}: {
  children: React.ReactNode
  title?: string
  description?: string
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-light p-12 items-center justify-center text-white">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur mx-auto mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary">
                <div className="h-4 w-4 rounded-full bg-current" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">PelitaCare</h1>
            <p className="text-lg opacity-90">
              Platform edukasi dan skrining paliatif berbasis keperawatan
            </p>
          </div>

          <div className="space-y-4 text-sm opacity-75">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-white" />
              <span>Edukasi 8 Penyakit Terminal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-white" />
              <span>Form Screening Interaktif</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-white" />
              <span>Hasil & Rekomendasi Medis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-white" />
              <span>Export PDF Laporan Pasien</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <ErrorBoundary>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{title || 'Selamat Datang'}</h2>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}