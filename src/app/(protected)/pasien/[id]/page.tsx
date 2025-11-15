'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Activity,
  FileText,
  ArrowLeft,
  AlertTriangle,
  Heart,
  Clock,
  Calendar,
  ChevronRight,
  Eye,
  Stethoscope,
  Users,
} from 'lucide-react'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { type PatientWithScreenings } from '@/lib/patient-management-index'
import { ScreeningTimeline } from '@/components/pasien/screening-timeline'
import '@/styles/modern-patterns.css'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase'
import { InterventionEngine } from '@/lib/intervention-system'

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string

  const [patient, setPatient] = useState<PatientWithScreenings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadPatientData = useCallback(async () => {
    if (!patientId) return

    try {
      setLoading(true)
      setError(null)

      // Add overall timeout to prevent infinite loading
      const overallTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Overall timeout loading patient data')), 15000)
      )

      const loadDataPromise = async () => {
        // Load patient data from Supabase directly for more control
        const supabase = createClient()

        // Get patient with screenings
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select(
            `
          *,
          screenings (
            id,
            risk_level,
            highest_score,
            primary_question,
            esas_data,
            created_at,
            updated_at,
            screening_type,
            recommendation
          )
        `
          )
          .eq('id', patientId)
          .single()

        if (patientError || !patientData) {
          throw new Error('Data pasien tidak ditemukan')
        }

        // Transform data to match PatientWithScreenings type
        const transformedPatientData: PatientWithScreenings = {
          ...patientData,
          screenings: patientData.screenings || [],
          screening_count: patientData.screenings?.length || 0,
        }

        setPatient(transformedPatientData)
        return true
      }

      await Promise.race([loadDataPromise(), overallTimeout])
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
  }, [patientId, loadPatientData])

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

      <div className="relative z-10 container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Button
                variant="outline"
                asChild
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
              >
                <Link href="/pasien">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-sky-900">{patient.name}</h1>
                <p className="text-sky-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {patient.age} tahun • {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  {patient.facility_name && ` • ${patient.facility_name}`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                asChild
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
              >
                <Link href={`/screening/new?patient=${patient.id}`}>
                  <Activity className="mr-2 h-4 w-4" />
                  Screening Baru
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Patient Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-8 w-8 text-blue-500" />
                <h3 className="text-lg font-semibold text-sky-900">Informasi Dasar</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-sky-600">ID Pasien:</span>
                  <span className="font-medium text-sky-900 font-mono">{patient.id.slice(-8)}</span>
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
                  <span className="font-medium text-sky-900">
                    {patient.screenings?.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-8 w-8 text-green-500" />
                <h3 className="text-lg font-semibold text-sky-900">Status Terakhir</h3>
              </div>
              {patient.screenings && patient.screenings.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-600">Tingkat Risiko:</span>
                    <Badge className={getRiskLevelColor(patient.screenings[0].risk_level)}>
                      {getRiskLevelText(patient.screenings[0].risk_level)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-600">Skor Tertinggi:</span>
                    <span className="font-medium text-sky-900">
                      {patient.screenings[0].highest_score}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-600">Tanggal:</span>
                    <span className="font-medium text-sky-900">
                      {patient.screenings[0].created_at
                        ? new Date(patient.screenings[0].created_at).toLocaleDateString('id-ID')
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sky-600 text-center py-4">Belum ada data screening</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-8 w-8 text-purple-500" />
                <h3 className="text-lg font-semibold text-sky-900">Status Screening</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sky-600">Total Screening:</span>
                  <span className="font-medium text-sky-900">
                    {patient.screenings?.length || 0} kali
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sky-600">Terakhir:</span>
                  <span className="font-medium text-sky-900">
                    {patient.screenings &&
                    patient.screenings.length > 0 &&
                    patient.screenings[0].created_at
                      ? new Date(patient.screenings[0].created_at).toLocaleDateString('id-ID')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card className="bg-white/80 backdrop-blur-md border-sky-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-8 w-8 text-red-500" />
                <h3 className="text-lg font-semibold text-sky-900">Aksi Cepat</h3>
              </div>
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/screening/new?patient=${patient.id}`}>
                    <Activity className="mr-2 h-4 w-4" />
                    Screening ESAS
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                  asChild
                >
                  <Link href={`/pasien/${patient.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card> */}
        </motion.div>

        {/* Enhanced Detailed Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="screenings" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-md border border-sky-200 p-1">
              <TabsTrigger
                value="screenings"
                className="data-[state=active]:bg-sky-100 text-sky-900"
              >
                <Activity className="mr-2 h-4 w-4" />
                Riwayat Screening
              </TabsTrigger>
              <TabsTrigger
                value="intervention"
                className="data-[state=active]:bg-sky-100 text-sky-900"
              >
                <Heart className="mr-2 h-4 w-4" />
                Intervensi
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="data-[state=active]:bg-sky-100 text-sky-900"
              >
                <Stethoscope className="mr-2 h-4 w-4" />
                Edukasi
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-sky-100 text-sky-900">
                <Clock className="mr-2 h-4 w-4" />
                Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="screenings" className="mt-6">
              <Card className="bg-white/80 backdrop-blur-md border-sky-200">
                <CardHeader>
                  <CardTitle className="text-xl text-sky-900">Riwayat Screening ESAS</CardTitle>
                  <CardDescription className="text-sky-600">
                    Histori lengkap screening Edmonton Symptom Assessment System
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!patient.screenings || patient.screenings.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="h-16 w-16 mx-auto mb-4 text-sky-400" />
                      <h3 className="text-xl font-semibold text-sky-900 mb-2">
                        Belum Ada Screening
                      </h3>
                      <p className="text-sky-600 mb-6 max-w-md mx-auto">
                        Mulai dengan melakukan screening ESAS untuk pasien ini. Ini adalah langkah
                        pertama dalam perawatan paliatif.
                      </p>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                        asChild
                      >
                        <Link href={`/screening/new?patient=${patient.id}`}>
                          <Activity className="mr-2 h-4 w-4" />
                          Screening Pertama
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patient.screenings.map((screening: any, index: number) => (
                        <motion.div
                          key={screening.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border border-sky-200 rounded-lg p-4 bg-white/60 hover:bg-white/80 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sky-900">
                                  {screening.screening_type === 'initial'
                                    ? 'Screening Awal'
                                    : 'Follow-up'}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="text-xs border-sky-300 text-sky-700"
                                >
                                  #{index + 1}
                                </Badge>
                              </div>
                              <p className="text-sm text-sky-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(screening.created_at).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getRiskLevelColor(screening.risk_level)}>
                                {getRiskLevelText(screening.risk_level)}
                              </Badge>
                              <span className="text-sm font-medium text-sky-900 bg-sky-50 px-2 py-1 rounded">
                                Skor: {screening.highest_score}/10
                              </span>
                            </div>
                          </div>
                          {screening.primary_question && (
                            <div className="text-sm bg-sky-50 p-3 rounded space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-sky-900">
                                  Rekomendasi Intervensi:
                                </p>
                                <Badge
                                  variant="outline"
                                  className="text-xs border-sky-300 text-sky-700"
                                >
                                  Prioritas{' '}
                                  {InterventionEngine.getInterventionByESASQuestion(
                                    screening.primary_question
                                  )?.diagnosisNumber || '-'}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sky-800">
                                  <span className="font-medium">Terapi:</span>{' '}
                                  {InterventionEngine.getInterventionByESASQuestion(
                                    screening.primary_question
                                  )?.therapyType || 'Tidak Diketahui'}
                                </p>
                                <p className="text-sky-800">
                                  <span className="font-medium">Diagnosa:</span>{' '}
                                  {InterventionEngine.getInterventionByESASQuestion(
                                    screening.primary_question
                                  )?.diagnosisName || 'Tidak Diketahui'}
                                </p>
                                <p className="text-sky-700 text-xs mt-2">
                                  <span className="font-medium">Frekuensi:</span>{' '}
                                  {InterventionEngine.getInterventionByESASQuestion(
                                    screening.primary_question
                                  )?.frequency || 'Tidak Diketahui'}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="mt-2 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-sky-300 text-sky-700 hover:bg-sky-50"
                            >
                              <Link href={`/screening/${screening.id}/result`}>
                                <Eye className="mr-1 h-3 w-3" />
                                Lihat Detail
                              </Link>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intervention" className="mt-6">
              <Card className="bg-white/80 backdrop-blur-md border-sky-200">
                <CardHeader>
                  <CardTitle className="text-xl text-sky-900">Rencana Intervensi</CardTitle>
                  <CardDescription className="text-sky-600">
                    Rekomendasi terapi komplementer berdasarkan hasil screening ESAS terakhir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {patient.screenings && patient.screenings.length > 0 ? (
                    <div className="space-y-6">
                      {(() => {
                        const latestScreening = patient.screenings[0]
                        const intervention = latestScreening.primary_question
                          ? InterventionEngine.getInterventionByESASQuestion(
                              latestScreening.primary_question
                            )
                          : null

                        if (!intervention) {
                          return (
                            <div className="text-center py-8">
                              <Heart className="h-12 w-12 mx-auto mb-4 text-sky-400" />
                              <h3 className="text-lg font-semibold text-sky-900 mb-2">
                                Tidak Ada Intervensi
                              </h3>
                              <p className="text-sky-600">
                                Tidak ada rekomendasi intervensi untuk screening ini
                              </p>
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-6">
                            {/* Intervention Header */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border border-sky-200 rounded-lg p-6 bg-white/60"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-sky-900 mb-2">
                                    {intervention.diagnosisNumber}. {intervention.diagnosisName}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                      {intervention.therapyType}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="border-sky-300 text-sky-700"
                                    >
                                      Prioritas {intervention.diagnosisNumber}
                                    </Badge>
                                  </div>
                                  <p className="text-sky-700">{intervention.description}</p>
                                </div>
                              </div>

                              {/* Key Information */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-sky-50 p-4 rounded">
                                  <p className="text-sm text-sky-600 mb-1">Frekuensi</p>
                                  <p className="font-medium text-sky-900">
                                    {intervention.frequency}
                                  </p>
                                </div>
                                <div className="bg-sky-50 p-4 rounded">
                                  <p className="text-sm text-sky-600 mb-1">Durasi</p>
                                  <p className="font-medium text-sky-900">
                                    {intervention.duration}
                                  </p>
                                </div>
                                <div className="bg-sky-50 p-4 rounded">
                                  <p className="text-sm text-sky-600 mb-1">Evaluasi</p>
                                  <p className="font-medium text-sky-900">
                                    {intervention.evaluationCriteria.slice(0, 2).join(', ')}
                                  </p>
                                </div>
                              </div>

                              {/* Precautions */}
                              {intervention.precautions.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                                  <h4 className="font-medium text-yellow-800 mb-2">
                                    ⚠️ Precautions:
                                  </h4>
                                  <ul className="text-sm text-yellow-700 space-y-1">
                                    {intervention.precautions.map((precaution, index) => (
                                      <li key={index}>• {precaution}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </motion.div>

                            {/* Intervention Steps */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="border border-sky-200 rounded-lg p-6 bg-white/60"
                            >
                              <h4 className="font-semibold text-sky-900 mb-4 flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Langkah-Langkah Intervensi
                              </h4>
                              <div className="space-y-3">
                                {intervention.steps.map((step, index) => (
                                  <div key={step.id} className="flex gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-sm font-medium">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sky-900">{step.description}</p>
                                      {step.duration && (
                                        <p className="text-sm text-sky-600 mt-1">
                                          <span className="font-medium">Durasi:</span>{' '}
                                          {step.duration}
                                        </p>
                                      )}
                                      {step.notes && (
                                        <p className="text-sm text-sky-600 mt-1">
                                          <span className="font-medium">Catatan:</span> {step.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>

                            {/* References */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="border border-sky-200 rounded-lg p-6 bg-white/60"
                            >
                              <h4 className="font-semibold text-sky-900 mb-4 flex items-center">
                                <FileText className="mr-2 h-5 w-5" />
                                Referensi Ilmiah
                              </h4>
                              <div className="space-y-3">
                                {intervention.references.map((ref, index) => (
                                  <div key={index} className="text-sm">
                                    <p className="text-sky-900 font-medium">
                                      {ref.authors} ({ref.year})
                                    </p>
                                    <p className="text-sky-700 italic">{ref.title}</p>
                                    <p className="text-sky-600">
                                      {ref.journal}
                                      {ref.volume ? `, ${ref.volume}` : ''}
                                      {ref.pages ? `, ${ref.pages}` : ''}
                                    </p>
                                    {ref.url && (
                                      <a
                                        href={ref.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                                      >
                                        View Source
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>

                            {/* Action Buttons */}
                            {/* <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="flex gap-3 pt-4"
                            >
                              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white">
                                <Activity className="mr-2 h-4 w-4" />
                                Mulai Intervensi
                              </Button>
                              <Button
                                variant="outline"
                                className="border-sky-300 text-sky-700 hover:bg-sky-50"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download Panduan
                              </Button>
                              <Button
                                variant="outline"
                                className="border-sky-300 text-sky-700 hover:bg-sky-50"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Jadwalkan Follow-up
                              </Button>
                            </motion.div> */}
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto mb-4 text-sky-400" />
                      <h3 className="text-xl font-semibold text-sky-900 mb-2">
                        Belum Ada Screening
                      </h3>
                      <p className="text-sky-600 max-w-md mx-auto mb-6">
                        Lakukan screening ESAS terlebih dahulu untuk mendapatkan rekomendasi
                        intervensi yang tepat.
                      </p>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                        asChild
                      >
                        <Link href={`/screening/new?patient=${patient.id}`}>
                          <Activity className="mr-2 h-4 w-4" />
                          Lakukan Screening Pertama
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="mt-6">
              <Card className="bg-white/80 backdrop-blur-md border-sky-200">
                <CardHeader>
                  <CardTitle className="text-xl text-sky-900">
                    Edukasi 8 Penyakit Terminal
                  </CardTitle>
                  <CardDescription className="text-sky-600">
                    Informasi lengkap tentang 8 penyakit terminal yang relevan dengan perawatan
                    paliatif
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Education Introduction */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-sky-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Stethoscope className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-sky-900">
                            Pemahaman Penyakit Terminal
                          </h3>
                          <p className="text-sm text-sky-600">
                            Edukasi lengkap untuk pasien, keluarga, dan caregiver
                          </p>
                        </div>
                      </div>
                      <p className="text-sky-700">
                        Memahami penyakit adalah langkah pertama dalam memberikan perawatan yang
                        optimal. Setiap penyakit memiliki karakteristik, gejala, dan kebutuhan
                        perawatan yang berbeda.
                      </p>
                    </motion.div>

                    {/* Disease Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          id: 'alzheimer',
                          name: 'Alzheimer',
                          description:
                            'Gangguan otak progresif yang memengaruhi memori dan fungsi kognitif',
                          icon: '🧠',
                          color: 'bg-purple-100 text-purple-800 border-purple-200',
                          symptoms: [
                            'Hilang memori',
                            'Kebingungan',
                            'Perubahan perilaku',
                            'Kesulitan berbicara',
                          ],
                        },
                        {
                          id: 'kanker-payudara',
                          name: 'Kanker Payudara',
                          description: 'Pertumbuhan sel tidak normal di jaringan payudara',
                          icon: '🎗️',
                          color: 'bg-pink-100 text-pink-800 border-pink-200',
                          symptoms: [
                            'Benjolan di payudara',
                            'Nyeri',
                            'Perubahan bentuk',
                            'Keluar cairan dari puting',
                          ],
                        },
                        {
                          id: 'gagal-ginjal',
                          name: 'Gagal Ginjal Kronik',
                          description: 'Penurunan fungsi ginjal yang progresif dan permanen',
                          icon: '⚕️',
                          color: 'bg-green-100 text-green-800 border-green-200',
                          symptoms: [
                            'Lelah',
                            'Pembengkakan kaki',
                            'Sesak napas',
                            'Pengurangan urine',
                          ],
                        },
                        {
                          id: 'diabetes',
                          name: 'Diabetes',
                          description: 'Kelainan metabolisme dengan kadar gula darah tinggi',
                          icon: '💉',
                          color: 'bg-blue-100 text-blue-800 border-blue-200',
                          symptoms: [
                            'Sering buang air kecil',
                            'Haus berlebihan',
                            'Lapar terus',
                            'Berat badan turun',
                          ],
                        },
                        {
                          id: 'gagal-jantung',
                          name: 'Gagal Jantung',
                          description: 'Kemampuan jantung memompa darah yang menurun',
                          icon: '❤️',
                          color: 'bg-red-100 text-red-800 border-red-200',
                          symptoms: [
                            'Sesak napas',
                            'Kelelahan',
                            'Pembengkakan',
                            'Detak jantung tidak teratur',
                          ],
                        },
                        {
                          id: 'hiv-aids',
                          name: 'HIV/AIDS',
                          description: 'Infeksi virus yang menyerang sistem kekebalan tubuh',
                          icon: '🦠',
                          color: 'bg-orange-100 text-orange-800 border-orange-200',
                          symptoms: ['Demam', 'Lelah', 'Berat badan turun', 'Infeksi berulang'],
                        },
                        {
                          id: 'ppok',
                          name: 'PPOK',
                          description:
                            'Penyakit paru obstruktif kronik yang menyebabkan kesulitan bernapas',
                          icon: '🫁',
                          color: 'bg-gray-100 text-gray-800 border-gray-200',
                          symptoms: ['Sesak napas', 'Batuk kronis', 'Dahak', 'Napas berbunyi'],
                        },
                        {
                          id: 'stroke',
                          name: 'Stroke',
                          description:
                            'Gangguan aliran darah ke otak yang menyebabkan kematian sel otak',
                          icon: '🧠',
                          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                          symptoms: [
                            'Kelemahan setengah badan',
                            'Sulit berbicara',
                            'Pusing',
                            'Penglihatan ganda',
                          ],
                        },
                      ].map((disease, index) => (
                        <motion.div
                          key={disease.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border border-sky-200 rounded-lg p-4 bg-white/60 hover:bg-white/80 transition-all hover:shadow-lg cursor-pointer"
                          onClick={() => window.open(`/education/${disease.id}`, '_blank')}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">{disease.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sky-900">{disease.name}</h4>
                              <Badge className={`text-xs ${disease.color}`}>Detail Informasi</Badge>
                            </div>
                            <ChevronRight className="h-4 w-4 text-sky-600" />
                          </div>
                          <p className="text-sm text-sky-700 mb-3">{disease.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-sky-800">Gejala Umum:</p>
                            <div className="flex flex-wrap gap-1">
                              {disease.symptoms.slice(0, 3).map((symptom, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded"
                                >
                                  {symptom}
                                </span>
                              ))}
                              {disease.symptoms.length > 3 && (
                                <span className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded">
                                  +{disease.symptoms.length - 3} lagi
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Resources Section */}
                    {/* <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="border border-sky-200 rounded-lg p-6 bg-white/60"
                    >
                      <h4 className="font-semibold text-sky-900 mb-4 flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Sumber Daya Tambahan
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h5 className="font-medium text-sky-800">Untuk Pasien & Keluarga:</h5>
                          <ul className="text-sm text-sky-700 space-y-1">
                            <li>• Panduan perawatan di rumah</li>
                            <li>• Manajemen nyeri dan gejala</li>
                            <li>• Dukungan psikologis</li>
                            <li>• Konseling gizi</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h5 className="font-medium text-sky-800">Untuk Healthcare Provider:</h5>
                          <ul className="text-sm text-sky-700 space-y-1">
                            <li>• Protokol klinis terbaru</li>
                            <li>• Pedoman perawatan paliatif</li>
                            <li>• Alat asesmen</li>
                            <li>• Referensi penelitian</li>
                          </ul>
                        </div>
                      </div>
                    </motion.div> */}

                    {/* Emergency Information */}
                    {/* <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-6"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <h4 className="font-semibold text-red-800">Informasi Darurat</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-red-700 mb-2">
                            Hubungi tenaga kesehatan jika:
                          </p>
                          <ul className="text-red-600 space-y-1">
                            <li>• Nyeri yang tidak terkontrol</li>
                            <li>• Sesak napas yang parah</li>
                            <li>• Perubahan status mental tiba-tiba</li>
                            <li>• Demam tinggi atau infeksi</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-red-700 mb-2">Layanan darurat:</p>
                          <div className="space-y-1 text-red-600">
                            <p>• Ambulans: 118 atau 119</p>
                            <p>• Hotline paliatif: (021) 1234-5678</p>
                            <p>• Crisis hotline: 500-456</p>
                            <p>• Fasilitas kesehatan terdekat</p>
                          </div>
                        </div>
                      </div>
                    </motion.div> */}

                    {/* Action Buttons */}
                    {/* <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex gap-3 pt-4"
                    >
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Unduh Semua Materi Edukasi
                      </Button>
                      <Button
                        variant="outline"
                        className="border-sky-300 text-sky-700 hover:bg-sky-50"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Edukasi untuk Keluarga
                      </Button>
                      <Button
                        variant="outline"
                        className="border-sky-300 text-sky-700 hover:bg-sky-50"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Jadwalkan Konsultasi Edukasi
                      </Button>
                    </motion.div> */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <ScreeningTimeline patient={patient} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
