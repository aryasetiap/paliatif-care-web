'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { createClient } from '@/lib/supabase'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { BookOpen, Heart } from 'lucide-react'
import '@/styles/modern-patterns.css'

interface ScreeningData {
  id: string
  patient_id: string
  highest_score: number
  primary_question: number
  risk_level: string
  esas_data: {
    identity: {
      name: string
      age: number
      gender: string
      facility_name?: string
    }
    questions: {
      [key: string]: {
        score: number
        text: string
        description?: string
      }
    }
  }
  recommendation: {
    diagnosis: string
    intervention_steps: string[]
    references: string[]
    action_required: string
    priority: number
    therapy_type: string
    frequency: string
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

function getScoreLevel(score: number) {
  if (score === 0) return 'Tidak ada keluhan'
  if (score >= 1 && score <= 3) return 'Ringan'
  if (score >= 4 && score <= 6) return 'Sedang'
  if (score >= 7 && score <= 10) return 'Berat'
  return 'Tidak valid'
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

      // Validate required data structure
      if (!data.esas_data || !data.recommendation) {
        setError('Data screening tidak lengkap')
        return
      }

      setScreeningData(data)
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/screening/new')}
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
              >
                Screening Baru
              </Button>
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
                    {screeningData.esas_data?.identity?.name || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sky-600">Usia</label>
                  <p className="text-lg font-semibold text-sky-900">
                    {screeningData.esas_data?.identity?.age
                      ? `${screeningData.esas_data.identity.age} tahun`
                      : 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sky-600">Jenis Kelamin</label>
                  <p className="text-lg font-semibold text-sky-900">
                    {screeningData.esas_data?.identity?.gender === 'L'
                      ? 'Laki-laki'
                      : screeningData.esas_data?.identity?.gender === 'P'
                        ? 'Perempuan'
                        : 'Tidak tersedia'}
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
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
        >
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Hasil Evaluasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-sky-600">Skor Tertinggi</label>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-3xl font-bold ${getScoreColor(screeningData.highest_score).split(' ')[0]}`}
                  >
                    {screeningData.highest_score}
                  </span>
                  <span className="text-sm text-sky-600">/ 10</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-sky-600">Tingkat Risiko</label>
                <div className="mt-1">
                  <Badge className={`${riskConfig.color} border`}>{riskConfig.label}</Badge>
                </div>
              </div>
              {/* 
              <div>
                <label className="text-sm font-medium text-sky-600">Prioritas</label>
                <p className="text-lg font-semibold text-sky-900">
                  Prioritas {screeningData.recommendation.priority}
                </p>
              </div> */}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Rekomendasi Tindakan</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={`${riskConfig.color} border`}>
                <AlertTitle className="text-lg font-semibold">
                  {screeningData.recommendation.action_required}
                </AlertTitle>
                <AlertDescription className="mt-2">{riskConfig.description}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>

        {/* Diagnosis and Intervention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Diagnosa Keperawatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-sky-900">
                    {screeningData.recommendation.diagnosis}
                  </h3>
                </div>

                <div>
                  <h4 className="font-medium text-sky-700 mb-2">Terapi yang Direkomendasikan</h4>
                  <Badge variant="outline" className="text-sm border-sky-300 text-sky-700">
                    {screeningData.recommendation.therapy_type}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-sky-700 mb-2">Frekuensi</h4>
                  <p className="text-sm text-sky-600">{screeningData.recommendation.frequency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Intervensi Keperawatan</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {screeningData.recommendation?.intervention_steps?.length > 0 ? (
                  <ol className="space-y-3">
                    {screeningData.recommendation.intervention_steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-sky-700 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-sky-600 italic">Intervensi tidak tersedia</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed ESAS Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Detail Skor ESAS</CardTitle>
              <CardDescription className="text-sky-600">
                Rincian skor untuk setiap gejala yang dinilai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {screeningData.esas_data?.questions &&
                  Object.entries(screeningData.esas_data.questions).map(
                    ([questionNumber, questionData]) => {
                      const questionNum = parseInt(questionNumber)
                      return (
                        <div
                          key={questionNumber}
                          className={`p-4 rounded-lg border ${getScoreColor(questionData?.score || 0)} ${
                            questionNum === screeningData.primary_question
                              ? 'ring-2 ring-blue-500 ring-offset-2'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sky-900">
                              {questionNumber}. {questionData?.text || 'Tidak ada pertanyaan'}
                            </span>
                            {questionNum === screeningData.primary_question && (
                              <Badge
                                variant="outline"
                                className="text-xs border-blue-300 text-blue-700"
                              >
                                Utama
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{questionData?.score || 0}</span>
                            <span className="text-sm text-sky-600">/ 10</span>
                          </div>
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getScoreColor(questionData?.score || 0)}`}
                            >
                              {getScoreLevel(questionData?.score || 0)}
                            </Badge>
                          </div>
                        </div>
                      )
                    }
                  )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scientific References */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200 mt-6">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Referensi Ilmiah</CardTitle>
              <CardDescription className="text-sky-600">
                Dasar literatur untuk intervensi yang direkomendasikan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {screeningData.recommendation?.references?.length > 0 ? (
                  screeningData.recommendation.references.map((reference, index) => (
                    <div key={index} className="p-3 bg-sky-50 rounded-lg border border-sky-100">
                      <p className="text-sm text-sky-700 italic">{reference}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-sky-600 italic">Referensi tidak tersedia</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/edukasi')}
                  className="border-sky-400 text-sky-700 hover:bg-sky-50 hover:border-sky-500"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Lihat Semua Materi Edukasi
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
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
            onClick={() => router.push('/pasien')}
            className="flex items-center gap-2 border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            Lihat Daftar Pasien
          </Button>

          <Button
            onClick={() => router.push('/screening/new')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Screening Baru
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
