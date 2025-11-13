'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Stethoscope, Home, ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  backHref?: string
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  backHref = '/',
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Modern Healthcare Background - Enhanced for better coverage */}
      <div className="fixed inset-0 bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400" />
      <div className="fixed inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Floating Medical Icons - Healthcare Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-5 md:left-10 opacity-10 md:opacity-20"
        >
          <Heart className="w-12 h-12 md:w-16 md:h-16 text-blue-600/30" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-40 right-5 md:right-20 opacity-10 md:opacity-20"
        >
          <Stethoscope className="w-16 h-16 md:w-20 md:h-20 text-blue-600/30" />
        </motion.div>
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
          className="absolute bottom-40 left-5 md:left-20 opacity-10 md:opacity-20"
        >
          <Heart className="w-12 h-12 md:w-16 md:h-16 text-blue-600/30" />
        </motion.div>
      </div>

      {/* Healthcare Grid Pattern */}
      <div
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'slide 20s linear infinite',
        }}
      />

      {/* Navigation - Enhanced Responsiveness */}
      <div className="relative z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo - Same as Homepage */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-1.5 sm:p-2 shadow-lg border border-white/20">
                  <Stethoscope className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-sky-900 group-hover:text-blue-600 transition-colors">
                  Pelita
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 ml-1">
                    Care
                  </span>
                </h1>
              </div>
            </Link>

            {/* Back Button */}
            {showBackButton ? (
              <Link
                href={backHref}
                className="inline-flex items-center space-x-1.5 sm:space-x-2 text-sky-700 hover:text-sky-900 transition-colors group"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm sm:text-base">Kembali</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 sm:space-x-2 text-sky-700 hover:text-sky-900 transition-colors group"
              >
                <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-y-1 transition-transform" />
                <span className="font-medium text-sm sm:text-base">Beranda</span>
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content - Enhanced Responsive Design */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pb-8 w-full">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Header - Improved Responsive Spacing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="relative mb-4 sm:mb-6">
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-3 sm:p-4 shadow-xl border border-white/20 mx-auto w-fit">
                <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-sky-900 mb-1.5 sm:mb-2">
              Pelita{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Care
              </span>
            </h1>
            {subtitle && <p className="text-sky-700 text-sm sm:text-base">{subtitle}</p>}
            <p className="text-sky-700 text-base sm:text-lg font-semibold mt-1.5 sm:mt-2">
              {title}
            </p>
          </motion.div>

          {/* Form Container - Enhanced Responsive Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-2xl blur-xl opacity-40"></div>

              {/* Form Content */}
              <div className="relative bg-white/95 backdrop-blur-lg border border-sky-300 rounded-2xl p-4 sm:p-6 shadow-xl">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
