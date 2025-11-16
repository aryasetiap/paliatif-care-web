'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Menu, X, FileText, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { handleAnchorLinkNavigation } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/stores/authStore'
import { useRouter } from 'next/navigation'

export default function HeaderNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { isAuthenticated, logout, loading } = useAuthStore()

  // Load user on component mount
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      useAuthStore.getState().loadUser()
    }
  }, [loading, isAuthenticated])

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      // Log error for debugging while avoiding console statement in production
      // Consider using a proper logging service in production
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Logout failed:', error)
      }
    }
  }

  // Handle screening navigation
  const handleScreeningClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      router.push('/login')
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      // Change header style when scrolled more than 50px
      if (scrollPosition > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-200'
          : 'bg-transparent'
      }`}
    >
      {/* Background Pattern - Same as Footer */}
      {!isScrolled && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
          {/* Logo Section - Poltekes Image */}
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center"
            >
              <Image
                src="/assets/logo_poltekes.png"
                alt="Poltekes"
                width="180"
                height="48"
                priority
                quality={95}
                className="object-contain transition-all duration-300 group-hover:opacity-90"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 ml-auto">
            {/* Skrining Link */}
            <Link
              href="/screening/new"
              onClick={handleScreeningClick}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 ${
                isScrolled
                  ? 'text-gray-800 hover:text-gray-900 hover:bg-blue-50'
                  : 'text-gray-800 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              {isAuthenticated ? 'Skrining' : 'Skrining'}
            </Link>

            {/* Screening Tamu Link */}
            <Link
              href="/screening/guest"
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-green-50 ${
                isScrolled
                  ? 'text-green-700 hover:text-green-900 hover:bg-green-50'
                  : 'text-green-700 hover:text-green-900 hover:bg-green-50/20'
              }`}
            >
              Screening Tamu
            </Link>

            {/* Edukasi Link */}
            <Link
              href="/edukasi"
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 ${
                isScrolled
                  ? 'text-gray-800 hover:text-gray-900 hover:bg-blue-50'
                  : 'text-gray-800 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              Edukasi
            </Link>

            {/* Fitur Link */}
            <a
              href="#features"
              onClick={(e) => handleAnchorLinkNavigation(router, '#features', e)}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 ${
                isScrolled
                  ? 'text-gray-800 hover:text-gray-900 hover:bg-blue-50'
                  : 'text-gray-800 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              Fitur Layanan
            </a>

            {/* Tentang Link */}
            <a
              href="#about"
              onClick={(e) => handleAnchorLinkNavigation(router, '#about', e)}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 ${
                isScrolled
                  ? 'text-gray-800 hover:text-gray-900 hover:bg-blue-50'
                  : 'text-gray-800 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              Tentang
            </a>

            {/* Auth Buttons - Show based on auth state */}
            {isAuthenticated ? (
              <>
                {/* User Dashboard Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full hover:scale-105 border backdrop-blur-sm ${
                    isScrolled
                      ? 'border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-400'
                      : 'border-gray-700 text-gray-700 hover:text-gray-900 hover:bg-white/15 hover:border-white/30'
                  }`}
                  asChild
                >
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-6 py-2 text-sm font-medium transition-all duration-300 rounded-full hover:scale-105 border backdrop-blur-sm ${
                    isScrolled
                      ? 'border-red-300 text-red-700 hover:text-red-900 hover:bg-red-50 hover:border-red-400'
                      : 'border-red-700 text-red-700 hover:text-red-900 hover:bg-red-50/15 hover:border-white/30'
                  }`}
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-6 py-2 text-sm font-medium transition-all duration-300 rounded-full hover:scale-105 border backdrop-blur-sm ${
                    isScrolled
                      ? 'border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-400'
                      : 'border-gray-700 text-gray-700 hover:text-gray-900 hover:bg-white/15 hover:border-white/30'
                  }`}
                  asChild
                >
                  <Link href="/login">Masuk</Link>
                </Button>

                {/* Register Button */}
                <Button
                  size="sm"
                  className="px-6 py-2 text-sm font-medium transition-all duration-300 rounded-full shadow-md hover:shadow-lg hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"
                  asChild
                >
                  <Link href="/register">Daftar</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden transition-all duration-300 rounded-xl group text-white hover:bg-white/20 backdrop-blur-md"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={
            isMenuOpen ? { opacity: 1, y: 0, height: 'auto' } : { opacity: 0, y: -10, height: 0 }
          }
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="md:hidden overflow-hidden"
        >
          <div
            className={`mt-3 rounded-xl border transition-all duration-300 ${
              isScrolled
                ? 'bg-white/95 backdrop-blur-md border-gray-200 shadow-lg'
                : 'bg-white/95 backdrop-blur-md border-blue-200 shadow-lg'
            }`}
          >
            <nav className="p-4 space-y-2">
              {/* Skrining Link */}
              <Link
                href="/screening/new"
                onClick={(e) => {
                  handleScreeningClick(e)
                  setIsMenuOpen(false)
                }}
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/20 border border-amber-400/30">
                  <FileText className="h-4 w-4 text-amber-400" />
                </div>
                <span>{isAuthenticated ? 'Skrining' : 'Skrining'}</span>
              </Link>

              {/* Screening Tamu Link */}
              <Link
                href="/screening/guest"
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-green-700 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/20 border border-green-400/30">
                  <FileText className="h-4 w-4 text-green-400" />
                </div>
                <span>Screening Tamu</span>
              </Link>

              {/* Edukasi Link */}
              <Link
                href="/edukasi"
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/20 border border-green-400/30">
                  <BookOpen className="h-4 w-4 text-green-400" />
                </div>
                <span>Edukasi</span>
              </Link>

              <a
                href="#features"
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={(e) => {
                  handleAnchorLinkNavigation(router, '#features', e)
                  setIsMenuOpen(false)
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                </div>
                <span>Fitur Layanan</span>
              </a>

              {/* Tentang Kami Link */}
              <a
                href="#about"
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={(e) => {
                  handleAnchorLinkNavigation(router, '#about', e)
                  setIsMenuOpen(false)
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/20 border border-purple-400/30">
                  <Users className="h-4 w-4 text-purple-400" />
                </div>
                <span>Tentang Kami</span>
              </a>

              {/* Auth Section */}
              <div className="pt-2 mt-2 border-t border-gray-200 space-y-2">
                {isAuthenticated ? (
                  <>
                    {/* User Dashboard */}
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                        <User className="h-4 w-4 text-blue-400" />
                      </div>
                      <span>Dashboard</span>
                    </Link>

                    {/* Logout Button */}
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors border border-red-300"
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 border border-red-400/30 mr-3">
                        <LogOut className="h-4 w-4 text-red-400" />
                      </div>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Masuk
                    </Link>
                    <Button
                      className="w-full px-4 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-colors border-0"
                      asChild
                    >
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        Daftar Sekarang
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
