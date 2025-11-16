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
  Download,
  Eye,
  Shield,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/authStore'
import '@/styles/modern-patterns.css'

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
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, userRole } = useAuthStore()

  useEffect(() => {
    if (!user || userRole !== 'admin') {
      router.push('/login')
      return
    }

    loadAdminData()
  }, [user, userRole, router])

  const loadAdminData = async () => {
    try {
      const supabase = createClient()

      // Load total counts
      const [
        { count: totalUsers },
        { count: totalPatients },
        { count: totalScreenings },
        { count: activeUsers },
        { count: screeningsThisMonth },
        { count: highRiskScreenings }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('screenings').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('screenings').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('screenings').select('*', { count: 'exact', head: true }).in('risk_level', ['high', 'critical'])
      ])

      // Load user stats by role
      const { data: usersByRole } = await supabase
        .from('profiles')
        .select('role')
        .not('role', 'is', null)

      const userStatsData = usersByRole?.reduce((acc, user) => {
        const role = user.role as 'admin' | 'perawat' | 'pasien'
        acc[`${role}_count`] = (acc[`${role}_count`] || 0) + 1
        return acc
      }, { admin_count: 0, perawat_count: 0, pasien_count: 0 }) || { admin_count: 0, perawat_count: 0, pasien_count: 0 }

      // Load recent activities (simplified - just get recent screenings and users)
      const { data: recentScreenings } = await supabase
        .from('screenings')
        .select(`
          *,
          profiles!inner(
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      const activities: RecentActivity[] = [
        ...(recentScreenings?.map(s => ({
          id: s.id,
          type: 'screening' as const,
          user_name: s.profiles?.full_name,
          action: `Melakukan screening ${s.screening_type}`,
          created_at: s.created_at
        })) || []),
        ...(recentUsers?.map(u => ({
          id: u.full_name + u.created_at,
          type: 'user' as const,
          user_name: u.full_name,
          action: 'Pengguna baru bergabung',
          created_at: u.created_at
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

      setStats({
        totalUsers: totalUsers || 0,
        totalPatients: totalPatients || 0,
        totalScreenings: totalScreenings || 0,
        activeUsers: activeUsers || 0,
        screeningsThisMonth: screeningsThisMonth || 0,
        highRiskScreenings: highRiskScreenings || 0,
      })

      setUserStats(userStatsData)
      setRecentActivities(activities)
    } catch {
      // Error logged silently for debugging
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard admin...</p>
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
              <h1 className="text-3xl font-bold text-sky-900 mb-2">
                Dashboard Admin
              </h1>
              <p className="text-sky-600">Kelola Sistem Paliatif Care</p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-sm px-3 py-1">
              <Shield className="mr-1 h-3 w-3" />
              Administrator
            </Badge>
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
                  <p className="text-3xl font-bold text-sky-900">{stats?.highRiskScreenings || 0}</p>
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
                  <p className="text-2xl font-bold text-green-900">{userStats?.perawat_count || 0}</p>
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
                  <p className="text-2xl font-bold text-purple-900">{userStats?.pasien_count || 0}</p>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <UserCog className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Kelola Pengguna</CardTitle>
              <CardDescription>Atur hak akses dan role pengguna</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/users">
                  <Eye className="mr-2 h-4 w-4" />
                  Kelola Pengguna
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <ClipboardList className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Data Screening</CardTitle>
              <CardDescription>Lihat dan kelola semua data screening</CardDescription>
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

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Export Data</CardTitle>
              <CardDescription>Download data dalam format CSV/Excel</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                asChild
              >
                <Link href="/admin/export">
                  Export Data
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
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
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          activity.type === 'user' ? 'bg-blue-600' :
                          activity.type === 'screening' ? 'bg-green-600' : 'bg-purple-600'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sky-900 truncate">
                            {activity.user_name} - {activity.action}
                          </p>
                          <p className="text-xs text-sky-600">
                            {new Date(activity.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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
                      <span className="text-sm font-medium text-sky-900">Screening Risiko Tinggi</span>
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