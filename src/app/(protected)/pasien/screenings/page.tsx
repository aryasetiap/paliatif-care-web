'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Activity,
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

export default function PatientScreeningsPage() {
  const [screenings, setScreenings] = useState<PatientScreening[]>([])
  const [filteredScreenings, setFilteredScreenings] = useState<PatientScreening[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const router = useRouter()
  const { user } = useAuthStore()

  const loadScreenings = useCallback(async () => {
    if (!user) return

    try {
      const supabase = createClient()

      const { data: screeningsData } = await supabase
        .from('screenings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setScreenings(screeningsData || [])
      setFilteredScreenings(screeningsData || [])
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadScreenings()
  }, [loadScreenings])

  // Filter and sort screenings
  useEffect(() => {
    let filtered = [...screenings]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(screening =>
        screening.screening_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screening.risk_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(screening.created_at).toLocaleDateString('id-ID').includes(searchTerm)
      )
    }

    // Apply risk level filter
    if (riskLevelFilter !== 'all') {
      filtered = filtered.filter(screening => screening.risk_level === riskLevelFilter)
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'highest_score':
        filtered.sort((a, b) => (b.highest_score || 0) - (a.highest_score || 0))
        break
      case 'lowest_score':
        filtered.sort((a, b) => (a.highest_score || 0) - (b.highest_score || 0))
        break
    }

    setFilteredScreenings(filtered)
  }, [screenings, searchTerm, riskLevelFilter, sortBy])

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
          <p className="text-gray-600">Memuat daftar screening...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen mt-16">
      <HeaderNav />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/pasien/dashboard')}
              className="border-sky-300 text-sky-700 hover:bg-sky-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
            <div className="flex-1"></div>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
            >
              <Link href="/screening/new?type=self">
                <Activity className="mr-2 h-4 w-4" />
                Screening Baru
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-sky-900 mb-2">Riwayat Screening Saya</h1>
            <p className="text-sky-600">
              Daftar lengkap hasil screening ESAS yang telah Anda lakukan
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Filter className="mr-2 h-5 w-5 text-sky-600" />
                Filter & Pencarian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari screening..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/90 border-sky-300"
                  />
                </div>

                <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                  <SelectTrigger className="bg-white/90 border-sky-300">
                    <SelectValue placeholder="Filter Risiko" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tingkat Risiko</SelectItem>
                    <SelectItem value="low">Rendah</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                    <SelectItem value="critical">Kritis</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/90 border-sky-300">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="highest_score">Skor Tertinggi</SelectItem>
                    <SelectItem value="lowest_score">Skor Terendah</SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-center">
                  <p className="text-sm text-sky-600 font-medium">
                    Total: {filteredScreenings.length} screening
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Screenings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-sky-600" />
                Daftar Screening
              </CardTitle>
              <CardDescription>
                Klik pada setiap item untuk melihat detail hasil screening lengkap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredScreenings.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {screenings.length === 0 ? 'Belum ada screening' : 'Tidak ada hasil yang cocok'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {screenings.length === 0
                        ? 'Anda belum pernah melakukan screening. Mulai screening pertama Anda sekarang.'
                        : 'Coba ubah filter atau kata kunci pencarian'
                      }
                    </p>
                    {screenings.length === 0 && (
                      <Button asChild>
                        <Link href="/screening/new?type=self">
                          <Activity className="mr-2 h-4 w-4" />
                          Mulai Screening Pertama
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredScreenings.map((screening, index) => (
                    <motion.div
                      key={screening.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                    >
                      <Link
                        href={`/screening/${screening.id}/result`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-md group cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 group-hover:bg-blue-700 transition-colors"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-sky-900 group-hover:text-blue-800 transition-colors">
                                {screening.screening_type === 'initial' ? 'Screening Awal' : 'Screening Follow-up'}
                              </p>
                              <p className="text-xs text-sky-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
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
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
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