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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
  Users,
  Activity,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import * as XLSX from 'xlsx'

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  phone?: string
  address?: string
  facility_name?: string
  emergency_contact?: string
  emergency_phone?: string
  medical_history?: string
  allergies?: string
  current_medications?: string
  created_at: string
  updated_at: string
  user_id: string
}

interface PatientStats {
  totalPatients: number
  newPatientsThisMonth: number
  averageAge: number
  genderDistribution: { male: number; female: number }
}

const ITEMS_PER_PAGE = 10

export default function PatientManagementContent() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<PatientStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState<'all' | 'L' | 'P'>('all')
  const [ageRange, setAgeRange] = useState<{ min?: number; max?: number }>({})
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'age'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Build base query
      let query = supabase.from('patients').select('*', { count: 'exact' })

      // Apply gender filter
      if (genderFilter !== 'all') {
        query = query.eq('gender', genderFilter)
      }

      // Apply age filter
      if (ageRange.min !== undefined) {
        query = query.gte('age', ageRange.min)
      }
      if (ageRange.max !== undefined) {
        query = query.lte('age', ageRange.max)
      }

      // Apply date filters
      if (dateFilter.from) {
        query = query.gte('created_at', dateFilter.from.toISOString())
      }
      if (dateFilter.to) {
        query = query.lte('created_at', dateFilter.to.toISOString())
      }

      // Apply search
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,facility_name.ilike.%${searchTerm}%,emergency_contact.ilike.%${searchTerm}%`
        )
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Get total count with separate query
      let countQuery = supabase.from('patients').select('*', { count: 'exact', head: true })

      // Apply same filters to count query
      if (searchTerm) {
        countQuery = countQuery.or(`name.ilike.%${searchTerm}%,facility_name.ilike.%${searchTerm}%`)
      }

      if (genderFilter !== 'all') {
        countQuery = countQuery.eq('gender', genderFilter)
      }

      const { count: totalCount } = await countQuery
      setTotalItems(totalCount || 0)

      // Get paginated data
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data: patientsData, error } = await query.range(from, to)

      if (error) throw error

      setPatients(patientsData || [])

      // Calculate stats
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

      const [totalPatients, newPatientsThisMonth] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString()),
      ])

      // Get gender distribution and average age
      const { data: allPatients } = await supabase.from('patients').select('age, gender')

      const maleCount = allPatients?.filter((p) => p.gender === 'L').length || 0
      const femaleCount = allPatients?.filter((p) => p.gender === 'P').length || 0
      const avgAge =
        (allPatients || [])?.reduce((sum, p) => sum + (p.age || 0), 0) / (allPatients?.length || 1)

      setStats({
        totalPatients: totalPatients.count || 0,
        newPatientsThisMonth: newPatientsThisMonth.count || 0,
        averageAge: Math.round(avgAge),
        genderDistribution: { male: maleCount, female: femaleCount },
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal memuat data pasien',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, genderFilter, ageRange, sortBy, sortOrder, dateFilter, currentPage, toast])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const exportToExcel = async () => {
    try {
      const supabase = createClient()

      // Get all patients data for export
      let query = supabase.from('patients').select('*')

      // Apply filters to export
      if (genderFilter !== 'all') {
        query = query.eq('gender', genderFilter)
      }
      if (ageRange.min !== undefined) {
        query = query.gte('age', ageRange.min)
      }
      if (ageRange.max !== undefined) {
        query = query.lte('age', ageRange.max)
      }
      if (dateFilter.from) {
        query = query.gte('created_at', dateFilter.from.toISOString())
      }
      if (dateFilter.to) {
        query = query.lte('created_at', dateFilter.to.toISOString())
      }
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,facility_name.ilike.%${searchTerm}%`)
      }

      const { data: exportData, error } = await query

      if (error) throw error

      // Transform data for Excel
      const excelData =
        exportData?.map((patient) => ({
          ID: patient.id,
          'Nama Lengkap': patient.name,
          Umur: patient.age,
          'Jenis Kelamin': patient.gender === 'L' ? 'Laki-laki' : 'Perempuan',
          'No. Telepon': patient.phone || 'N/A',
          Alamat: patient.address || 'N/A',
          Fasilitas: patient.facility_name || 'N/A',
          'Kontak Darurat': patient.emergency_contact || 'N/A',
          'Telepon Darurat': patient.emergency_phone || 'N/A',
          'Riwayat Medis': patient.medical_history || 'N/A',
          Alergi: patient.allergies || 'N/A',
          'Obat Saat Ini': patient.current_medications || 'N/A',
          'Tanggal Daftar': format(new Date(patient.created_at), 'dd/MM/yyyy HH:mm', {
            locale: idLocale,
          }),
          'Terakhir Update': format(new Date(patient.updated_at), 'dd/MM/yyyy HH:mm', {
            locale: idLocale,
          }),
        })) || []

      // Create Excel workbook
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data Pasien')

      // Generate filename with date
      const fileName = `Data_Pasien_${format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: idLocale })}.xlsx`

      // Download file
      XLSX.writeFile(wb, fileName)

      toast({
        title: 'Export Berhasil',
        description: `Data pasien berhasil di-export ke ${fileName}`,
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
    setGenderFilter('all')
    setAgeRange({})
    setSortBy('created_at')
    setSortOrder('desc')
    setDateFilter({})
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: idLocale })
  }

  const getGenderBadgeVariant = (gender: string) => {
    return gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
  }

  const getGenderText = (gender: string) => {
    return gender === 'L' ? 'Laki-laki' : 'Perempuan'
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">Data Pasien</h1>
          <p className="text-sky-600">Kelola informasi pasien terdaftar</p>
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
                <p className="text-sm text-gray-600">Total Pasien</p>
                <p className="text-3xl font-bold text-sky-900">{stats?.totalPatients || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Baru Bulan Ini</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.newPatientsThisMonth || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Umur</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.averageAge || 0} th</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats?.genderDistribution.male || 0} L
                </p>
                <p className="text-lg font-bold text-pink-600">
                  {stats?.genderDistribution.female || 0} P
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
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
                  placeholder="Cari nama pasien atau fasilitas..."
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
            <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Urutkan</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nama</SelectItem>
                    <SelectItem value="age">Umur</SelectItem>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Gender</label>
                <Select value={genderFilter} onValueChange={(value: any) => setGenderFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Umur Min</label>
                <Input
                  type="number"
                  placeholder="Min umur"
                  value={ageRange.min || ''}
                  onChange={(e) =>
                    setAgeRange((prev) => ({
                      ...prev,
                      min: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tanggal Dari</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter.from
                        ? format(dateFilter.from, 'PPP', { locale: idLocale })
                        : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilter.from}
                      onSelect={(date) => setDateFilter((prev) => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tanggal Sampai</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter.to
                        ? format(dateFilter.to, 'PPP', { locale: idLocale })
                        : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilter.to}
                      onSelect={(date) => setDateFilter((prev) => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pasien</CardTitle>
          <CardDescription>
            Menampilkan {patients.length} dari {totalItems} pasien
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Tidak ada data pasien yang ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Umur</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Fasilitas</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{patient.name}</div>
                            {patient.emergency_contact && (
                              <div className="text-sm text-gray-500">
                                Darurat: {patient.emergency_contact}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{patient.age} th</TableCell>
                        <TableCell>
                          <Badge className={getGenderBadgeVariant(patient.gender)}>
                            {getGenderText(patient.gender)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{patient.phone || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {patient.facility_name ? (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span>{patient.facility_name}</span>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>{formatDate(patient.created_at)}</TableCell>
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
