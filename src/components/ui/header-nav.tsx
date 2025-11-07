'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Stethoscope, BookOpen, Users, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { handleAnchorLinkClick } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function HeaderNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

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
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-white/10'
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
              <img
                alt="Poltekes"
                loading="lazy"
                width="150"
                height="40"
                decoding="async"
                data-nimg="1"
                className="object-contain transition-all duration-300 group-hover:opacity-90"
                style={{color: 'transparent'}}
                srcSet="/_next/image?url=%2Fassets%2Flogo_poltekes.png&amp;w=48&amp;q=75 1x, /_next/image?url=%2Fassets%2Flogo_poltekes.png&amp;w=96&amp;q=75 2x"
                src="/_next/image?url=%2Fassets%2Flogo_poltekes.png&amp;w=96&amp;q=75"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 ml-auto">
            {/* Fitur Link */}
            <a
              href="#features"
              onClick={(e) => handleAnchorLinkClick(e, '#features')}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-white/10 ${
                isScrolled
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Fitur
            </a>
            {/* Tentang Link */}
            <a
              href="#about"
              onClick={(e) => handleAnchorLinkClick(e, '#about')}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-white/10 ${
                isScrolled
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Tentang
            </a>

            {/* Login Button */}
            <Button
              variant="ghost"
              size="sm"
              className="px-6 py-2 text-sm font-medium transition-all duration-300 rounded-full hover:scale-105 border border-white/20 backdrop-blur-sm text-white/90 hover:text-white hover:bg-white/15 hover:border-white/30"
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
          </nav>

          {/* Mobile menu button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden transition-all duration-300 rounded-xl group text-white hover:bg-white/20 backdrop-blur-md"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
          <div className={`mt-3 rounded-xl border border-white/10 transition-all duration-300 ${
            isScrolled
              ? 'bg-slate-900/95 backdrop-blur-md'
              : 'bg-slate-900/95 backdrop-blur-md'
          }`}
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
          >
            <nav className="p-4 space-y-2">
              <a
                href="#features"
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={(e) => {
                  handleAnchorLinkClick(e, '#features')
                  setIsMenuOpen(false)
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                </div>
                <span>Fitur Layanan</span>
              </a>
              <a
                href="#about"
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={(e) => {
                  handleAnchorLinkClick(e, '#about')
                  setIsMenuOpen(false)
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/20 border border-purple-400/30">
                  <Users className="h-4 w-4 text-purple-400" />
                </div>
                <span>Tentang Kami</span>
              </a>

              <div className="pt-2 mt-2 border-t border-white/10 space-y-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/20 backdrop-blur-sm"
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
              </div>
            </nav>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
