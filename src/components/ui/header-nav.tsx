'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Activity, Settings } from 'lucide-react'
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
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center"
            >
              <Image
                src="/assets/logo_poltekes.png"
                alt="Poltekes"
                width={40}
                height={40}
                className="object-contain"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              onClick={(e) => handleAnchorLinkClick(e, '#features')}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-gray-50/80 ${
                isScrolled
                  ? 'text-gray-700 hover:text-blue-600'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Fitur
            </a>
            <a
              href="#about"
              onClick={(e) => handleAnchorLinkClick(e, '#about')}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-gray-50/80 ${
                isScrolled
                  ? 'text-gray-700 hover:text-blue-600'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Tentang
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className={`px-5 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
              }`}
              asChild
            >
              <Link href="/login">Masuk</Link>
            </Button>
            <Button
              size="sm"
              className={`px-5 py-2 text-sm font-medium transition-all duration-300 rounded-full shadow-md hover:shadow-lg ${
                isScrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 hover:bg-gray-50'
              }`}
              asChild
            >
              <Link href="/register">Daftar</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden transition-all duration-300 rounded-xl group ${
                isScrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/20 backdrop-blur-md'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <motion.span
                  animate={{
                    rotate: isMenuOpen ? 45 : 0,
                    y: isMenuOpen ? 8 : 0,
                  }}
                  className={`absolute top-1.5 left-0 w-6 h-0.5 transition-colors duration-300 ${
                    isScrolled ? 'bg-gray-700' : 'bg-white'
                  }`}
                />
                <motion.span
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                  }}
                  className={`absolute top-3 left-0 w-6 h-0.5 transition-colors duration-300 ${
                    isScrolled ? 'bg-gray-700' : 'bg-white'
                  }`}
                />
                <motion.span
                  animate={{
                    rotate: isMenuOpen ? -45 : 0,
                    y: isMenuOpen ? -8 : 0,
                  }}
                  className={`absolute top-4.5 left-0 w-6 h-0.5 transition-colors duration-300 ${
                    isScrolled ? 'bg-gray-700' : 'bg-white'
                  }`}
                />
              </div>
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
          className={`md:hidden mt-3 rounded-xl overflow-hidden transition-all duration-300 ${
            isScrolled
              ? 'bg-white shadow-xl border border-gray-100'
              : 'bg-white/95 backdrop-blur-md border border-gray-200'
          }`}
        >
          <nav className="p-3 space-y-1">
            <a
              href="#features"
              className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={(e) => {
                handleAnchorLinkClick(e, '#features')
                setIsMenuOpen(false)
              }}
            >
              <div className="w-6 h-6 flex items-center justify-center rounded bg-blue-100">
                <Activity className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span>Fitur</span>
            </a>
            <a
              href="#about"
              className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={(e) => {
                handleAnchorLinkClick(e, '#about')
                setIsMenuOpen(false)
              }}
            >
              <div className="w-6 h-6 flex items-center justify-center rounded bg-blue-100">
                <Settings className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span>Tentang</span>
            </a>

            <div className="pt-2 mt-2 border-t border-gray-200 space-y-2">
              <Link
                href="/login"
                className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Masuk
              </Link>
              <Button
                className="w-full px-4 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                asChild
              >
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  Daftar
                </Link>
              </Button>
            </div>
          </nav>
        </motion.div>
      </div>
    </header>
  )
}
