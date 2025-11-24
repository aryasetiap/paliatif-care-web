'use client'

import { useState, useEffect, useCallback } from 'react'

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
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  Search,
  Download,
  Users,
  UserCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import * as XLSX from 'xlsx'

interface Nurse {
  id: string
  full_name: string
  role: string
  created_at: string
  patient_count?: number
}

interface NurseStats {
  totalNurses: number
  activeNurses: number
  newNursesThisMonth: number
}

const ITEMS_PER_PAGE = 10

export default function NurseManagementContent() {
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [stats, setStats] = useState<NurseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'full_name' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  const fetchNurses = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Build query
      let query = supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'perawat')

      // Apply search
      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Get paginated data
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data: nursesData, error, count } = await query.range(from, to)

      if (error) throw error

      // Get patient count for each nurse
      const nurseIds = nursesData?.map((nurse) => nurse.id) || []
      let patientCounts: { [key: string]: number } = {}

      if (nurseIds.length > 0) {
        const { data: patients } = await supabase
          .from('patients')
          .select('user_id')
          .in('user_id', nurseIds)

        patientCounts = nurseIds.reduce(
          (acc, nurseId) => {
            acc[nurseId] = patients?.filter((p) => p.user_id === nurseId).length || 0
            return acc
          },
          {} as { [key: string]: number }
        )
      }

      const nursesWithCount =
        nursesData?.map((nurse) => ({
          ...nurse,
          patient_count: patientCounts[nurse.id] || 0,
        })) || []

      setNurses(nursesWithCount)
      setTotalItems(count || 0)

      // Calculate stats
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

      const [totalNurses, newNursesThisMonth] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'perawat'),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'perawat')
          .gte('created_at', monthStart.toISOString()),
      ])

      setStats({
        totalNurses: totalNurses.count || 0,
        activeNurses: totalNurses.count || 0,
        newNursesThisMonth: newNursesThisMonth.count || 0,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal memuat data perawat',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, sortBy, sortOrder, currentPage, toast])

  useEffect(() => {
    fetchNurses()
  }, [fetchNurses])

  const exportToExcel = async () => {
    try {
      const supabase = createClient()

      // Get all nurses data for export
      let query = supabase.from('profiles').select('*').eq('role', 'perawat')

      // Apply search to export
      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`)
      }

      const { data: exportData, error } = await query

      if (error) throw error

      // Get patient count for export data
      const exportNurseIds = exportData?.map((nurse) => nurse.id) || []
      let exportPatientCounts: { [key: string]: number } = {}

      if (exportNurseIds.length > 0) {
        const { data: exportPatients } = await supabase
          .from('patients')
          .select('user_id')
          .in('user_id', exportNurseIds)

        exportPatientCounts = exportNurseIds.reduce(
          (acc, nurseId) => {
            acc[nurseId] = exportPatients?.filter((p) => p.user_id === nurseId).length || 0
            return acc
          },
          {} as { [key: string]: number }
        )
      }

      // Transform data for Excel with requested format
      const excelData =
        exportData?.map((nurse) => ({
          create_at: format(new Date(nurse.created_at), 'dd/MM/yyyy HH:mm', {
            locale: idLocale,
          }),
          id_perawat: nurse.id,
          nama_perawat: nurse.full_name,
          jumlah_pasien: exportPatientCounts[nurse.id] || 0,
        })) || []

      // Create Excel workbook
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data Perawat')

      // Generate filename with date
      const fileName = `Data_Perawat_${format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: idLocale })}.xlsx`

      // Download file
      XLSX.writeFile(wb, fileName)

      toast({
        title: 'Export Berhasil',
        description: `Data perawat berhasil di-export ke ${fileName}`,
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
    setSortBy('created_at')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: idLocale })
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">Data Perawat</h1>
          <p className="text-sky-600">Kelola informasi perawat terdaftar</p>
        </div>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Perawat</p>
                <p className="text-3xl font-bold text-sky-900">{stats?.totalNurses || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-3xl font-bold text-green-600">{stats?.activeNurses || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Baru Bulan Ini</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.newNursesThisMonth || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
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
                  placeholder="Cari nama perawat..."
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
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Urutkan</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_name">Nama</SelectItem>
                    <SelectItem value="created_at">Tanggal Daftar</SelectItem>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Perawat</CardTitle>
          <CardDescription>
            Menampilkan {nurses.length} dari {totalItems} perawat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : nurses.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Tidak ada data perawat yang ditemukan</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Jumlah Pasien</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nurses.map((nurse) => (
                    <TableRow key={nurse.id}>
                      <TableCell className="font-medium">{nurse.full_name}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{nurse.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-bold text-blue-600">
                            {nurse.patient_count || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(nurse.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
