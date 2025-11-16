'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Download,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import '@/styles/modern-patterns.css'

interface ScreeningData {
  id: string
  created_at: string
  updated_at: string
  screening_type: string
  status: string
  risk_level: string
  highest_score: number
  primary_question: number
  esas_data: {
    identity: {
      name: string
      age: number
      gender: string
      facility_name?: string
      contact_info?: string
    }
    questions: any
  }
  user_id?: string
  patient_id?: string
  guest_identifier?: string
  is_guest: boolean
  profiles?: {
    full_name: string
    email: string
    role: string
  }
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export default function ScreeningManagementContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, userRole } = useAuthStore()

  const [screenings, setScreenings] = useState<ScreeningData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  const fetchScreenings = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('screenings')
        .select(`
          *,
          profiles!inner(
            full_name,
            email,
            role
          )
        `, { count: 'exact' })

      // Apply filters
      if (searchQuery) {
        query = query.or(`esas_data->>identity->>name.ilike.%${searchQuery}%,profiles.full_name.ilike.%${searchQuery}%`)
      }

      if (riskLevelFilter !== 'all') {
        query = query.eq('risk_level', riskLevelFilter)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Date filter
      if (dateFilter !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          default:
            startDate = new Date(0)
        }

        query = query.gte('created_at', startDate.toISOString())
      }

      const { data, error, count } = await query
        .range(
          (pagination.currentPage - 1) * pagination.itemsPerPage,
          pagination.currentPage * pagination.itemsPerPage - 1
        )
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter by user role in client-side (since it's more complex)
      let filteredData = data || []
      if (userRoleFilter !== 'all') {
        filteredData = filteredData.filter(screening => {
          if (screening.is_guest) {
            return userRoleFilter === 'guest'
          }
          return screening.profiles?.role === userRoleFilter
        })
      }

      setScreenings(filteredData)

      // Update pagination info
      const totalItems = count || 0
      const totalPages = Math.ceil(totalItems / pagination.itemsPerPage)

      setPagination(prev => ({
        ...prev,
        totalItems,
        totalPages,
      }))
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal memuat data screening',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, riskLevelFilter, statusFilter, dateFilter, userRoleFilter, pagination.currentPage, pagination.itemsPerPage, toast, setScreenings, setPagination, setLoading])

  useEffect(() => {
    if (!user || userRole !== 'admin') {
      router.push('/login')
      return
    }

    fetchScreenings()
  }, [user, userRole, router])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        fetchScreenings()
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }))
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, riskLevelFilter, userRoleFilter, dateFilter, statusFilter, pagination.currentPage, fetchScreenings])

  useEffect(() => {
    fetchScreenings()
  }, [pagination.currentPage])

  
  const handleViewDetails = (screeningId: string) => {
    if (screenings.find(s => s.id === screeningId)?.is_guest) {
      const screening = screenings.find(s => s.id === screeningId)
      router.push(`/screening/guest/${screeningId}/result?guest_id=${screening?.guest_identifier}`)
    } else {
      router.push(`/screening/${screeningId}/result`)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Rendah'
      case 'medium': return 'Sedang'
      case 'high': return 'Tinggi'
      case 'critical': return 'Kritis'
      default: return level
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'perawat': return 'Perawat'
      case 'pasien': return 'Pasien'
      default: return role
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }))
    }
  }

  const handleExport = () => {
    toast({
      title: 'Coming Soon',
      description: 'Fitur export data akan segera tersedia',
    })
  }

  if (loading && screenings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data screening...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-sky-900 mb-2">
              Manajemen Data Screening
            </h1>
            <p className="text-sky-600">
              Lihat dan kelola semua data screening ESAS
            </p>
          </div>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Total Screening</p>
                  <p className="text-2xl font-bold text-sky-900">{pagination.totalItems}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Screening Hari Ini</p>
                  <p className="text-2xl font-bold text-sky-900">
                    {screenings.filter(s => {
                      const today = new Date()
                      const screeningDate = new Date(s.created_at)
                      return screeningDate.toDateString() === today.toDateString()
                    }).length}
                  </p>
                </div>
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Risiko Tinggi</p>
                  <p className="text-2xl font-bold text-sky-900">
                    {screenings.filter(s => ['high', 'critical'].includes(s.risk_level)).length}
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Screening Tamu</p>
                  <p className="text-2xl font-bold text-sky-900">
                    {screenings.filter(s => s.is_guest).length}
                  </p>
                </div>
                <User className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-md border-sky-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari nama pasien atau pengguna..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Risk Level Filter */}
              <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tingkat Risiko" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Risiko</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="critical">Kritis</SelectItem>
                </SelectContent>
              </Select>

              {/* User Role Filter */}
              <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role Pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="guest">Tamu</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="perawat">Perawat</SelectItem>
                  <SelectItem value="pasien">Pasien</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tanggal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="week">7 Hari</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="in_progress">Proses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-white/80 backdrop-blur-md border-sky-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pasien</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tipe Screening</TableHead>
                    <TableHead>Skor Tertinggi</TableHead>
                    <TableHead>Risiko</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-sky-600">
                        {loading ? 'Memuat data...' : 'Tidak ada data screening yang ditemukan'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    screenings.map((screening) => (
                      <TableRow key={screening.id} className="hover:bg-sky-50/50">
                        <TableCell className="font-medium">
                          {formatDate(screening.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{screening.esas_data?.identity?.name || '-'}</p>
                            <p className="text-sm text-gray-500">
                              {screening.esas_data?.identity?.age} tahun • {screening.esas_data?.identity?.gender === 'L' ? 'L' : 'P'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {screening.is_guest ? (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-purple-500" />
                              <span className="text-sm text-purple-600">Tamu</span>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">{screening.profiles?.full_name || '-'}</p>
                              <p className="text-sm text-gray-500 truncate max-w-[150px]">
                                {screening.profiles?.email || '-'}
                              </p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {screening.is_guest ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              Tamu
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {getRoleText(screening.profiles?.role || '-')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {screening.screening_type === 'initial' ? 'Awal' : 'Follow-up'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{screening.highest_score}</span>
                            <span className="text-sm text-gray-500">/10</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskLevelColor(screening.risk_level)}>
                            {getRiskLevelText(screening.risk_level)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={screening.status === 'completed' ? 'default' : 'secondary'}>
                            {screening.status === 'completed' ? 'Selesai' : 'Proses'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(screening.id)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Menampilkan {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} hingga{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} dari{' '}
                  {pagination.totalItems} data
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}