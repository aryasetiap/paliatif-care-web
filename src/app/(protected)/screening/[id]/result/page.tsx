'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { ScrollArea } from '@/components/ui/scroll-area'

import { createClient } from '@/lib/supabase'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { BookOpen, Heart, Play } from 'lucide-react'
import '@/styles/modern-patterns.css'
import VideoPlayer from '@/components/video-player'
import { getRecommendedVideos, formatESASScores } from '@/lib/videoRecomendations'
import ESASRuleEngine from '@/lib/esas-rule-engine'

interface ScreeningData {
  id: string
  patient_id?: string
  highest_score: number
  primary_question: number
  risk_level: string
  esas_data: {
    identity?: {
      name: string
      age: number
      gender: string
      facility_name?: string
    }
    questions?: {
      [key: string]: {
        score: number
        text: string
        description?: string
      }
    }
    // Handle old format data
    pain?: number
    nausea?: number
    [key: string]: any
  }
  recommendation: {
    diagnosis?: string
    intervention_steps?: string[]
    references?: string[]
    action_required?: string
    priority?: number
    therapy_type?: string
    frequency?: string
    // Handle old format data
    level?: string
    actions?: string[]
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

const RISK_LEVEL_CONFIG = {
  low: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Rendah',
    description: 'Gejala ringan, monitoring rutin',
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Sedang',
    description: 'Gejala sedang, perlu evaluasi lebih lanjut',
  },
  high: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Tinggi',
    description: 'Gejala berat, perlu penanganan segera',
  },
  critical: {
    color: 'bg-red-200 text-red-900 border-red-300',
    label: 'Kritis',
    description: 'Gejala kritis, segera rujuk ke fasilitas kesehatan',
  },
}

function getScoreColor(score: number) {
  if (score === 0) return 'bg-gray-100 text-gray-800'
  if (score >= 1 && score <= 3) return 'bg-green-100 text-green-800'
  if (score >= 4 && score <= 6) return 'bg-yellow-100 text-yellow-800'
  if (score >= 7 && score <= 10) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

// Helper function to normalize screening data format
function normalizeScreeningData(data: any): ScreeningData {
  return {
    ...data,
    esas_data: {
      identity: data.esas_data?.identity || {
        name: 'Tidak diketahui',
        age: 0,
        gender: 'L',
        facility_name: '',
      },
      questions: data.esas_data?.questions || {
        '1': {
          score: data.esas_data?.pain || 0,
          text: 'Nyeri',
          description: 'Nyeri ringan/sedang/berat',
        },
        '2': {
          score: 0,
          text: 'Lelah/Kekurangan Tenaga',
          description: 'Kelelahan/Intoleransi Aktivitas',
        },
        '3': { score: 0, text: 'Kantuk/Gangguan Tidur', description: 'Gangguan Pola Tidur' },
        '4': { score: data.esas_data?.nausea || 0, text: 'Mual/Nausea', description: 'Nausea' },
        '5': { score: 0, text: 'Nafsu Makan', description: 'Resiko Defisit Nutrisi' },
        '6': { score: 0, text: 'Sesak/Pola Napas', description: 'Pola Napas Tidak Efektif' },
        '7': { score: 0, text: 'Sedih/Keputusasaan', description: 'Keputusasaan/Depresi' },
        '8': { score: 0, text: 'Cemas/Ansietas', description: 'Ansietas' },
        '9': { score: 0, text: 'Perasaan Keseluruhan', description: 'Koping Keluarga' },
      },
      ...data.esas_data,
    },
    recommendation: {
      diagnosis: data.recommendation?.diagnosis || 'Nyeri kronis',
      intervention_steps: data.recommendation?.intervention_steps ||
        data.recommendation?.actions || ['Monitor tingkat nyeri'],
      references: data.recommendation?.references || [
        'Assessment and Management of Cancer Pain, WHO Guidelines',
      ],
      action_required: data.recommendation?.action_required || 'Perlu intervensi keperawatan',
      priority: data.recommendation?.priority || 2,
      therapy_type: data.recommendation?.therapy_type || 'Terapi Relaksasi',
      frequency: data.recommendation?.frequency || '2 kali sehari',
      ...data.recommendation,
    },
  }
}

export default function ScreeningResultPage() {
  const params = useParams()
  const router = useRouter()
  const [screeningData, setScreeningData] = useState<ScreeningData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScreeningData = useCallback(async () => {
    try {
      const supabase = createClient()

      // Validate params.id exists
      if (!params.id) {
        setError('ID screening tidak valid')
        return
      }

      const { data, error } = await supabase
        .from('screenings')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        setError(error.message || 'Gagal mengambil data screening')
        toast.error('Gagal mengambil data screening')
        return
      }

      if (!data) {
        setError('Data screening tidak ditemukan')
        toast.error('Data screening tidak ditemukan')
        return
      }

      // Normalize data to handle different formats
      const normalizedData = normalizeScreeningData(data)
      setScreeningData(normalizedData)
    } catch (error: any) {
      setError(error.message || 'Gagal mengambil data screening')
      toast.error('Gagal mengambil data screening')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchScreeningData()
  }, [fetchScreeningData])

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sky-600">Memuat data screening...</p>
        </div>
      </div>
    )
  }

  if (error || !screeningData) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-sky-900 mb-2">Error</h2>
          <p className="text-sky-600 mb-4">{error || 'Data screening tidak ditemukan'}</p>
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </div>
    )
  }

  const riskConfig =
    RISK_LEVEL_CONFIG[screeningData.risk_level as keyof typeof RISK_LEVEL_CONFIG] ||
    RISK_LEVEL_CONFIG.low

  return (
    <div className="relative min-h-screen">
      <HeaderNav />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl mt-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-sky-900 mb-2">Hasil Screening ESAS</h1>
              <p className="text-sky-600">
                Edmonton Symptom Assessment System - Hasil Penilaian Gejala Pasien Paliatif
              </p>
            </div>
          </div>
        </motion.div>

        {/* Patient Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200 mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Informasi Pasien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-sky-600">Nama Pasien</label>
                  <p className="text-lg font-semibold text-sky-900">
                    {screeningData.esas_data?.identity?.name || 'Data tidak lengkap'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sky-600">Usia</label>
                  <p className="text-lg font-semibold text-sky-900">
                    {screeningData.esas_data?.identity?.age &&
                    screeningData.esas_data.identity.age > 0
                      ? `${screeningData.esas_data.identity.age} tahun`
                      : 'Data tidak lengkap'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sky-600">Jenis Kelamin</label>
                  <p className="text-lg font-semibold text-sky-900">
                    {screeningData.esas_data?.identity?.gender === 'L'
                      ? 'Laki-laki'
                      : screeningData.esas_data?.identity?.gender === 'P'
                        ? 'Perempuan'
                        : 'Data tidak lengkap'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sky-600">Tanggal Screening</label>
                  <p className="text-lg font-semibold text-sky-900">
                    {new Date(screeningData.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                {screeningData.esas_data?.identity?.facility_name && (
                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="text-sm font-medium text-sky-600">Fasilitas Kesehatan</label>
                    <p className="text-lg font-semibold text-sky-900">
                      {screeningData.esas_data.identity.facility_name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Assessment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 mb-6" // lg:grid-cols-3 gap-6
        >
          <Card className="lg:col-span-1 bg-white/90 backdrop-blur-md border border-sky-200 shadow-md rounded-xl transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-sky-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Hasil Evaluasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <label className="text-sm font-medium text-sky-600">Skor Tertinggi</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-4xl font-extrabold ${getScoreColor(screeningData.highest_score).split(' ')[0]} drop-shadow`}
                    >
                      {screeningData.highest_score}
                    </span>
                    <span className="text-base text-sky-600 font-semibold">/ 10</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-sky-600">Tingkat Risiko</label>
                  <div className="mt-1">
                    <Badge
                      className={`px-3 py-1 rounded-full text-base font-semibold ${riskConfig.color} border`}
                    >
                      {riskConfig.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Diagnosis and Intervention */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 mb-6" // lg:grid-cols-2 gap-6
        >
          <Card className="bg-white/90 backdrop-blur-md border border-sky-200 shadow-md rounded-xl transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-sky-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-400" />
                Intervensi Keperawatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[260px]">
                {screeningData.recommendation?.intervention_steps &&
                screeningData.recommendation.intervention_steps.length > 0 ? (
                  <ol className="space-y-4">
                    {screeningData.recommendation.intervention_steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-base font-semibold shadow-sm border border-blue-200">
                          {index + 1}
                        </span>
                        <span className="text-sm md:text-base text-sky-800 leading-relaxed font-medium">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : screeningData.recommendation?.actions &&
                  screeningData.recommendation.actions.length > 0 ? (
                  <ol className="space-y-4">
                    {screeningData.recommendation.actions.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-base font-semibold shadow-sm border border-blue-200">
                          {index + 1}
                        </span>
                        <span className="text-sm md:text-base text-sky-800 leading-relaxed font-medium">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-sm md:text-base text-sky-600 italic">
                    <p className="mb-2">Intervensi tidak tersedia dalam data</p>
                    <p className="text-xs text-sky-500">Rekomendasi default:</p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-300 rounded-full inline-block" />
                        Monitor tingkat nyeri pasien
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-300 rounded-full inline-block" />
                        Lakukan asesmen nyeri secara berkala
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-300 rounded-full inline-block" />
                        Berikan edukasi tentang manajemen nyeri
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-300 rounded-full inline-block" />
                        Dokumentasikan respon terhadap intervensi
                      </li>
                    </ul>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div> */}

        {/* Dynamic Content Section - Based on ESAS Score Logic */}
        {(() => {
          const highestScore = screeningData.highest_score || 0
          const displayLogic = ESASRuleEngine.getDisplayLogic(highestScore)
          const esasScores = formatESASScores(screeningData.esas_data)
          const recommendedVideos = getRecommendedVideos(esasScores, highestScore)

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              {/* Video Section - Only for scores 1-3 */}
              {displayLogic.showVideos && recommendedVideos.length > 0 && (
                <Card className="bg-white/90 backdrop-blur-md border-sky-200 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-sky-900 flex items-center gap-2">
                      <Play className="w-5 h-5 text-purple-500" />
                      Video Terapi Rekomendasi
                    </CardTitle>
                    <CardDescription className="text-sky-600">
                      Berdasarkan hasil screening Anda, berikut adalah video terapi yang dapat
                      membantu mengelola gejala ringan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <VideoPlayer
                      videos={recommendedVideos}
                      autoPlay={false}
                      showPlaylist={recommendedVideos.length > 1}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Intervention Text Section - Only for scores 4-10 */}
              {displayLogic.showInterventionText && displayLogic.displayMessage && (
                <Card
                  className={`bg-white/90 backdrop-blur-md border-2 ${
                    displayLogic.messageType === 'urgent'
                      ? 'border-red-300 bg-red-50/50'
                      : 'border-yellow-300 bg-yellow-50/50'
                  }`}
                >
                  <CardHeader>
                    <CardTitle
                      className={`text-xl font-bold flex items-center gap-2 ${
                        displayLogic.messageType === 'urgent' ? 'text-red-800' : 'text-yellow-800'
                      }`}
                    >
                      {displayLogic.messageType === 'urgent' ? (
                        <>
                          <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            !
                          </span>
                          Rekomendasi Tindakan Segera
                        </>
                      ) : (
                        <>
                          <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            i
                          </span>
                          Rekomendasi Evaluasi
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-center py-6 ${
                        displayLogic.messageType === 'urgent' ? 'text-red-700' : 'text-yellow-700'
                      }`}
                    >
                      <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                          displayLogic.messageType === 'urgent'
                            ? 'bg-red-200 text-red-600'
                            : 'bg-yellow-200 text-yellow-600'
                        }`}
                      >
                        {displayLogic.messageType === 'urgent' ? (
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-lg font-semibold leading-relaxed">
                        {displayLogic.displayMessage}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Videos Available Message - Only for scores 1-3 with no matching videos */}
              {displayLogic.showVideos && recommendedVideos.length === 0 && (
                <Card className="bg-white/90 backdrop-blur-md border-sky-200">
                  <CardContent className="text-center py-8">
                    <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Video rekomendasi tidak tersedia untuk gejala ini
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )
        })()}

        {/* Educational Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Edukasi Kesehatan Terkait
              </CardTitle>
              <CardDescription className="text-sky-600">
                Pelajari lebih lanjut tentang penyakit dan perawatan paliatif untuk meningkatkan
                pemahaman Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: 'Alzheimer',
                    slug: 'alzheimer',
                    bgColor: 'bg-purple-100 hover:bg-purple-200',
                    borderColor: 'border-purple-300 hover:border-purple-400',
                    textColor: 'text-purple-800',
                    iconColor: 'text-purple-600',
                  },
                  {
                    name: 'Kanker Payudara',
                    slug: 'kanker-payudara',
                    bgColor: 'bg-pink-100 hover:bg-pink-200',
                    borderColor: 'border-pink-300 hover:border-pink-400',
                    textColor: 'text-pink-800',
                    iconColor: 'text-pink-600',
                  },
                  {
                    name: 'Gagal Ginjal',
                    slug: 'gagal-ginjal',
                    bgColor: 'bg-blue-100 hover:bg-blue-200',
                    borderColor: 'border-blue-300 hover:border-blue-400',
                    textColor: 'text-blue-800',
                    iconColor: 'text-blue-600',
                  },
                  {
                    name: 'Diabetes',
                    slug: 'diabetes',
                    bgColor: 'bg-orange-100 hover:bg-orange-200',
                    borderColor: 'border-orange-300 hover:border-orange-400',
                    textColor: 'text-orange-800',
                    iconColor: 'text-orange-600',
                  },
                  {
                    name: 'Gagal Jantung',
                    slug: 'gagal-jantung',
                    bgColor: 'bg-red-100 hover:bg-red-200',
                    borderColor: 'border-red-300 hover:border-red-400',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-600',
                  },
                  {
                    name: 'HIV & AIDS',
                    slug: 'hiv-dan-aids',
                    bgColor: 'bg-rose-100 hover:bg-rose-200',
                    borderColor: 'border-rose-300 hover:border-rose-400',
                    textColor: 'text-rose-800',
                    iconColor: 'text-rose-600',
                  },
                  {
                    name: 'PPOK',
                    slug: 'ppok',
                    bgColor: 'bg-cyan-100 hover:bg-cyan-200',
                    borderColor: 'border-cyan-300 hover:border-cyan-400',
                    textColor: 'text-cyan-800',
                    iconColor: 'text-cyan-600',
                  },
                  {
                    name: 'Stroke',
                    slug: 'stroke',
                    bgColor: 'bg-green-100 hover:bg-green-200',
                    borderColor: 'border-green-300 hover:border-green-400',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-600',
                  },
                ].map((disease, index) => (
                  <motion.div
                    key={disease.slug}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="group"
                  >
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/edukasi/${disease.slug}`)}
                      className={`w-full h-16 ${disease.bgColor} ${disease.borderColor} transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Heart className={`w-4 h-4 ${disease.iconColor}`} />
                        <span
                          className={`text-xs font-semibold ${disease.textColor} group-hover:opacity-90 transition-opacity`}
                        >
                          {disease.name}
                        </span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="outline"
            onClick={() => router.push('/pasien/dashboard')}
            className="flex items-center gap-2 border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Kembali ke Dashboard
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
