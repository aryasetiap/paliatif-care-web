'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Stethoscope } from 'lucide-react'
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

  // Get current header height for smooth scroll calculations
  const getHeaderHeight = () => {
    if (typeof window !== 'undefined') {
      const header = document.querySelector('header')
      return header ? header.offsetHeight : 88
    }
    return 88
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? 'bg-white/98 backdrop-blur-xl shadow-xl border-b border-gray-100/50 py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 ease-out transform group-hover:scale-110 ${
              isScrolled
                ? 'healthcare-gradient shadow-lg shadow-primary/25'
                : 'bg-white/20 backdrop-blur-md shadow-xl shadow-white/10'
            }`}>
              <div className={`absolute inset-0 rounded-xl healthcare-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <Stethoscope className={`relative h-5 w-5 transition-all duration-300 ${
                isScrolled ? 'text-white' : 'text-white'
              }`} />
            </div>
            <span className={`font-bold text-xl tracking-tight transition-all duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              Pelita
              <span className={`block text-sm font-normal transition-all duration-300 ${
                isScrolled ? 'text-primary' : 'text-primary-light'
              }`}>
                Care
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              onClick={(e) => handleAnchorLinkClick(e, '#features')}
              className={`relative transition-all duration-300 font-medium group ${
                isScrolled
                  ? 'text-gray-600 hover:text-primary'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Fitur
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? 'bg-primary' : 'bg-white'
              }`}></span>
            </a>
            <a
              href="#about"
              onClick={(e) => handleAnchorLinkClick(e, '#about')}
              className={`relative transition-all duration-300 font-medium group ${
                isScrolled
                  ? 'text-gray-600 hover:text-primary'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Tentang
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? 'bg-primary' : 'bg-white'
              }`}></span>
            </a>
            <Button
              size="sm"
              className={`relative transition-all duration-300 font-medium rounded-full group shadow-lg hover:shadow-xl transform hover:scale-105 px-6 py-2 border-0 ${
                isScrolled
                  ? 'bg-gradient-to-r from-primary to-primary-light hover:from-primary/90 hover:to-primary-light/90 text-white'
                  : 'bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white hover:text-primary hover:border-transparent'
              }`}
              asChild
            >
              <Link href="/login">
                Masuk
              </Link>
            </Button>
            <Button
              className={`relative transition-all duration-300 font-medium rounded-full overflow-hidden group shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isScrolled
                  ? 'healthcare-gradient text-white hover:from-primary/90 hover:to-primary-light/90'
                  : 'bg-white text-primary hover:bg-primary-cream/50'
              }`}
              asChild
            >
              <Link href="/register">
                Daftar
                <div className={`absolute inset-0 transition-all duration-300 ${
                  isScrolled
                    ? 'healthcare-gradient opacity-0 group-hover:opacity-100'
                    : 'bg-primary opacity-0 group-hover:opacity-100'
                }`}></div>
              </Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden transition-all duration-300 rounded-xl group ${
              isScrolled
                ? 'text-gray-700 hover:bg-gray-100 hover:scale-110'
                : 'text-white hover:bg-white/20 backdrop-blur-md hover:scale-110'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative w-5 h-5">
              <span className={`absolute top-1 left-0 w-5 h-0.5 transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              } ${
                isScrolled ? 'bg-gray-700' : 'bg-white'
              }`}></span>
              <span className={`absolute top-2.5 left-0 w-5 h-0.5 transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              } ${
                isScrolled ? 'bg-gray-700' : 'bg-white'
              }`}></span>
              <span className={`absolute top-4 left-0 w-5 h-0.5 transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              } ${
                isScrolled ? 'bg-gray-700' : 'bg-white'
              }`}></span>
            </div>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={isMenuOpen ? { opacity: 1, y: 0, height: 'auto' } : { opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`md:hidden mt-4 rounded-2xl overflow-hidden transition-all duration-300 ${
            isScrolled
              ? 'bg-white/98 backdrop-blur-xl shadow-2xl border border-gray-100/50'
              : 'bg-white/20 backdrop-blur-md border border-white/30'
          }`}
        >
          <nav className="p-6 space-y-4">
            <motion.a
              href="#features"
              initial={{ opacity: 0, x: -20 }}
              animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className={`block transition-colors duration-300 font-medium ${
                isScrolled
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              } py-3 px-4 rounded-lg`}
              onClick={(e) => {
                handleAnchorLinkClick(e, '#features')
                setIsMenuOpen(false)
              }}
            >
              Fitur
            </motion.a>
            <motion.a
              href="#about"
              initial={{ opacity: 0, x: -20 }}
              animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className={`block transition-colors duration-300 font-medium ${
                isScrolled
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              } py-3 px-4 rounded-lg`}
              onClick={(e) => {
                handleAnchorLinkClick(e, '#about')
                setIsMenuOpen(false)
              }}
            >
              Tentang
            </motion.a>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: 0.3 }}
              className="pt-2 border-t border-gray-200/20"
            >
              <Link
                href="/login"
                className={`block transition-colors duration-300 font-medium ${
                  isScrolled
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                } py-3 px-4 rounded-lg`}
                onClick={() => setIsMenuOpen(false)}
              >
                Masuk
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: 0.4 }}
            >
              <Button
                className={`w-full transition-all duration-300 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    : 'bg-white text-blue-900 hover:bg-gray-50'
                }`}
                asChild
              >
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  Daftar
                </Link>
              </Button>
            </motion.div>
          </nav>
        </motion.div>
      </div>
    </header>
  )
}