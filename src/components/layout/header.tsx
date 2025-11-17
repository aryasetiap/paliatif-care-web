'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, User, Settings, LogOut, FileText, Activity } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

interface HeaderProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const { toast } = useToast()

  const handleLogout = () => {
    toast({
      title: 'Berhasil keluar',
      description: 'Anda telah keluar dari sistem.',
    })
    // Implement logout logic here
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity, description: 'Overview utama' },
    { name: 'Pasien', href: '/pasien', icon: User, description: 'Data pasien' },
    { name: 'Screening', href: '/screening/new', icon: FileText, description: 'Screening baru' },
    { name: 'Edukasi', href: '/edukasi', icon: Activity, description: '8 penyakit terminal' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 w-80">
              <MobileNav navigation={navigation} />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Image
                src="/assets/logo_poltekes_2.png"
                alt="Poltekes"
                width="180"
                height="48"
                priority
                quality={95}
                className="object-contain transition-all duration-300"
              />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-gradient-primary block leading-tight">
                PelitaCare
              </span>
              <span className="text-xs text-muted-foreground">Sistem Paliatif Terpadu</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.name}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="relative"
              >
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 mx-0.5',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-foreground/70 hover:text-foreground hover:bg-gray-50/80'
                  )}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className="flex-shrink-0"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      {item.description}
                    </span>
                  </div>
                </Link>
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-light text-white font-semibold">
                        {user.name
                          .split(' ')
                          .map((word) => word[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span>Profil Saya</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Pengaturan</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  asChild
                  className="font-medium hover:bg-gray-50 transition-colors"
                >
                  <Link href="/login">Masuk</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  className="modern-button healthcare-gradient hover:from-primary/90 hover:to-primary-light/90 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Link href="/register">Daftar</Link>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

interface MobileNavProps {
  navigation: Array<{
    name: string
    href: string
    icon: any
    description: string
  }>
}

function MobileNav({ navigation }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-3 p-6 border-b border-gray-100 bg-gray-50/50"
      >
        <motion.img
          alt="Poltekes"
          loading="lazy"
          width="150"
          height="40"
          decoding="async"
          data-nimg="1"
          className="object-contain"
          style={{ color: 'transparent', height: 'auto', maxHeight: '2.5rem' }}
          srcSet="/_next/image?url=%2Fassets%2Flogo_poltekes_2.png&amp;w=48&amp;q=75 1x, /_next/image?url=%2Fassets%2Flogo_poltekes_2.png&amp;w=96&amp;q=75 2x"
          src="/_next/image?url=%2Fassets%2Flogo_poltekes_2.png&amp;w=96&amp;q=75"
        />
        <div>
          <span className="font-bold text-lg text-gradient-primary block leading-tight">
            PelitaCare
          </span>
          <span className="text-xs text-muted-foreground">Sistem Paliatif Terpadu</span>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center space-x-4 rounded-xl px-4 py-4 text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                    : 'text-foreground/70 hover:text-foreground hover:bg-gray-50/80'
                )}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <div className="flex flex-col leading-tight flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground leading-tight">
                    {item.description}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveNav"
                    className="w-2 h-2 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <div className="text-xs text-muted-foreground text-center">
          <p>Poliiteknik Kesehatan</p>
          <p>Sistem Paliatif Terpadu v1.0</p>
        </div>
      </div>
    </div>
  )
}
