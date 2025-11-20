'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  ClipboardList,
  Activity,
  AlertTriangle,
  // Heart,
  BookOpen,
  UserCheck,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import '@/styles/modern-patterns.css'

interface DashboardStats {
  totalPatients: number
  totalScreenings: number
  screeningsThisMonth: number
  highRiskPatients: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = createClient()

      // Load total patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })

      // Load total screenings
      const { count: totalScreenings } = await supabase
        .from('screenings')
        .select('*', { count: 'exact', head: true })

      // Load screenings this month
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10)
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10)
      const { count: screeningsThisMonth } = await supabase
        .from('screenings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth)
        .lte('created_at', lastDayOfMonth)

      // Load high risk patients
      const { data: highRiskPatients } = await supabase
        .from('screenings')
        .select('*, patients(name, age, gender)')
        .in('risk_level', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(5)

      // Load recent activities
      const { data: activities } = await supabase
        .from('screenings')
        .select('*, patients(name)')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalPatients: totalPatients || 0,
        totalScreenings: totalScreenings || 0,
        screeningsThisMonth: screeningsThisMonth || 0,
        highRiskPatients: highRiskPatients || [],
      })

      setRecentActivities(activities || [])
    } catch {
      // Silently handle error to prevent app crash
      // Error logged for debugging purposes if needed
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'critical':
        return 'Kritis'
      case 'high':
        return 'Tinggi'
      case 'medium':
        return 'Sedang'
      case 'low':
        return 'Rendah'
      default:
        return 'Tidak Diketahui'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-sky-900 mb-2">Dashboard</h1>
              <p className="text-sky-600">Sistem Edukasi & Skrining Paliatif Care</p>
            </div>
            {/* <div className="mt-4 md:mt-0">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
              >
                <Link href="/screening/new">
                  <Activity className="mr-2 h-4 w-4" />
                  Screening Baru
                </Link>
              </Button>
            </div> */}
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Total Pasien</p>
                  <p className="text-3xl font-bold text-sky-900">{stats?.totalPatients || 0}</p>
                  <p className="text-xs text-sky-500 mt-1">Terdaftar dalam sistem</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Total Screening</p>
                  <p className="text-3xl font-bold text-sky-900">{stats?.totalScreenings || 0}</p>
                  <p className="text-xs text-sky-500 mt-1">Sesi screening dilakukan</p>
                </div>
                <ClipboardList className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Screening Bulan Ini</p>
                  <p className="text-3xl font-bold text-sky-900">
                    {stats?.screeningsThisMonth || 0}
                  </p>
                  <p className="text-xs text-sky-500 mt-1">
                    Bulan {new Date().toLocaleDateString('id-ID', { month: 'long' })}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {/* <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Risiko Tinggi</p>
                  <p className="text-3xl font-bold text-sky-900">
                    {stats?.highRiskPatients?.length || 0}
                  </p>
                  <p className="text-xs text-sky-500 mt-1">Perlu intervensi segera</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card> */}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" // lg:grid-cols-3
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Screening ESAS</CardTitle>
              <CardDescription>Edmonton Symptom Assessment System</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/screening/new">
                  Mulai Screening
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Data Pasien</CardTitle>
              <CardDescription>Kelola data pasien</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                asChild
              >
                <Link href="/pasien">
                  Lihat Pasien
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Edukasi</CardTitle>
              <CardDescription>8 Penyakit Terminal</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                asChild
              >
                <Link href="/edukasi">
                  Lihat Materi
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card> */}

          {/* <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">Intervensi</CardTitle>
              <CardDescription>Terapi Komplementer</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card> */}
        </motion.div>

        <div className="grid grid-cols-1">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-sky-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-sky-600" />
                  Aktivitas Terbaru
                </CardTitle>
                <CardDescription>Screening dan aktivitas terkini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-sky-600 text-center py-4">Belum ada aktivitas</p>
                  ) : (
                    recentActivities.map((activity, _index) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sky-900 truncate">
                            Screening - {activity.patients?.name || 'Pasien'}
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
                        <Badge className={getRiskLevelColor(activity.risk_level)}>
                          {getRiskLevelText(activity.risk_level)}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* High Risk Patients */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-sky-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Pasien Risiko Tinggi
                </CardTitle>
                <CardDescription>Pasien yang memerlukan intervensi segera</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.highRiskPatients?.length === 0 ? (
                    <p className="text-sky-600 text-center py-4">Tidak ada pasien Risiko tinggi</p>
                  ) : (
                    stats?.highRiskPatients?.map((screening, _index) => (
                      <div
                        key={screening.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <div className="flex items-center space-x-3">
                          <UserCheck className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium text-sky-900">
                              {screening.patients?.name || 'Pasien'}
                            </p>
                            <p className="text-xs text-sky-600">
                              {screening.patients?.age} tahun •{' '}
                              {screening.patients?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getRiskLevelColor(screening.risk_level)}>
                            {getRiskLevelText(screening.risk_level)}
                          </Badge>
                          <p className="text-xs text-sky-600 mt-1">
                            Skor: {screening.highest_score}/10
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div> */}
        </div>
      </div>

      <Footer />
    </div>
  )
}
