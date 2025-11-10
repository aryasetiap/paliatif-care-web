'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChevronRight,
  BookOpen,
  AlertTriangle,
  ShieldCheck,
  Users,
  Library,
  Circle,
  Menu,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TOCItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  isActive: boolean
  level?: number
}

interface TableOfContentsProps {
  items: TOCItem[]
  className?: string
  sticky?: boolean
  compact?: boolean
}

export function TableOfContents({ items, className = '', sticky = true, compact = false }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState('')
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map(item => item.id)
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [items])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Header height
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
      setIsMobileOpen(false)
    }
  }

  const getIcon = (IconComponent: React.ComponentType<{ className?: string }>) => {
    return <IconComponent className="h-4 w-4" />
  }

  const containerClasses = `
    ${sticky ? 'sticky top-24' : ''}
    ${compact ? 'w-full' : 'w-64 lg:w-72'}
    ${className}
  `

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg rounded-full w-14 h-14 p-0"
        >
          <AnimatePresence mode="wait">
            {isMobileOpen ? (
              <X key="close" className="h-6 w-6" />
            ) : (
              <Menu key="menu" className="h-6 w-6" />
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* TOC Content */}
      <AnimatePresence>
        {(isMobileOpen || !compact) && (
          <motion.div
            initial={compact ? { x: 300, opacity: 0 } : { opacity: 0, y: 20 }}
            animate={compact ? { x: 0, opacity: 1 } : { opacity: 1, y: 0 }}
            exit={compact ? { x: 300, opacity: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`
              ${containerClasses}
              ${compact && isMobileOpen ? 'fixed right-0 top-0 h-full z-50 overflow-y-auto' : ''}
              ${compact && !isMobileOpen ? 'lg:block hidden' : ''}
            `}
          >
            <Card className="bg-white/90 backdrop-blur-md border-sky-200 shadow-lg">
              <CardContent className="p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Library className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-sky-900">
                      {compact ? 'Navigasi' : 'Daftar Isi'}
                    </h3>
                  </div>
                  {compact && isMobileOpen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileOpen(false)}
                      className="lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* TOC Items */}
                <nav className="space-y-1">
                  {items.map((item, index) => {
                    const isActive = activeSection === item.id
                    const Icon = item.icon

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className={`
                            w-full justify-start h-auto p-3 text-left transition-all duration-300
                            ${isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                              : 'text-sky-700 hover:bg-sky-50 hover:text-sky-900'
                            }
                            ${compact ? 'p-2' : 'p-3'}
                          `}
                          onClick={() => scrollToSection(item.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 ${compact ? 'mt-0.5' : 'mt-0.5'}`}>
                              {isActive ? (
                                <Circle className="h-2 w-2 fill-current" />
                              ) : (
                                getIcon(Icon)
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${compact ? 'text-sm' : 'text-sm'}`}>
                                {item.title}
                              </div>
                              {item.description && !compact && (
                                <div className={`text-xs mt-1 opacity-80 ${
                                  isActive ? 'text-white/90' : 'text-sky-600'
                                }`}>
                                  {item.description}
                                </div>
                              )}
                            </div>

                            {/* Arrow */}
                            <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                              isActive ? 'rotate-90 text-white' : 'text-sky-400'
                            }`} />
                          </div>
                        </Button>
                      </motion.div>
                    )
                  })}
                </nav>

                {/* Reading Progress */}
                {!compact && (
                  <div className="mt-6 pt-6 border-t border-sky-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-sky-600 font-medium">Progress Baca</span>
                      <span className="text-xs text-sky-600">
                        {Math.round((items.findIndex(item => item.id === activeSection) + 1) / items.length * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-sky-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(items.findIndex(item => item.id === activeSection) + 1) / items.length * 100}%`
                        }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                {!compact && (
                  <div className="mt-6 pt-6 border-t border-sky-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                        <div className="text-xs font-medium text-sky-900">{items.length}</div>
                        <div className="text-xs text-sky-600">Topik</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <Circle className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                        <div className="text-xs font-medium text-sky-900">
                          {items.findIndex(item => item.id === activeSection) + 1}
                        </div>
                        <div className="text-xs text-sky-600">Sekarang</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Helper function to generate TOC items for disease pages
export function generateDiseaseTOCItems(disease: any): Array<{
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  isActive: boolean
}> {
  const items = [
    {
      id: 'overview',
      title: 'Ringkasan',
      icon: BookOpen,
      description: 'Informasi umum penyakit',
      isActive: false,
    },
    {
      id: 'symptoms',
      title: 'Gejala & Tanda',
      icon: AlertTriangle,
      description: 'Tanda-tanda klinis',
      isActive: false,
    },
    {
      id: 'causes',
      title: 'Penyebab',
      icon: ShieldCheck,
      description: 'Faktor penyebab utama',
      isActive: false,
    },
  ]

  // Add risk factors if available
  if (disease.risk_factors) {
    items.push({
      id: 'risk-factors',
      title: 'Faktor Risiko',
      icon: Users,
      description: 'Faktor risiko terkait',
      isActive: false,
    })
  }

  // Add references if available
  if (disease.references && disease.references.length > 0) {
    items.push({
      id: 'references',
      title: 'Referensi',
      icon: BookOpen,
      description: 'Sumber ilmiah',
      isActive: false,
    })
  }

  return items
}

// Compact TOC for mobile/drawer usage
export function CompactTableOfContents({ items, className = '' }: { items: any[], className?: string }) {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map(item => item.id)
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [items])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => {
        const isActive = activeSection === item.id
        const Icon = item.icon

        return (
          <Button
            key={item.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => scrollToSection(item.id)}
            className={`
              text-xs h-8 px-3 transition-all duration-300
              ${isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'border-sky-300 text-sky-700 hover:bg-sky-50'
              }
            `}
          >
            <Icon className="h-3 w-3 mr-1" />
            {item.title}
          </Button>
        )
      })}
    </div>
  )
}