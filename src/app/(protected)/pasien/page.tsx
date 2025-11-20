'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Plus,
  Calendar,
  User,
  AlertTriangle,
  TrendingUp,
  Filter,
  Eye,
  Grid,
  List,
} from 'lucide-react'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import {
  searchPatients,
  type Patient,
  type PatientSearch,
  getDashboardStats,
  getPatientsWithLatestScreening,
} from '@/lib/patient-management-index'
import { PatientCardList } from '@/components/pasien/patient-cards'
import { PatientFormDialog, QuickAddPatient } from '@/components/pasien/patient-form'
import '@/styles/modern-patterns.css'
import { createClient } from '@/lib/supabase'
import { InterventionEngine } from '@/lib/intervention-system'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<PatientSearch>({
    page: 1,
    limit: 10,
    sortBy: 'name', // Use valid column from patients table
    sortOrder: 'desc',
  })
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [stats, setStats] = useState<any>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // View state
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [patientsWithScreening, setPatientsWithScreening] = useState<
    Array<
      Patient & {
        last_screening?: {
          risk_level: string
          highest_score: number
          created_at: string
        }
        screening_count?: number
      }
    >
  >([])
  const [latestScreenings, setLatestScreenings] = useState<Record<string, any>>({})

  // Helper function to validate and format dates
  const validateAndFormatDate = useCallback(
    (dateString: string | undefined, _fieldName: string): string | undefined => {
      if (!dateString) return undefined

      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return undefined
      }

      // Check if date is in the future
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      if (date > today) {
        return today.toISOString().split('T')[0]
      }

      // Additional validation for calendar dates
      const [year, month, day] = dateString.split('-').map(Number)
      const isValidCalendarDate = year && month && day && month >= 1 && month <= 12 && day >= 1

      // Validate days per month
      const daysInMonth = new Date(year, month, 0).getDate()
      if (!isValidCalendarDate || day > daysInMonth) {
        return undefined
      }

      return dateString
    },
    []
  )

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true)

      // Validate and format dates using helper function
      const formattedDateFrom = validateAndFormatDate(dateFrom, 'loadPatients.dateFrom')
      const formattedDateTo = validateAndFormatDate(dateTo, 'loadPatients.dateTo')

      const params = {
        ...searchParams,
        dateFrom: formattedDateFrom,
        dateTo: formattedDateTo,
        // Fix order parameter - patients table doesn't have screenings.created_at
        sortBy:
          searchParams.sortBy === 'screenings.created_at' ? 'created_at' : searchParams.sortBy,
        sortOrder: searchParams.sortOrder || 'desc',
      }

      const result = await searchPatients(params)

      if (!result) {
        throw new Error('Failed to fetch patients data')
      }

      setPatients(result.patients || [])
      setTotal(result.total || 0)
      setTotalPages(result.totalPages || 0)

      // Load latest screening data for each patient in parallel
      if (result.patients && result.patients.length > 0) {
        const screeningPromises = result.patients.map(async (patient) => {
          try {
            const latestScreening = await getLatestScreening(patient.id)
            return { patientId: patient.id, screening: latestScreening }
          } catch {
            return { patientId: patient.id, screening: null }
          }
        })

        const screeningResults = await Promise.allSettled(screeningPromises)
        const screeningData: Record<string, any> = {}

        screeningResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.screening) {
            screeningData[result.value.patientId] = result.value.screening
          }
        })

        setLatestScreenings(screeningData)

        // Load patients with latest screening for card view
        try {
          // getPatientsWithLatestScreening only accepts a number limit parameter
          const cardViewLimit = typeof searchParams.limit === 'number' ? searchParams.limit : 10
          const patientsWithLatest = await getPatientsWithLatestScreening(cardViewLimit)

          // Map data structure to match what PatientCard component expects
          const mappedPatients = (patientsWithLatest || []).map((patient) => ({
            ...patient,
            // Transform screenings to last_screening for card compatibility
            last_screening: patient.screenings
              ? {
                  risk_level: patient.screenings.risk_level,
                  highest_score: patient.screenings.highest_score,
                  created_at: patient.screenings.created_at,
                }
              : undefined, // Pasien tanpa screening akan punya undefined
            screening_count: patient.screening_count || 0,
          }))

          setPatientsWithScreening(mappedPatients)
        } catch {
          setPatientsWithScreening([])
        }
      } else {
        setLatestScreenings({})
        setPatientsWithScreening([])
      }
    } catch {
      // Reset state on error
      setPatients([])
      setTotal(0)
      setTotalPages(0)
      setLatestScreenings({})
      setPatientsWithScreening([])
    } finally {
      setLoading(false)
    }
  }, [searchParams, dateFrom, dateTo, validateAndFormatDate])

  useEffect(() => {
    // Only load if search params are valid
    const hasValidDates =
      !searchParams.dateFrom ||
      !searchParams.dateTo ||
      (validateAndFormatDate(searchParams.dateFrom, 'effect.dateFrom') &&
        validateAndFormatDate(searchParams.dateTo, 'effect.dateTo'))

    if (hasValidDates) {
      loadPatients()
      loadStats()
    }
  }, [searchParams, loadPatients, validateAndFormatDate])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchParams((prev: PatientSearch) => ({
        ...prev,
        search: searchQuery.trim() || undefined,
        page: 1,
      }))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Initialize and validate dates on mount and clean any invalid state
  useEffect(() => {
    // Force clear any persistent invalid dates from storage or state
    const today = new Date()

    // Clear date inputs immediately if they contain invalid dates
    if (dateFrom) {
      const isInvalid =
        dateFrom.includes('2025-11-31') ||
        new Date(dateFrom) > today ||
        isNaN(new Date(dateFrom).getTime())
      if (isInvalid) {
        setDateFrom('')
      }
    }

    if (dateTo) {
      const isInvalid =
        dateTo.includes('2025-11-31') ||
        new Date(dateTo) > today ||
        isNaN(new Date(dateTo).getTime())
      if (isInvalid) {
        setDateTo('')
      }
    }

    // Reset search params to clean defaults
    setSearchParams({
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'desc',
      dateFrom: undefined,
      dateTo: undefined,
      search: undefined,
    })

    // Clear any localStorage/sessionStorage that might have invalid dates
    try {
      const keysToCheck = ['patientSearchFilters', 'dateFilters', 'pasien-page-state']
      keysToCheck.forEach((key) => {
        const item = localStorage.getItem(key)
        if (item && item.includes('2025-11-31')) {
          localStorage.removeItem(key)
        }
      })
    } catch {
      // Silently handle localStorage access errors
    }
  }, [dateFrom, dateTo]) // Dependencies: dateFrom and dateTo

  const loadStats = async () => {
    try {
      const dashboardStats = await getDashboardStats()
      setStats(
        dashboardStats || {
          totalPatients: 0,
          totalScreenings: 0,
          screeningsThisMonth: 0,
          highRiskPatients: [],
        }
      )
    } catch {
      // Set default stats on error
      setStats({
        totalPatients: 0,
        totalScreenings: 0,
        screeningsThisMonth: 0,
        highRiskPatients: [],
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (totalPages > 0 && newPage > totalPages)) {
      return
    }
    setSearchParams((prev: PatientSearch) => ({ ...prev, page: newPage }))
  }

  const handleSort = (sortBy: string) => {
    setSearchParams((prev: PatientSearch) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1, // Reset to first page when sorting
    }))
  }

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
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

  const getRiskLevelText = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'Kritis'
      case 'high':
        return 'Tinggi'
      case 'medium':
        return 'Sedang'
      case 'low':
        return 'Rendah'
      default:
        return 'Belum Ada'
    }
  }

  const getLatestScreening = async (patientId: string) => {
    try {
      if (!patientId) {
        return null
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('screenings')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        return null
      }

      return data
    } catch {
      return null
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <HeaderNav />

      <div className="relative z-10 container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-sky-900 mb-2">Manajemen Pasien</h1>
              <p className="text-sky-600">Kelola data pasien dan riwayat screening</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button
                onClick={() => setShowAddDialog(true)}
                variant="outline"
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
              >
                <User className="mr-2 h-4 w-4" />
                Tambah Pasien
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                asChild
              >
                <Link href="/screening/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Screening Baru
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-sky-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sky-600">Total Pasien</p>
                    <p className="text-2xl font-bold text-sky-900">{stats.totalPatients}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-md border-sky-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sky-600">Total Screening</p>
                    <p className="text-2xl font-bold text-sky-900">{stats.totalScreenings}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-md border-sky-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sky-600">Screening Bulan Ini</p>
                    <p className="text-2xl font-bold text-sky-900">{stats.screeningsThisMonth}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            {/* <Card className="bg-white/80 backdrop-blur-md border-sky-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sky-600">Risiko Tinggi</p>
                    <p className="text-2xl font-bold text-sky-900">
                      {stats.highRiskPatients.length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card> */}
          </motion.div>
        )}

        {/* Search and Filters */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md border border-sky-200 rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
              <Input
                placeholder="Cari nama pasien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90 border-sky-300 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
              <Input
                type="date"
                placeholder="Dari tanggal pendaftaran"
                value={dateFrom}
                onChange={(e) => {
                  const newDate = e.target.value
                  const validDate = validateAndFormatDate(newDate, 'dateFrom input')
                  if (validDate) {
                    setDateFrom(validDate)
                  } else {
                    setDateFrom('')
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                className="pl-10 bg-white/90 border-sky-300 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
              <Input
                type="date"
                placeholder="Sampai tanggal pendaftaran"
                value={dateTo}
                onChange={(e) => {
                  const newDate = e.target.value
                  const validDate = validateAndFormatDate(newDate, 'dateTo input')
                  if (validDate) {
                    setDateTo(validDate)
                  } else {
                    setDateTo('')
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                className="pl-10 bg-white/90 border-sky-300 focus:border-blue-500"
              />
            </div>
            <Button
              onClick={() => {
                setSearchQuery('')
                setDateFrom('')
                setDateTo('')
                // Reset search params to valid defaults
                setSearchParams((prev) => ({
                  ...prev,
                  dateFrom: undefined,
                  dateTo: undefined,
                  search: undefined,
                  page: 1,
                }))
              }}
              variant="outline"
              className="border-sky-300 text-sky-700 hover:bg-sky-50"
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={
                  viewMode === 'table'
                    ? 'bg-sky-600 text-white'
                    : 'border-sky-300 text-sky-700 hover:bg-sky-50'
                }
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className={
                  viewMode === 'cards'
                    ? 'bg-sky-600 text-white'
                    : 'border-sky-300 text-sky-700 hover:bg-sky-50'
                }
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div> */}

        {/* Patients Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-md border border-sky-200 rounded-xl overflow-hidden"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <CardTitle className="text-xl text-sky-900">
                  Daftar Pasien ({total} pasien)
                </CardTitle>
                {/* <div className="flex items-center gap-4">
                  <div className="text-sm text-sky-600">
                    Tampilan: {viewMode === 'table' ? 'Tabel' : 'Kartu'}
                  </div>
                  {(dateFrom || dateTo) && (
                    <div className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">
                      {dateFrom && dateTo
                        ? `${new Date(dateFrom).toLocaleDateString('id-ID')} - ${new Date(dateTo).toLocaleDateString('id-ID')}`
                        : dateFrom
                          ? `Dari ${new Date(dateFrom).toLocaleDateString('id-ID')}`
                          : `Sampai ${new Date(dateTo).toLocaleDateString('id-ID')}`}
                    </div>
                  )}
                </div> */}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sky-600">Memuat data...</span>
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-12">
                  <QuickAddPatient onPatientCreated={() => loadPatients()} />
                </div>
              ) : viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-sky-50"
                          onClick={() => handleSort('name')}
                        >
                          Nama Pasien
                          {searchParams.sortBy === 'name' && (
                            <span className="ml-1">
                              {searchParams.sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </TableHead>
                        <TableHead>Usia</TableHead>
                        <TableHead>Jenis Kelamin</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-sky-50"
                          onClick={() => handleSort('created_at')}
                        >
                          Tanggal Daftar
                          {searchParams.sortBy === 'created_at' && (
                            <span className="ml-1">
                              {searchParams.sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </TableHead>
                        <TableHead>Risiko Terakhir</TableHead>
                        <TableHead>Intervensi</TableHead>
                        <TableHead>Screening Terakhir</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((patient) => {
                        const latestScreening = latestScreenings[patient.id]
                        return (
                          <TableRow
                            key={patient.id}
                            className="hover:bg-sky-50/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              <div>
                                <p className="text-sky-900">{patient.name || 'Tanpa Nama'}</p>
                                {patient.facility_name && (
                                  <p className="text-xs text-sky-600">{patient.facility_name}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{patient.age ? `${patient.age} tahun` : 'N/A'}</TableCell>
                            <TableCell>
                              {patient.gender === 'L'
                                ? 'Laki-laki'
                                : patient.gender === 'P'
                                  ? 'Perempuan'
                                  : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {patient.created_at
                                ? new Date(patient.created_at).toLocaleDateString('id-ID')
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {latestScreening ? (
                                <Badge className={getRiskLevelColor(latestScreening.risk_level)}>
                                  {getRiskLevelText(latestScreening.risk_level)}
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                  Belum Ada
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {latestScreening ? (
                                <div className="text-sm max-w-xs">
                                  <p className="font-medium text-sky-900">
                                    {(latestScreening.primary_question &&
                                      InterventionEngine.getInterventionByESASQuestion(
                                        latestScreening.primary_question
                                      )?.therapyType) ||
                                      'Tidak Diketahui'}
                                  </p>
                                  <p className="text-xs text-sky-600 truncate">
                                    {(latestScreening.primary_question &&
                                      InterventionEngine.getInterventionByESASQuestion(
                                        latestScreening.primary_question
                                      )?.diagnosisName) ||
                                      '-'}
                                  </p>
                                </div>
                              ) : (
                                <div className="text-sm text-sky-600">
                                  <p>-</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {latestScreening ? (
                                <div className="text-sm">
                                  <p className="text-sky-900">
                                    Skor: {latestScreening.highest_score ?? 'N/A'}
                                  </p>
                                  <p className="text-xs text-sky-600">
                                    {latestScreening.created_at
                                      ? new Date(latestScreening.created_at).toLocaleDateString(
                                          'id-ID'
                                        )
                                      : 'N/A'}
                                  </p>
                                </div>
                              ) : (
                                <div className="text-sm text-sky-600">
                                  <p>Belum ada screening</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-sky-300 text-sky-700 hover:bg-sky-50"
                                  asChild
                                >
                                  <Link href={`/pasien/${patient.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Card View
                <PatientCardList patients={patientsWithScreening} loading={loading} />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-sky-200">
                  <div className="text-sm text-sky-600">
                    Menampilkan {patients.length} dari {total} pasien
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(searchParams.page! - 1)}
                      disabled={searchParams.page! <= 1}
                      className="border-sky-300 text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                    >
                      Sebelumnya
                    </Button>
                    <span className="flex items-center px-3 text-sm text-sky-600">
                      Halaman {searchParams.page} dari {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(searchParams.page! + 1)}
                      disabled={searchParams.page! >= totalPages}
                      className="border-sky-300 text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />

      {/* Patient Add Dialog */}
      <PatientFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          loadPatients()
          loadStats()
        }}
      />
    </div>
  )
}
