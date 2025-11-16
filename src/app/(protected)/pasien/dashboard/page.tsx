'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Activity,
  Clock,
  FileText,
  Plus,
  Calendar,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/authStore'
import '@/styles/modern-patterns.css'

interface PatientScreening {
  id: string
  screening_type: string
  status: string
  screening_data: any
  recommendation: any
  created_at: string
  risk_level?: string
  highest_score?: number
}

export default function PatientDashboardPage() {
  const [screenings, setScreenings] = useState<PatientScreening[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalScreenings: 0,
    thisMonthScreenings: 0,
    lastScreeningDate: null as string | null,
    averageRiskScore: 0,
  })
  const router = useRouter()
  const { user, profile } = useAuthStore()

  const loadPatientData = useCallback(async () => {
    if (!user) return

    try {
      const supabase = createClient()

      // Load patient's screenings
      const { data: screeningsData } = await supabase
        .from('screenings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Calculate stats
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisMonthScreenings = screeningsData?.filter(s =>
        new Date(s.created_at) >= firstDayOfMonth
      ).length || 0

      const averageScore = screeningsData && screeningsData.length > 0
        ? screeningsData.reduce((sum, s) => sum + (s.highest_score || 0), 0) / screeningsData.length
        : 0

      setStats({
        totalScreenings: screeningsData?.length || 0,
        thisMonthScreenings,
        lastScreeningDate: screeningsData?.[0]?.created_at || null,
        averageRiskScore: Math.round(averageScore * 10) / 10,
      })

      setScreenings(screeningsData || [])
    } catch {
      // Error logged silently for debugging
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadPatientData()
  }, [user, router, loadPatientData])

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
          <p className="text-gray-600">Memuat dashboard pasien...</p>
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
              <h1 className="text-3xl font-bold text-sky-900 mb-2">
                Halo, {profile?.full_name || 'Pasien'}! 👋
              </h1>
              <p className="text-sky-600">Dashboard Paliatif Care Anda</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
              >
                <Link href="/screening/new?type=self">
                  <Plus className="mr-2 h-4 w-4" />
                  Screening Baru
                </Link>
              </Button>
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
                  <p className="text-sm text-sky-600">Total Screening</p>
                  <p className="text-3xl font-bold text-sky-900">{stats.totalScreenings}</p>
                  <p className="text-xs text-sky-500 mt-1">Semua waktu</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Screening Bulan Ini</p>
                  <p className="text-3xl font-bold text-sky-900">{stats.thisMonthScreenings}</p>
                  <p className="text-xs text-sky-500 mt-1">
                    {new Date().toLocaleDateString('id-ID', { month: 'long' })}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Skor Rata-rata</p>
                  <p className="text-3xl font-bold text-sky-900">{stats.averageRiskScore}</p>
                  <p className="text-xs text-sky-500 mt-1">Dari skala 0-10</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Terakhir Screening</p>
                  <p className="text-lg font-bold text-sky-900">
                    {stats.lastScreeningDate
                      ? new Date(stats.lastScreeningDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Belum ada'
                    }
                  </p>
                  <p className="text-xs text-sky-500 mt-1">Tanggal terakhir</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Screening Mandiri</CardTitle>
              <CardDescription>Lakukan screening ESAS untuk diri sendiri</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/screening/new?type=self">
                  Mulai Screening
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Profil Saya</CardTitle>
              <CardDescription>Perbarui informasi pribadi Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                asChild
              >
                <Link href="/pasien/profile">
                  Lihat Profil
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Screenings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-sky-600" />
                Riwayat Screening Saya
              </CardTitle>
              <CardDescription>Daftar semua screening yang telah Anda lakukan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {screenings.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Anda belum pernah melakukan screening</p>
                    <Button asChild>
                      <Link href="/screening/new?type=self">
                        <Plus className="mr-2 h-4 w-4" />
                        Mulai Screening Pertama
                      </Link>
                    </Button>
                  </div>
                ) : (
                  screenings.map((screening) => (
                    <div key={screening.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sky-900">
                            {screening.screening_type === 'initial' ? 'Screening Awal' : 'Screening Follow-up'}
                          </p>
                          <p className="text-xs text-sky-600">
                            {new Date(screening.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {screening.risk_level && (
                          <Badge className={getRiskLevelColor(screening.risk_level)}>
                            {getRiskLevelText(screening.risk_level)}
                          </Badge>
                        )}
                        {screening.highest_score && (
                          <span className="text-sm font-medium text-gray-600">
                            Skor: {screening.highest_score}/10
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}