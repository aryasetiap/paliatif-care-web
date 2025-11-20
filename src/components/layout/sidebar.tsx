'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Calendar,
} from 'lucide-react'

interface SidebarProps {
  className?: string
  collapsed?: boolean
  onToggle?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: any
  description?: string
  badge?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Ringkasan dan statistik',
  },
  {
    title: 'Pasien',
    href: '/pasien',
    icon: Users,
    description: 'Kelola data pasien',
    badge: 'Baru',
  },
  {
    title: 'Screening',
    href: '/screening',
    icon: FileText,
    description: 'Form screening pasien',
    children: [
      {
        title: 'Screening Baru',
        href: '/screening/new',
        icon: FileText,
      },
      {
        title: 'Riwayat Screening',
        href: '/screening/history',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'Edukasi',
    href: '/edukasi',
    icon: BookOpen,
    description: 'Materi edukasi penyakit',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Analisis dan laporan',
  },
]

const secondaryNavigation: NavItem[] = [
  {
    title: 'Pengaturan',
    href: '/settings',
    icon: Settings,
    description: 'Pengaturan aplikasi',
  },
  {
    title: 'Bantuan',
    href: '/help',
    icon: HelpCircle,
    description: 'Pusat bantuan',
  },
]

export function Sidebar({ className, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    const isExpanded = expandedItems.includes(item.title)
    const hasChildren = item.children && item.children.length > 0

    const content = (
      <>
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <span className="ml-auto mr-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            )}
          </>
        )}
      </>
    )

    const buttonContent = (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start transition-healthcare",
          level > 0 && "ml-4 h-8 text-sm",
          collapsed && "h-10 w-10 p-0",
          isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        onClick={() => {
          if (hasChildren) {
            toggleExpanded(item.title)
          }
        }}
      >
        {content}
      </Button>
    )

    if (collapsed && level === 0) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="w-full">{buttonContent}</div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="space-y-1">
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <div className="w-full">
        {hasChildren ? (
          <div>{buttonContent}</div>
        ) : (
          <Link href={item.href} className="w-full">
            {buttonContent}
          </Link>
        )}
        {hasChildren && !collapsed && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavItemComponent key={child.title} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background",
        collapsed ? "w-16" : "w-64",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-bold">Sihat</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-2">
            {!collapsed && (
              <h4 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Menu Utama
              </h4>
            )}
            {navigation.map((item) => (
              <NavItemComponent key={item.title} item={item} />
            ))}
          </div>

          {/* Secondary Navigation */}
          <div className="space-y-2">
            {!collapsed && (
              <h4 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lainnya
              </h4>
            )}
            {secondaryNavigation.map((item) => (
              <NavItemComponent key={item.title} item={item} />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="border-t p-4">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="rounded-lg bg-primary/10 p-3">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Pro Tip</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Gunakan shortcut Ctrl+K untuk pencarian cepat
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              <p>Sihat v1.0.0</p>
              <p>© 2025 DuaKode Labs</p>
            </div>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">Sihat v1.0.0</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}