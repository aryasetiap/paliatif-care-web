'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserCog,
  ClipboardList,
  Activity,
  Shield,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/authStore'
import '@/styles/modern-patterns.css'

// Helper function untuk format tanggal
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid Date'
  }
}

interface AdminStats {
  totalUsers: number
  totalPatients: number
  totalScreenings: number
  activeUsers: number
  screeningsThisMonth: number
  highRiskScreenings: number
}

interface RecentActivity {
  id: string
  type: 'user' | 'screening' | 'patient'
  user_name?: string
  patient_name?: string
  action: string
  created_at: string
}

interface UserStats {
  admin_count: number
  perawat_count: number
  pasien_count: number
}

export default function AdminDashboardPage() {
  // Load cached data from sessionStorage on mount
  const [stats, setStats] = useState<AdminStats | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('adminDashboardStats')
      return cached ? JSON.parse(cached) : null
    }
    return null
  })

  const [userStats, setUserStats] = useState<UserStats | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('adminDashboardUserStats')
      return cached ? JSON.parse(cached) : null
    }
    return null
  })

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('adminDashboardActivities')
      return cached ? JSON.parse(cached) : []
    }
    return []
  })

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const router = useRouter()
  const { user, userRole } = useAuthStore()

  // Save data to sessionStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && stats) {
      sessionStorage.setItem('adminDashboardStats', JSON.stringify(stats))
    }
  }, [stats])

  useEffect(() => {
    if (typeof window !== 'undefined' && userStats) {
      sessionStorage.setItem('adminDashboardUserStats', JSON.stringify(userStats))
    }
  }, [userStats])

  useEffect(() => {
    if (typeof window !== 'undefined' && recentActivities.length > 0) {
      sessionStorage.setItem('adminDashboardActivities', JSON.stringify(recentActivities))
    }
  }, [recentActivities])

  useEffect(() => {
    // Check authentication state
    if (!user) {
      // If user is null, redirect to login
      router.push('/login')
      return
    }

    // If user exists but role is not determined, wait
    if (!userRole) {
      return
    }

    // If user is not admin, redirect
    if (userRole !== 'admin') {
      router.push('/login')
      return
    }

    // User is admin - load data if first time or if no data exists
    if (!hasLoadedOnce) {
      setHasLoadedOnce(true)
      // If we have cached data, show it immediately and refresh in background
      if (stats || userStats || recentActivities.length > 0) {
        setLoading(false)
        // Refresh data in background after 1 second
        setTimeout(() => {
          loadAdminData()
        }, 1000)
      } else {
        // No cached data, load immediately
        loadAdminData()
      }
    } else {
      // If we already have data, just set loading to false
      setLoading(false)
    }
  }, [user, userRole, hasLoadedOnce, stats, userStats, recentActivities.length, router])

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      const supabase = createClient()
      supabase.removeAllChannels()
    }
  }, [])

  const clearCache = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminDashboardStats')
      sessionStorage.removeItem('adminDashboardUserStats')
      sessionStorage.removeItem('adminDashboardActivities')
      setStats(null)
      setUserStats(null)
      setRecentActivities([])
      setLoading(true)
      loadAdminData()
    }
  }

  const loadAdminData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Add a small delay to ensure auth state is stable and WebSocket connections settle
      await new Promise(resolve => setTimeout(resolve, 200))

      const supabase = createClient()

      // Check if we have a valid session first with retry logic
      let sessionData = null
      let sessionError = null
      let retryCount = 0
      const maxRetries = 3

      while (retryCount < maxRetries) {
        const result = await supabase.auth.getSession()
        sessionData = result.data
        sessionError = result.error

        if (!sessionError && sessionData?.session) {
          break
        }

        retryCount++
        if (retryCount < maxRetries) {
          console.log(`Session check retry ${retryCount}/${maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (sessionError || !sessionData?.session) {
        console.error('No valid session found after retries:', sessionError)
        // Don't immediately redirect, check if we have user data
        const { user } = useAuthStore.getState()
        if (user) {
          console.log('User exists in store but session issue - continuing with cached data')
        } else {
          router.push('/login')
          return
        }
      }

      // Load data with better error handling - split into smaller chunks
      let totalUsers = 0, totalPatients = 0, totalScreenings = 0
      let activeUsers = 0, screeningsThisMonth = 0, highRiskScreenings = 0

      try {
        // Basic counts first
        const [usersCount, patientsCount, screeningsCount] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('screenings').select('*', { count: 'exact', head: true }),
        ])
        totalUsers = usersCount.count || 0
        totalPatients = patientsCount.count || 0
        totalScreenings = screeningsCount.count || 0
      } catch (error) {
        console.error('Error loading basic counts:', error)
      }

      try {
        // More complex counts
        const [activeCount, monthlyCount, riskCount] = await Promise.all([
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase
            .from('screenings')
            .select('*', { count: 'exact', head: true })
            .gte(
              'created_at',
              new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
            ),
          supabase
            .from('screenings')
            .select('*', { count: 'exact', head: true })
            .in('risk_level', ['high', 'critical']),
        ])
        activeUsers = activeCount.count || 0
        screeningsThisMonth = monthlyCount.count || 0
        highRiskScreenings = riskCount.count || 0
      } catch (error) {
        console.error('Error loading detailed counts:', error)
      }

      // Load user stats by role
      let userStatsData = { admin_count: 0, perawat_count: 0, pasien_count: 0 }
      try {
        const { data: usersByRole } = await supabase
          .from('profiles')
          .select('role')
          .not('role', 'is', null)

        if (usersByRole) {
          userStatsData = usersByRole.reduce(
            (acc, user) => {
              const role = user.role as 'admin' | 'perawat' | 'pasien'
              acc[`${role}_count`] = (acc[`${role}_count`] || 0) + 1
              return acc
            },
            { admin_count: 0, perawat_count: 0, pasien_count: 0 }
          )
        }
      } catch (error) {
        console.error('Error loading user stats:', error)
      }

      // Load recent activities with better error handling
      let recentScreenings: any[] = []
      let recentUsers: any[] = []

      try {
        const { data: screeningsData } = await supabase
          .from('screenings')
          .select('id, esas_data, screening_type, created_at, is_guest, guest_identifier')
          .order('created_at', { ascending: false })
          .limit(5)
        recentScreenings = screeningsData || []
      } catch (error) {
        console.error('Error loading recent screenings:', error)
      }

      try {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3)
        recentUsers = usersData || []
      } catch (error) {
        console.error('Error loading recent users:', error)
      }

      const activities: RecentActivity[] = [
        ...recentScreenings.map((s) => ({
          id: s.id,
          type: 'screening' as const,
          user_name: s.esas_data?.identity?.name || s.patients?.name || 'Guest User',
          action: `Melakukan screening ${s.screening_type || 'ESAS'}`,
          created_at: s.created_at,
        })),
        ...recentUsers.map((u) => ({
          id: u.full_name + u.created_at,
          type: 'user' as const,
          user_name: u.full_name,
          action: 'Pengguna baru bergabung',
          created_at: u.created_at,
        })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      // Set the final data
      setStats({
        totalUsers,
        totalPatients,
        totalScreenings,
        activeUsers,
        screeningsThisMonth,
        highRiskScreenings,
      })

      setUserStats(userStatsData)
      setRecentActivities(activities)

    } catch (error) {
      console.error('Unexpected error in loadAdminData:', error)

      // Set default values on error to prevent UI from breaking
      setStats({
        totalUsers: 0,
        totalPatients: 0,
        totalScreenings: 0,
        activeUsers: 0,
        screeningsThisMonth: 0,
        highRiskScreenings: 0,
      })
      setUserStats({ admin_count: 0, perawat_count: 0, pasien_count: 0 })
      setRecentActivities([])
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Show loading spinner only during initial load when no data exists
  if (loading && hasLoadedOnce && !stats && !userStats && recentActivities.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard admin...</p>
        </div>
      </div>
    )
  }

  // If we have an authentication issue, show error
  if (user && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Anda tidak memiliki akses ke halaman ini.</p>
          <Button onClick={() => router.push('/login')}>
            Kembali ke Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen mt-16">
      <HeaderNav />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-sky-900 mb-2">Dashboard Admin</h1>
              <p className="text-sky-600">Kelola Sistem Paliatif Care</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAdminData(true)}
                disabled={refreshing}
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Memperbarui...' : 'Perbarui'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCache}
                className="text-gray-500 hover:text-gray-700"
                title="Clear cache dan reload data"
              >
                Clear Cache
              </Button>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-sm px-3 py-1">
                <Shield className="mr-1 h-3 w-3" />
                Administrator
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Total Pengguna</p>
                  <p className="text-3xl font-bold text-sky-900">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-sky-500 mt-1">Semua roles</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Total Pasien</p>
                  <p className="text-3xl font-bold text-sky-900">{stats?.totalPatients || 0}</p>
                  <p className="text-xs text-sky-500 mt-1">Terdaftar dalam sistem</p>
                </div>
                <ClipboardList className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Total Screening</p>
                  <p className="text-3xl font-bold text-sky-900">{stats?.totalScreenings || 0}</p>
                  <p className="text-xs text-sky-500 mt-1">Sesi dilakukan</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Risiko Tinggi</p>
                  <p className="text-3xl font-bold text-sky-900">
                    {stats?.highRiskScreenings || 0}
                  </p>
                  <p className="text-xs text-sky-500 mt-1">Perlu perhatian</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Admin</p>
                  <p className="text-2xl font-bold text-blue-900">{userStats?.admin_count || 0}</p>
                </div>
                <UserCog className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Perawat</p>
                  <p className="text-2xl font-bold text-green-900">
                    {userStats?.perawat_count || 0}
                  </p>
                </div>
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Pasien</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {userStats?.pasien_count || 0}
                  </p>
                </div>
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8"
        >
          {/* <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <UserCog className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Kelola Perawat</CardTitle>
              <CardDescription>Atur data dan informasi perawat</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/nurses">
                  <Eye className="mr-2 h-4 w-4" />
                  Kelola Perawat
                </Link>
              </Button>
            </CardContent>
          </Card> */}

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Data Perawat</CardTitle>
              <CardDescription>Lihat data perawat terdaftar</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                asChild
              >
                <Link href="/admin/nurses">
                  Lihat Data
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <ClipboardList className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Data Pasien</CardTitle>
              <CardDescription>Kelola informasi pasien</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                asChild
              >
                <Link href="/admin/patients">
                  Lihat Data
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Riwayat Screening</CardTitle>
              <CardDescription>Lihat semua data screening ESAS</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                asChild
              >
                <Link href="/admin/screenings">
                  Lihat Data
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                <Download className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">Export Data</CardTitle>
              <CardDescription>Download data dalam format Excel</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                asChild
              >
                <Link href="/admin/screenings">
                  Export Data
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card> */}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-sky-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-sky-600" />
                  Aktivitas Terkini
                </CardTitle>
                <CardDescription>Log aktivitas sistem terbaru</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-sky-600 text-center py-4">Belum ada aktivitas</p>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            activity.type === 'user'
                              ? 'bg-blue-600'
                              : activity.type === 'screening'
                                ? 'bg-green-600'
                                : 'bg-purple-600'
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sky-900 truncate">
                            {activity.user_name} - {activity.action}
                          </p>
                          <p className="text-xs text-sky-600">
                            {formatDateTime(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-sky-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-sky-600" />
                  Statistik Bulan Ini
                </CardTitle>
                <CardDescription>Overview performa sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-sky-900">Screening Bulan Ini</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {stats?.screeningsThisMonth || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium text-sky-900">Pengguna Aktif</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {stats?.activeUsers || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="text-sm font-medium text-sky-900">
                        Screening Risiko Tinggi
                      </span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {stats?.highRiskScreenings || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
