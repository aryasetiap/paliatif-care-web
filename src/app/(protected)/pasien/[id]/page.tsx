'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Activity,
  TrendingUp,
  Download,
  FileText,
  ArrowLeft,
  AlertTriangle,
  Heart,
  Clock,
  BarChart3,
} from 'lucide-react'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import {
  getPatientById,
  getSymptomProgression,
  exportPatientHistory,
  type PatientWithScreenings,
} from '@/lib/patient-management-index'
import { PatientManagementPDF } from '@/lib/patient-management-pdf'
import { ScreeningTimeline } from '@/components/pasien/screening-timeline'
import '@/styles/modern-patterns.css'
import { useToast } from '@/components/ui/use-toast'

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string

  const [patient, setPatient] = useState<PatientWithScreenings | null>(null)
  const [symptomProgression, setSymptomProgression] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadPatientData = useCallback(async () => {
    if (!patientId) return

    try {
      setLoading(true)
      setError(null)

      // Load patient basic info with screenings
      const patientData = await getPatientById(patientId)
      setPatient(patientData)

      
      // Load symptom progression
      const progressionData = await getSymptomProgression(patientId)
      setSymptomProgression(progressionData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data pasien'
      setError(errorMessage)

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [patientId, toast])

  useEffect(() => {
    loadPatientData()
  }, [loadPatientData])

  const handleExportPDF = async () => {
    if (!patient || patient.screenings.length === 0) return

    try {
      const healthcareProvider = PatientManagementPDF.createDefaultHealthcareProvider()
      const reportData = await PatientManagementPDF.generateLatestScreeningPDF(
        patient,
        patient.screenings,
        healthcareProvider
      )

      if (reportData) {
        // Implementation would depend on the PDF generation library
        // Trigger PDF download here
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal generate PDF'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleExportHistory = async (format: 'pdf' | 'csv' | 'json') => {
    try {
      const exportData = await exportPatientHistory(patientId, format)

      // Create download link
      const blob = new Blob([exportData.data as string], { type: exportData.mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = exportData.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal export data'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
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

  const getRiskLevelText = (riskLevel: string) => {
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
        return 'Tidak Diketahui'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sky-600">Memuat data pasien...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-purple-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-sky-900 mb-2">Error</h1>
          <p className="text-sky-600 mb-4">{error || 'Pasien tidak ditemukan'}</p>
          <Button asChild>
            <Link href="/pasien">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Pasien
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <HeaderNav />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Button variant="outline" asChild>
                <Link href="/pasien">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-sky-900">{patient.name}</h1>
                <p className="text-sky-600">
                  {patient.age} tahun • {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  {patient.facility_name && ` • ${patient.facility_name}`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportPDF}
                className="bg-blue-600 hover:bg-blue-500 text-white"
                disabled={patient.screenings.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Screening Terakhir
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Patient Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-8 w-8 text-blue-500" />
                <h3 className="text-lg font-semibold text-sky-900">Informasi Dasar</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sky-600">ID Pasien:</span>
                  <span className="font-medium text-sky-900">{patient.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-600">Terdaftar:</span>
                  <span className="font-medium text-sky-900">
                    {patient.created_at
                      ? new Date(patient.created_at).toLocaleDateString('id-ID')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-600">Total Screening:</span>
                  <span className="font-medium text-sky-900">{patient.screening_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-8 w-8 text-green-500" />
                <h3 className="text-lg font-semibold text-sky-900">Status Terakhir</h3>
              </div>
              {patient.last_screening ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-600">Tingkat Risiko:</span>
                    <Badge className={getRiskLevelColor(patient.last_screening.risk_level)}>
                      {getRiskLevelText(patient.last_screening.risk_level)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-600">Skor Tertinggi:</span>
                    <span className="font-medium text-sky-900">
                      {patient.last_screening.highest_score}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-600">Tanggal:</span>
                    <span className="font-medium text-sky-900">
                      {patient.last_screening.created_at
                        ? new Date(patient.last_screening.created_at).toLocaleDateString('id-ID')
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sky-600">Belum ada data screening</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-8 w-8 text-red-500" />
                <h3 className="text-lg font-semibold text-sky-900">Aksi Cepat</h3>
              </div>
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/screening/new?patient=${patient.id}`}>
                    <Activity className="mr-2 h-4 w-4" />
                    Screening Baru
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/screening/new?patient=${patient.id}`}>
                      <FileText className="mr-1 h-3 w-3" />
                      Follow-up
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/screening/new?patient=${patient.id}`}>
                      <BarChart3 className="mr-1 h-3 w-3" />
                      Analisis
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="screenings" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-md border border-sky-200">
              <TabsTrigger value="screenings" className="data-[state=active]:bg-sky-100">
                <Activity className="mr-2 h-4 w-4" />
                Riwayat Screening
              </TabsTrigger>
              <TabsTrigger value="progression" className="data-[state=active]:bg-sky-100">
                <TrendingUp className="mr-2 h-4 w-4" />
                Progress Gejala
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-sky-100">
                <Clock className="mr-2 h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-sky-100">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="screenings" className="mt-6">
              <Card className="bg-white/80 backdrop-blur-md border-sky-200">
                <CardHeader>
                  <CardTitle className="text-xl text-sky-900">Riwayat Screening</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.screenings.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-sky-400" />
                      <h3 className="text-lg font-semibold text-sky-900 mb-2">
                        Belum Ada Screening
                      </h3>
                      <p className="text-sky-600 mb-4">
                        Mulai dengan melakukan screening ESAS untuk pasien ini
                      </p>
                      <Button asChild>
                        <Link href={`/screening/new?patient=${patient.id}`}>
                          <Activity className="mr-2 h-4 w-4" />
                          Screening Pertama
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patient.screenings.map((screening: any) => (
                        <div
                          key={screening.id}
                          className="border border-sky-200 rounded-lg p-4 bg-white/60"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sky-900">
                                {screening.screening_type === 'initial'
                                  ? 'Screening Awal'
                                  : 'Follow-up'}
                              </h4>
                              <p className="text-sm text-sky-600">
                                {new Date(screening.created_at).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getRiskLevelColor(screening.risk_level)}>
                                {getRiskLevelText(screening.risk_level)}
                              </Badge>
                              <span className="text-sm font-medium text-sky-900">
                                Skor: {screening.highest_score}/10
                              </span>
                            </div>
                          </div>
                          {screening.primary_question && (
                            <div className="text-sm text-sky-700">
                              <p>Fokus utama: Pertanyaan {screening.primary_question}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progression" className="mt-6">
              <Card className="bg-white/80 backdrop-blur-md border-sky-200">
                <CardHeader>
                  <CardTitle className="text-xl text-sky-900">Progress Gejala</CardTitle>
                </CardHeader>
                <CardContent>
                  {symptomProgression ? (
                    <div className="space-y-4">
                      {Object.entries(symptomProgression).map(([symptom, data]: [string, any]) => (
                        <div
                          key={symptom}
                          className="border border-sky-200 rounded-lg p-4 bg-white/60"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sky-900">Pertanyaan {symptom}</h4>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(data.statistics.trendDirection)}
                              <span className="text-sm text-sky-600">
                                {data.statistics.trendDirection === 'improving'
                                  ? 'Membaik'
                                  : data.statistics.trendDirection === 'declining'
                                    ? 'Memburuk'
                                    : 'Stabil'}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-sky-600">Rata-rata</p>
                              <p className="font-medium text-sky-900">
                                {data.statistics.averageScore}
                              </p>
                            </div>
                            <div>
                              <p className="text-sky-600">Tertinggi</p>
                              <p className="font-medium text-sky-900">{data.statistics.maxScore}</p>
                            </div>
                            <div>
                              <p className="text-sky-600">Terendah</p>
                              <p className="font-medium text-sky-900">{data.statistics.minScore}</p>
                            </div>
                            <div>
                              <p className="text-sky-600">Improvement</p>
                              <p className="font-medium text-sky-900">
                                {data.statistics.improvementRate > 0 ? '+' : ''}
                                {data.statistics.improvementRate}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sky-600 text-center py-8">
                      Data progress gejala tidak tersedia
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <ScreeningTimeline patient={patient} />
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <Card className="bg-white/80 backdrop-blur-md border-sky-200">
                <CardHeader>
                  <CardTitle className="text-xl text-sky-900">Export Data Pasien</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sky-900 mb-2">Export Riwayat Lengkap</h4>
                      <p className="text-sm text-sky-600 mb-4">
                        Download semua data riwayat screening dan analisis pasien
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleExportHistory('pdf')}
                          disabled={patient.screenings.length === 0}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export PDF
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleExportHistory('csv')}
                          disabled={patient.screenings.length === 0}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleExportHistory('json')}
                          disabled={patient.screenings.length === 0}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export JSON
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
