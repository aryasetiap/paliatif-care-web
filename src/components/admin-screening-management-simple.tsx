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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
  AlertTriangle,
  TrendingUp,
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
const QUESTION_MAP: { [key: number]: string } = {
  1: 'Nyeri',
  2: 'Lelah',
  3: 'Tidur',
  4: 'Mual',
  5: 'Nafsu Makan',
  6: 'Sesak',
  7: 'Sedih',
  8: 'Cemas',
  9: 'Perasaan Keseluruhan',
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

      // Calculate stats
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

      const [
        totalScreenings,
        screeningsThisMonth,
        highRiskScreenings,
        criticalRiskScreenings,
        guestScreenings,
        userScreenings,
      ] = await Promise.all([
        supabase.from('screenings').select('*', { count: 'exact', head: true }),
        supabase
          .from('screenings')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString()),
        supabase
          .from('screenings')
          .select('*', { count: 'exact', head: true })
          .eq('risk_level', 'high'),
        supabase
          .from('screenings')
          .select('*', { count: 'exact', head: true })
          .eq('risk_level', 'critical'),
        supabase
          .from('screenings')
          .select('*', { count: 'exact', head: true })
          .eq('is_guest', true),
        supabase
          .from('screenings')
          .select('*', { count: 'exact', head: true })
          .eq('is_guest', false),
      ])

      // Get average score
      const { data: scoresData } = await supabase.from('screenings').select('highest_score')
      const avgScore =
        (scoresData || [])?.reduce((sum, s) => sum + (s.highest_score || 0), 0) /
          (scoresData?.length || 1) || 0

      setStats({
        totalScreenings: totalScreenings.count || 0,
        screeningsThisMonth: screeningsThisMonth.count || 0,
        highRiskScreenings: highRiskScreenings.count || 0,
        criticalRiskScreenings: criticalRiskScreenings.count || 0,
        guestScreenings: guestScreenings.count || 0,
        userScreenings: userScreenings.count || 0,
        averageScore: Math.round(avgScore * 10) / 10,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal memuat data screening',
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

      if (error) throw error

      // Transform data for Excel
      const excelData =
        exportData?.map((screening) => ({
          ID: screening.id,
          'Nama Pasien': screening.esas_data?.identity?.name || 'Tamu',
          Umur: screening.esas_data?.identity?.age || 'N/A',
          Gender: screening.esas_data?.identity?.gender || 'N/A',
          Fasilitas: screening.esas_data?.identity?.facility_name || 'N/A',
          'Tipe Screening': screening.screening_type,
          Status: screening.status,
          'Tingkat Risiko': getRiskText(screening.risk_level),
          'Skor Tertinggi': screening.highest_score,
          'Masalah Utama': QUESTION_MAP[screening.primary_question] || 'N/A',
          Diagnosis: screening.recommendation?.diagnosis || 'N/A',
          Tindakan: screening.recommendation?.action_required || 'N/A',
          Terapi: screening.recommendation?.therapy_type || 'N/A',
          Frekuensi: screening.recommendation?.frequency || 'N/A',
          'Tipe User': screening.is_guest ? 'Tamu' : 'Terdaftar',
          User: screening.guest_identifier || 'N/A',
          'Tanggal Screening': format(new Date(screening.created_at), 'dd/MM/yyyy HH:mm', {
            locale: idLocale,
          }),
        })) || []

      // Create Excel workbook
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data Screening')

      // Generate filename with date
      const fileName = `Data_Screening_${format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: idLocale })}.xlsx`

      // Download file
      XLSX.writeFile(wb, fileName)

      toast({
        title: 'Export Berhasil',
        description: `Data screening berhasil di-export ke ${fileName}`,
      })
    } catch {
      toast({
        title: 'Export Gagal',
        description: 'Gagal mengexport data ke Excel',
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

  const getUserName = (screening: ScreeningData) => {
    return screening.guest_identifier || 'N/A'
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

        <Card>
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
        </Card>

        <Card>
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
        </Card>
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
                      <TableHead>Pasien</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Risiko</TableHead>
                      <TableHead>Skor</TableHead>
                      <TableHead>Masalah Utama</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {screenings.map((screening) => (
                      <TableRow key={screening.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getPatientName(screening)}</div>
                            {screening.esas_data?.identity?.facility_name && (
                              <div className="text-sm text-gray-500">
                                {screening.esas_data.identity.facility_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {screening.is_guest ? 'Tamu' : 'Terdaftar'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeVariant(screening.risk_level)}>
                            {getRiskText(screening.risk_level)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <span className="font-bold text-lg">{screening.highest_score}</span>
                            <div className="text-xs text-gray-500">/10</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {QUESTION_MAP[screening.primary_question] || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getUserName(screening)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(screening.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
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
