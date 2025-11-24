'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  Search,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  FileText,
  Activity,
  TrendingUp,
  Info,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import * as XLSX from 'xlsx'

interface ScreeningData {
  id: string
  created_at: string
  screening_type: string
  status: string
  risk_level: string
  highest_score: number
  primary_question: number
  esas_data: any
  recommendation?: any
  user_id?: string
  patient_id?: string
  guest_identifier?: string
  is_guest: boolean
  profiles?: {
    full_name?: string
    email?: string
  }
}

interface ScreeningStats {
  totalScreenings: number
  screeningsThisMonth: number
  highRiskScreenings: number
  criticalRiskScreenings: number
  guestScreenings: number
  userScreenings: number
  averageScore: number
}

const ITEMS_PER_PAGE = 20
const RISK_LEVELS = ['low', 'medium', 'high', 'critical']

const DETAILED_QUESTIONS: { [key: number]: string } = {
  1: 'Seberapa besar keluhan nyeri yang Anda alami saat ini?',
  2: 'Seberapa besar keluhan lelah atau kekurangan tenaga yang Anda alami saat ini?',
  3: 'Apakah Anda saat ini mengalami rasa kantuk atau sulit menahan kantuk?',
  4: 'Seberapa besar mual atau rasa ingin muntah yang Anda alami saat ini?',
  5: 'Seberapa berkurang nafsu makan yang Anda alami saat ini?',
  6: 'Apakah Anda saat ini mengalami sesak saat bernapas?',
  7: 'Seberapa sedih, murung atau kehilangan semangat Anda saat ini?',
  8: 'Seberapa besar Anda mengalami cemas atau khawatir saat ini?',
  9: 'Secara keseluruhan, bagaimana perasaan Anda saat ini?',
}

const getRiskBadgeVariant = (level: string) => {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'critical':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getRiskText = (level: string) => {
  switch (level) {
    case 'low':
      return 'Rendah'
    case 'medium':
      return 'Sedang'
    case 'high':
      return 'Tinggi'
    case 'critical':
      return 'Kritis'
    default:
      return 'Tidak Diketahui'
  }
}

export default function ScreeningManagementContent() {
  const [screenings, setScreenings] = useState<ScreeningData[]>([])
  const [stats, setStats] = useState<ScreeningStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all')
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'guest' | 'user'>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'highest_score' | 'primary_question'>(
    'created_at'
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const { user, userRole } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  // Refs to prevent multiple simultaneous requests
  const isFetchingRef = useRef(false)
  const lastFetchTimeRef = useRef(0)

  const fetchUserData = async (userIds: string[]) => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      return {}
    }

    const now = Date.now()
    if (now - lastFetchTimeRef.current < 1000) {
      return {}
    } // Debounce: don't fetch more than once per second

    const supabase = createClient()
    const uniqueIds = [...new Set(userIds)].filter((id) => id) // Remove duplicates and empty strings

    if (uniqueIds.length === 0) return {}

    isFetchingRef.current = true
    lastFetchTimeRef.current = now

    try {
      // Limit to 10 users per request to avoid query timeouts
      const batchSize = 10
      const allUserData: any[] = []

      for (let i = 0; i < uniqueIds.length; i += batchSize) {
        const batch = uniqueIds.slice(i, i + batchSize)

        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', batch)
          .limit(batchSize)

        if (error) {
          // Continue with empty data for this batch instead of throwing
          continue
        }

        if (data) {
          allUserData.push(...data)
        }
      }

      // Convert to lookup object
      const lookup: { [key: string]: { full_name: string; email: string } } = {}
      allUserData.forEach((user) => {
        if (user.id) {
          lookup[user.id] = {
            full_name: user.full_name || 'Unknown User',
            email: user.email || '',
          }
        }
      })

      return lookup
    } catch {
      // Silently handle errors to prevent browser console errors
      return {}
    } finally {
      isFetchingRef.current = false
    }
  }

  const fetchScreenings = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Build base query
      let query = supabase.from('screenings').select('*', { count: 'exact' })

      // Apply filters
      if (riskLevelFilter !== 'all') {
        query = query.eq('risk_level', riskLevelFilter)
      }

      if (userTypeFilter !== 'all') {
        if (userTypeFilter === 'guest') {
          query = query.eq('is_guest', true)
        } else {
          query = query.eq('is_guest', false)
        }
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`
          guest_identifier.ilike.%${searchTerm}%,
          esas_data->>identity->>name.ilike.%${searchTerm}%
        `)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Get paginated data
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data: screeningsData, error, count } = await query.range(from, to)

      if (error) throw error

      setScreenings(screeningsData || [])
      setTotalItems(count || 0)

      // Fetch user data for non-guest screenings (only if we have any)
      const userIds = (screeningsData || [])
        .filter((screening) => !screening.is_guest && screening.user_id)
        .map((screening) => screening.user_id!)
        .slice(0, 20) // Limit to first 20 users to prevent overloading

      if (userIds.length > 0) {
        await fetchUserData(userIds)
      }

      // Calculate stats - optimized to single query
      const [statsResult] = await Promise.all([
        // Get all data needed for stats in one query
        supabase.from('screenings').select('risk_level, highest_score, created_at, is_guest'),
      ])

      if (statsResult.error) throw statsResult.error

      const allScreenings = statsResult.data || []
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const monthStartISO = monthStart.toISOString()

      const totalScreenings = allScreenings.length
      const screeningsThisMonth = allScreenings.filter((s) => s.created_at >= monthStartISO).length
      const highRiskScreenings = allScreenings.filter((s) => s.risk_level === 'high').length
      const criticalRiskScreenings = allScreenings.filter((s) => s.risk_level === 'critical').length
      const guestScreenings = allScreenings.filter((s) => s.is_guest === true).length
      const userScreenings = allScreenings.filter((s) => s.is_guest === false).length
      const avgScore =
        totalScreenings > 0
          ? Math.round(
              (allScreenings.reduce((sum, s) => sum + (s.highest_score || 0), 0) /
                totalScreenings) *
                10
            ) / 10
          : 0

      setStats({
        totalScreenings,
        screeningsThisMonth,
        highRiskScreenings,
        criticalRiskScreenings,
        guestScreenings,
        userScreenings,
        averageScore: avgScore,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memuat data screening',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, riskLevelFilter, userTypeFilter, sortBy, sortOrder, currentPage, toast])

  useEffect(() => {
    if (!user || userRole !== 'admin') {
      router.push('/login')
      return
    }
    fetchScreenings()
  }, [user, userRole, router, fetchScreenings])

  const exportToExcel = async () => {
    try {
      const supabase = createClient()

      // Get all screenings data for export
      let query = supabase.from('screenings').select('*')

      // Apply filters to export
      if (riskLevelFilter !== 'all') {
        query = query.eq('risk_level', riskLevelFilter)
      }
      if (userTypeFilter !== 'all') {
        if (userTypeFilter === 'guest') {
          query = query.eq('is_guest', true)
        } else {
          query = query.eq('is_guest', false)
        }
      }
      if (searchTerm) {
        query = query.or(`
          guest_identifier.ilike.%${searchTerm}%,
          esas_data->>identity->>name.ilike.%${searchTerm}%
        `)
      }

      const { data: exportData, error } = await query

      if (error) {
        throw new Error(`Gagal mengambil data: ${error.message}`)
      }

      // Fetch user data for export
      const exportUserIds = exportData
        ? exportData
            .filter((screening) => !screening.is_guest && screening.user_id)
            .map((screening) => screening.user_id!)
        : []

      if (exportUserIds.length > 0) {
        await fetchUserData(exportUserIds.slice(0, 50)) // Limit export to 50 users
      }

      if (!exportData || exportData.length === 0) {
        toast({
          title: 'Info',
          description: 'Tidak ada data untuk di-export',
          variant: 'default',
        })
        return
      }

      // Transform data for Excel with requested format and detailed questions
      const excelData = exportData.map((screening) => {
        const esasScores = screening.esas_data?.questions || {}

        // Generate a meaningful patient ID from screening data
        const patientId =
          screening.patient_id ||
          (screening.is_guest
            ? `GUEST-${screening.guest_identifier?.slice(-8) || screening.id?.slice(-8)}`
            : screening.user_id || 'N/A')

        return {
          id_screening: screening.id || 'N/A',
          id_pasien: patientId,
          nama_pasien: screening.esas_data?.identity?.name || 'Tamu',
          usia: screening.esas_data?.identity?.age || 'N/A',
          jenis_kelamin: screening.esas_data?.identity?.gender || 'N/A',
          tingkat_resiko: getRiskText(screening.risk_level),
          'Seberapa besar keluhan nyeri yang Anda alami saat ini?': esasScores['1'] || 'N/A',
          'Seberapa besar keluhan lelah atau kekurangan tenaga yang Anda alami saat ini?':
            esasScores['2'] || 'N/A',
          'Apakah Anda saat ini mengalami rasa kantuk atau sulit menahan kantuk?':
            esasScores['3'] || 'N/A',
          'Seberapa besar mual atau rasa ingin muntah yang Anda alami saat ini?':
            esasScores['4'] || 'N/A',
          'Seberapa berkurang nafsu makan yang Anda alami saat ini?': esasScores['5'] || 'N/A',
          'Apakah Anda saat ini mengalami sesak saat bernapas?': esasScores['6'] || 'N/A',
          'Seberapa sedih, murung atau kehilangan semangat Anda saat ini?':
            esasScores['7'] || 'N/A',
          'Seberapa besar Anda mengalami cemas atau khawatir saat ini?': esasScores['8'] || 'N/A',
          'Secara keseluruhan, bagaimana perasaan Anda saat ini?': esasScores['9'] || 'N/A',
        }
      })

      // Create questions reference data
      const questionReference = Object.entries(DETAILED_QUESTIONS).map(([number, question]) => ({
        Pertanyaan: `pertanyaan_${number}`,
        Deskripsi: question,
      }))

      // Create Excel workbook with multiple sheets
      const wsData = XLSX.utils.json_to_sheet(excelData)
      const wsQuestions = XLSX.utils.json_to_sheet(questionReference)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, wsData, 'Data Screening')
      XLSX.utils.book_append_sheet(wb, wsQuestions, 'Referensi Pertanyaan')

      // Auto-size columns for better readability
      const columnWidths = {
        id_screening: 25,
        id_pasien: 25,
        nama_pasien: 20,
        usia: 8,
        jenis_kelamin: 12,
        tingkat_resiko: 15,
        'Seberapa besar keluhan nyeri yang Anda alami saat ini?': 12,
        'Seberapa besar keluhan lelah atau kekurangan tenaga yang Anda alami saat ini?': 12,
        'Apakah Anda saat ini mengalami rasa kantuk atau sulit menahan kantuk?': 12,
        'Seberapa besar mual atau rasa ingin muntah yang Anda alami saat ini?': 12,
        'Seberapa berkurang nafsu makan yang Anda alami saat ini?': 12,
        'Apakah Anda saat ini mengalami sesak saat bernapas?': 12,
        'Seberapa sedih, murung atau kehilangan semangat Anda saat ini?': 12,
        'Seberapa besar Anda mengalami cemas atau khawatir saat ini?': 12,
        'Secara keseluruhan, bagaimana perasaan Anda saat ini?': 12,
      }

      const colWidthsData = Object.keys(columnWidths).map((key) => ({
        wch: columnWidths[key as keyof typeof columnWidths],
      }))
      const colWidthsQuestions = [{ wch: 15 }, { wch: 80 }]
      wsData['!cols'] = colWidthsData
      wsQuestions['!cols'] = colWidthsQuestions

      // Generate filename with date
      const fileName = `Data_Screening_${format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: idLocale })}.xlsx`

      // Download file
      XLSX.writeFile(wb, fileName)

      toast({
        title: 'Export Berhasil',
        description: `Data ${exportData.length} screening berhasil di-export ke ${fileName} dengan 2 worksheet`,
      })
    } catch (error) {
      toast({
        title: 'Export Gagal',
        description: error instanceof Error ? error.message : 'Gagal mengexport data ke Excel',
        variant: 'destructive',
      })
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setRiskLevelFilter('all')
    setUserTypeFilter('all')
    setSortBy('created_at')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: idLocale })
  }

  const getPatientName = (screening: ScreeningData) => {
    return screening.esas_data?.identity?.name || 'Tamu'
  }

  const handleViewDetail = (screening: ScreeningData) => {
    // Navigate to detail page or open modal
    router.push(`/admin/screenings/${screening.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">Riwayat Screening</h1>
          <p className="text-sky-600">Kelola dan pantau semua data screening ESAS</p>
        </div>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Screening</p>
                <p className="text-3xl font-bold text-sky-900">{stats?.totalScreenings || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bulan Ini</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.screeningsThisMonth || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risiko Tinggi</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.highRiskScreenings || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risiko Kritis</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats?.criticalRiskScreenings || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama pasien, user, atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {showFilters && <X className="ml-2 h-4 w-4" />}
            </Button>

            {showFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Reset Filter
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Urutkan</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Tanggal</SelectItem>
                    <SelectItem value="highest_score">Skor Tertinggi</SelectItem>
                    <SelectItem value="primary_question">Masalah Utama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Urutan</label>
                <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">A-Z</SelectItem>
                    <SelectItem value="desc">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tingkat Risiko</label>
                <Select
                  value={riskLevelFilter}
                  onValueChange={(value: string) => setRiskLevelFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {RISK_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {getRiskText(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipe User</label>
                <Select
                  value={userTypeFilter}
                  onValueChange={(value: any) => setUserTypeFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="user">Terdaftar</SelectItem>
                    <SelectItem value="guest">Tamu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Screening</CardTitle>
          <CardDescription>
            Menampilkan {screenings.length} dari {totalItems} screening
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : screenings.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Tidak ada data screening yang ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Screening</TableHead>
                      <TableHead>Pasien</TableHead>
                      <TableHead>Usia</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Tingkat Risiko</TableHead>
                      <TableHead className="relative group">
                        <div className="flex items-center gap-1">
                          P1
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </div>
                        <div className="absolute hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded p-2 -top-8 left-0 w-48">
                          Nyeri: Seberapa besar keluhan nyeri yang Anda alami?
                        </div>
                      </TableHead>
                      <TableHead className="relative group">
                        <div className="flex items-center gap-1">
                          P2
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </div>
                        <div className="absolute hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded p-2 -top-8 left-0 w-48">
                          Lelah: Seberapa besar keluhan lelah yang Anda alami?
                        </div>
                      </TableHead>
                      <TableHead className="relative group">
                        <div className="flex items-center gap-1">
                          P3
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </div>
                        <div className="absolute hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded p-2 -top-8 left-0 w-48">
                          Tidur: Apakah Anda mengalami rasa kantuk?
                        </div>
                      </TableHead>
                      <TableHead className="relative group">
                        <div className="flex items-center gap-1">
                          P4
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </div>
                        <div className="absolute hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded p-2 -top-8 left-0 w-48">
                          Mual: Seberapa besar mual yang Anda alami?
                        </div>
                      </TableHead>
                      <TableHead className="relative group">
                        <div className="flex items-center gap-1">
                          P5
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </div>
                        <div className="absolute hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded p-2 -top-8 left-0 w-48">
                          Nafsu Makan: Seberapa berkurang nafsu makan Anda?
                        </div>
                      </TableHead>
                      <TableHead className="relative group">
                        <div className="flex items-center gap-1">
                          P6
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </div>
                        <div className="absolute hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded p-2 -top-8 left-0 w-48">
                          Sesak: Apakah Anda mengalami sesak saat bernapas?
                        </div>
                      </TableHead>
                      <TableHead className="relative group">
                        <div className="flex items-center gap-1">
                          P7
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </div>
                        <div className="absolute hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded p-2 -top-8 left-0 w-48">
                          Sedih: Seberapa sedih atau murung Anda saat ini?
                        </div>
                      </TableHead>
                      <TableHead className="relative group">
                        <div className="flex items-center gap-1">
                          P8
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </div>
                        <div className="absolute hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded p-2 -top-8 left-0 w-48">
                          Cemas: Seberapa besar Anda mengalami cemas?
                        </div>
                      </TableHead>
                      <TableHead className="relative group">
                        <div className="flex items-center gap-1">
                          P9
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </div>
                        <div className="absolute hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded p-2 -top-8 left-0 w-48">
                          Perasaan: Bagaimana perasaan Anda secara keseluruhan?
                        </div>
                      </TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {screenings.map((screening) => {
                      const esasScores = screening.esas_data?.questions || {}
                      const getScoreColor = (score: number) => {
                        if (score <= 3) return 'text-green-600'
                        if (score <= 6) return 'text-yellow-600'
                        return 'text-red-600'
                      }

                      return (
                        <TableRow key={screening.id}>
                          <TableCell className="font-mono text-xs">
                            {screening.id?.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{getPatientName(screening)}</div>
                          </TableCell>
                          <TableCell>{screening.esas_data?.identity?.age || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {screening.esas_data?.identity?.gender || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskBadgeVariant(screening.risk_level)}>
                              {getRiskText(screening.risk_level)}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-center font-medium ${getScoreColor(esasScores['1'] || 0)}`}
                          >
                            {esasScores['1'] || '-'}
                          </TableCell>
                          <TableCell
                            className={`text-center font-medium ${getScoreColor(esasScores['2'] || 0)}`}
                          >
                            {esasScores['2'] || '-'}
                          </TableCell>
                          <TableCell
                            className={`text-center font-medium ${getScoreColor(esasScores['3'] || 0)}`}
                          >
                            {esasScores['3'] || '-'}
                          </TableCell>
                          <TableCell
                            className={`text-center font-medium ${getScoreColor(esasScores['4'] || 0)}`}
                          >
                            {esasScores['4'] || '-'}
                          </TableCell>
                          <TableCell
                            className={`text-center font-medium ${getScoreColor(esasScores['5'] || 0)}`}
                          >
                            {esasScores['5'] || '-'}
                          </TableCell>
                          <TableCell
                            className={`text-center font-medium ${getScoreColor(esasScores['6'] || 0)}`}
                          >
                            {esasScores['6'] || '-'}
                          </TableCell>
                          <TableCell
                            className={`text-center font-medium ${getScoreColor(esasScores['7'] || 0)}`}
                          >
                            {esasScores['7'] || '-'}
                          </TableCell>
                          <TableCell
                            className={`text-center font-medium ${getScoreColor(esasScores['8'] || 0)}`}
                          >
                            {esasScores['8'] || '-'}
                          </TableCell>
                          <TableCell
                            className={`text-center font-medium ${getScoreColor(esasScores['9'] || 0)}`}
                          >
                            {esasScores['9'] || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm whitespace-nowrap">
                              {formatDate(screening.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetail(screening)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Lihat Detail
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Halaman {currentPage} dari {totalPages} ({totalItems} total data)
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
