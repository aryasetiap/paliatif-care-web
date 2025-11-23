'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Activity,
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import '@/styles/modern-patterns.css'

interface ExportData {
  screenings: any[]
  users: any[]
  patients: any[]
}

interface ExportOptions {
  dataType: 'screenings' | 'users' | 'patients' | 'all'
  format: 'csv' | 'excel'
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'
  customStartDate?: string
  customEndDate?: string
  userRole?: string
  riskLevel?: string
}

interface StatisticsData {
  totalScreenings: number
  totalUsers: number
  totalPatients: number
  screeningsThisMonth: number
  highRiskScreenings: number
  averageScore: number
}

export default function DataExportContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, userRole } = useAuthStore()

  const [exporting, setExporting] = useState(false)
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    dataType: 'screenings',
    format: 'excel',
    dateRange: 'month',
  })

  useEffect(() => {
    if (!user || userRole !== 'admin') {
      router.push('/login')
      return
    }

    fetchStatistics()
  }, [user, userRole, router])

  const fetchStatistics = async () => {
    try {
      const supabase = createClient()

      const [
        { count: totalScreenings },
        { count: totalUsers },
        { count: totalPatients },
        { count: screeningsThisMonth },
        { count: highRiskScreenings },
      ] = await Promise.all([
        supabase.from('screenings').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('screenings').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('screenings').select('*', { count: 'exact', head: true })
          .in('risk_level', ['high', 'critical']),
      ])

      // Calculate average score
      const { data: screeningScores } = await supabase
        .from('screenings')
        .select('highest_score')
        .not('highest_score', 'is', null)

      const averageScore = screeningScores && screeningScores.length > 0
        ? screeningScores.reduce((sum, s) => sum + s.highest_score, 0) / screeningScores.length
        : 0

      setStatistics({
        totalScreenings: totalScreenings || 0,
        totalUsers: totalUsers || 0,
        totalPatients: totalPatients || 0,
        screeningsThisMonth: screeningsThisMonth || 0,
        highRiskScreenings: highRiskScreenings || 0,
        averageScore: Math.round(averageScore * 10) / 10,
      })
    } catch {
      // Error fetching statistics
    }
  }

  const fetchData = async (): Promise<ExportData> => {
    const supabase = createClient()
    let query: any = supabase.from('screenings')

    // Apply date filter
    if (exportOptions.dateRange !== 'all') {
      let startDate: Date
      const now = new Date()

      switch (exportOptions.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'custom':
          if (exportOptions.customStartDate) {
            startDate = new Date(exportOptions.customStartDate)
          } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          }
          break
        default:
          startDate = new Date(0)
      }

      query = query.gte('created_at', startDate.toISOString())

      if (exportOptions.dateRange === 'custom' && exportOptions.customEndDate) {
        query = query.lte('created_at', new Date(exportOptions.customEndDate).toISOString())
      }
    }

    // Get screening data with user info
    let screeningsData: any[] = []
    if (exportOptions.dataType === 'screenings' || exportOptions.dataType === 'all') {
      const { data: screenings } = await query
        .select('*')
        .order('created_at', { ascending: false })

      screeningsData = screenings || []

      // Apply additional filters
      if (exportOptions.riskLevel && exportOptions.riskLevel !== 'all') {
        screeningsData = screeningsData.filter(s => s.risk_level === exportOptions.riskLevel)
      }

      if (exportOptions.userRole && exportOptions.userRole !== 'all') {
        screeningsData = screeningsData.filter(s => {
          if (s.is_guest) {
            return exportOptions.userRole === 'guest'
          }
          return s.esas_data?.user_role === exportOptions.userRole
        })
      }
    }

    // Get users data
    let usersData: any[] = []
    if (exportOptions.dataType === 'users' || exportOptions.dataType === 'all') {
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      usersData = users || []
    }

    // Get patients data
    let patientsData: any[] = []
    if (exportOptions.dataType === 'patients' || exportOptions.dataType === 'all') {
      const { data: patients } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      patientsData = patients || []
    }

    return {
      screenings: screeningsData,
      users: usersData,
      patients: patientsData,
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${filename}.csv`)
  }

  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, filename)
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  const formatScreeningDataForExport = (screenings: any[]) => {
    return screenings.map(screening => ({
      ID: screening.id,
      Tanggal: new Date(screening.created_at).toLocaleString('id-ID'),
      'Tipe Screening': screening.screening_type === 'initial' ? 'Awal' : 'Follow-up',
      'Nama Pasien': screening.esas_data?.identity?.name || '',
      'Usia Pasien': screening.esas_data?.identity?.age || '',
      'Gender Pasien': screening.esas_data?.identity?.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Fasilitas': screening.esas_data?.identity?.facility_name || '',
      'Pengguna': screening.is_guest ? 'Tamu' : screening.esas_data?.patient_info?.patient_name || 'Unknown User',
      'Role Pengguna': screening.is_guest ? 'Tamu' : screening.esas_data?.user_role || 'Unknown',
      'Email Pengguna': screening.is_guest ? '-' : 'N/A',
      'Skor Tertinggi': screening.highest_score,
      'Tingkat Risiko': screening.risk_level,
      'Pertanyaan Utama': screening.primary_question,
      Status: screening.status,
      'Guest Screening': screening.is_guest ? 'Ya' : 'Tidak',
    }))
  }

  const formatUserDataForExport = (users: any[]) => {
    return users.map(user => ({
      ID: user.id,
      'Nama Lengkap': user.full_name,
      Email: user.email,
      Role: user.role === 'admin' ? 'Admin' : user.role === 'perawat' ? 'Perawat' : 'Pasien',
      'Tanggal Daftar': new Date(user.created_at).toLocaleString('id-ID'),
      'Last Login': user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('id-ID') : 'Belum pernah',
    }))
  }

  const formatPatientDataForExport = (patients: any[]) => {
    return patients.map(patient => ({
      ID: patient.id,
      'Nama Pasien': patient.name,
      Usia: patient.age,
      Gender: patient.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Fasilitas': patient.facility_name || '',
      'Nomor Telepon': patient.phone || '',
      Alamat: patient.address || '',
      'Emergency Contact': patient.emergency_contact || '',
      'Emergency Phone': patient.emergency_phone || '',
      'Riwayat Medis': patient.medical_history || '',
      Alergi: patient.allergies || '',
      'Obat Saat Ini': patient.current_medications || '',
      'Tanggal Daftar': new Date(patient.created_at).toLocaleString('id-ID'),
    }))
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const data = await fetchData()

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      let filename = `export_${exportOptions.dataType}_${timestamp}`

      if (exportOptions.dataType === 'screenings' || exportOptions.dataType === 'all') {
        const formattedScreenings = formatScreeningDataForExport(data.screenings)

        if (exportOptions.dataType === 'screenings') {
          filename = `screenings_${timestamp}`
          if (exportOptions.format === 'csv') {
            exportToCSV(formattedScreenings, filename)
          } else {
            exportToExcel(formattedScreenings, filename)
          }
        }
      }

      if (exportOptions.dataType === 'users' || exportOptions.dataType === 'all') {
        const formattedUsers = formatUserDataForExport(data.users)

        if (exportOptions.dataType === 'users') {
          filename = `users_${timestamp}`
          if (exportOptions.format === 'csv') {
            exportToCSV(formattedUsers, filename)
          } else {
            exportToExcel(formattedUsers, filename)
          }
        }
      }

      if (exportOptions.dataType === 'patients' || exportOptions.dataType === 'all') {
        const formattedPatients = formatPatientDataForExport(data.patients)

        if (exportOptions.dataType === 'patients') {
          filename = `patients_${timestamp}`
          if (exportOptions.format === 'csv') {
            exportToCSV(formattedPatients, filename)
          } else {
            exportToExcel(formattedPatients, filename)
          }
        }
      }

      if (exportOptions.dataType === 'all') {
        // Create a workbook with multiple sheets for Excel
        if (exportOptions.format === 'excel') {
          const wb = XLSX.utils.book_new()

          if (data.screenings.length > 0) {
            const formattedScreenings = formatScreeningDataForExport(data.screenings)
            const wsScreenings = XLSX.utils.json_to_sheet(formattedScreenings)
            XLSX.utils.book_append_sheet(wb, wsScreenings, 'Screenings')
          }

          if (data.users.length > 0) {
            const formattedUsers = formatUserDataForExport(data.users)
            const wsUsers = XLSX.utils.json_to_sheet(formattedUsers)
            XLSX.utils.book_append_sheet(wb, wsUsers, 'Users')
          }

          if (data.patients.length > 0) {
            const formattedPatients = formatPatientDataForExport(data.patients)
            const wsPatients = XLSX.utils.json_to_sheet(formattedPatients)
            XLSX.utils.book_append_sheet(wb, wsPatients, 'Patients')
          }

          XLSX.writeFile(wb, `complete_export_${timestamp}.xlsx`)
        } else {
          // For CSV, export each data type separately
          toast({
            title: 'Export CSV',
            description: 'CSV export for multiple data types will be downloaded separately',
          })

          if (data.screenings.length > 0) {
            const formattedScreenings = formatScreeningDataForExport(data.screenings)
            exportToCSV(formattedScreenings, `screenings_${timestamp}`)
          }

          if (data.users.length > 0) {
            const formattedUsers = formatUserDataForExport(data.users)
            exportToCSV(formattedUsers, `users_${timestamp}`)
          }

          if (data.patients.length > 0) {
            const formattedPatients = formatPatientDataForExport(data.patients)
            exportToCSV(formattedPatients, `patients_${timestamp}`)
          }
        }
      }

      toast({
        title: 'Export Berhasil',
        description: `Data berhasil diekspor dalam format ${exportOptions.format.toUpperCase()}`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal mengekspor data',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const generateReport = async () => {
    // Generate statistical report
    try {
      setExporting(true)

      const reportData = [
        { 'Metrik': 'Total Screening', 'Nilai': statistics?.totalScreenings || 0 },
        { 'Metrik': 'Total Pengguna', 'Nilai': statistics?.totalUsers || 0 },
        { 'Metrik': 'Total Pasien', 'Nilai': statistics?.totalPatients || 0 },
        { 'Metrik': 'Screening Bulan Ini', 'Nilai': statistics?.screeningsThisMonth || 0 },
        { 'Metrik': 'Screening Risiko Tinggi', 'Nilai': statistics?.highRiskScreenings || 0 },
        { 'Metrik': 'Rata-rata Skor ESAS', 'Nilai': statistics?.averageScore || 0 },
        { 'Metrik': 'Tanggal Laporan', 'Nilai': new Date().toLocaleString('id-ID') },
      ]

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `statistical_report_${timestamp}`

      if (exportOptions.format === 'csv') {
        exportToCSV(reportData, filename)
      } else {
        exportToExcel(reportData, filename)
      }

      toast({
        title: 'Laporan Berhasil',
        description: 'Laporan statistik berhasil dibuat',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal membuat laporan',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  if (!user || userRole !== 'admin') {
    return null
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-sky-900 mb-2">
            Export Data
          </h1>
          <p className="text-sky-600">
            Download data dalam format CSV atau Excel untuk analisis lebih lanjut
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-sky-600" />
                Statistik Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Screening</span>
                  <Badge variant="outline">{statistics?.totalScreenings || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Pengguna</span>
                  <Badge variant="outline">{statistics?.totalUsers || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Pasien</span>
                  <Badge variant="outline">{statistics?.totalPatients || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Aktivitas Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Screening</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {statistics?.screeningsThisMonth || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risiko Tinggi</span>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {statistics?.highRiskScreenings || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rata-rata Skor</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {statistics?.averageScore || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={generateReport}
                  disabled={exporting}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Laporan Statistik
                </Button>
                <Button
                  onClick={() => {
                    setExportOptions({
                      ...exportOptions,
                      dataType: 'all',
                      dateRange: 'month',
                    })
                    handleExport()
                  }}
                  disabled={exporting}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Semua Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="bg-white/80 backdrop-blur-md border-sky-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-sky-600" />
              Pilihan Export
            </CardTitle>
            <CardDescription>
              Konfigurasikan data yang ingin diekspor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Data Type Selection */}
              <div>
                <label className="text-sm font-medium text-sky-700 mb-2 block">
                  Jenis Data
                </label>
                <Select
                  value={exportOptions.dataType}
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, dataType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screenings">Data Screening</SelectItem>
                    <SelectItem value="users">Data Pengguna</SelectItem>
                    <SelectItem value="patients">Data Pasien</SelectItem>
                    <SelectItem value="all">Semua Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Format Selection */}
              <div>
                <label className="text-sm font-medium text-sky-700 mb-2 block">
                  Format Export
                </label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel (.xlsx)
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CSV (.csv)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-sky-700 mb-2 block">
                  Rentang Waktu
                </label>
                <Select
                  value={exportOptions.dateRange}
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Waktu</SelectItem>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="week">7 Hari Terakhir</SelectItem>
                    <SelectItem value="month">Bulan Ini</SelectItem>
                    <SelectItem value="custom">Kustom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range (shown when custom is selected) */}
              {exportOptions.dateRange === 'custom' && (
                <div className="md:col-span-3">
                  <label className="text-sm font-medium text-sky-700 mb-2 block">
                    Rentang Tanggal Kustom
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="date"
                        placeholder="Tanggal Mulai"
                        value={exportOptions.customStartDate || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, customStartDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Input
                        type="date"
                        placeholder="Tanggal Selesai"
                        value={exportOptions.customEndDate || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, customEndDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Filters for Screenings */}
              {exportOptions.dataType === 'screenings' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-sky-700 mb-2 block">
                      Filter Role Pengguna
                    </label>
                    <Select
                      value={exportOptions.userRole || 'all'}
                      onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, userRole: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Role</SelectItem>
                        <SelectItem value="guest">Tamu</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="perawat">Perawat</SelectItem>
                        <SelectItem value="pasien">Pasien</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-sky-700 mb-2 block">
                      Filter Tingkat Risiko
                    </label>
                    <Select
                      value={exportOptions.riskLevel || 'all'}
                      onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, riskLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Risiko</SelectItem>
                        <SelectItem value="low">Rendah</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="high">Tinggi</SelectItem>
                        <SelectItem value="critical">Kritis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* Export Button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleExport}
                disabled={exporting}
                size="lg"
                className="flex items-center gap-2 px-8"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Mengekspor...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export History (Placeholder) */}
        <Card className="bg-white/80 backdrop-blur-md border-sky-200 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-600" />
              Riwayat Export
            </CardTitle>
            <CardDescription>
              Histori export data yang telah dilakukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada riwayat export</p>
              <p className="text-sm mt-2">Riwayat export akan muncul di sini setelah Anda melakukan export</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}