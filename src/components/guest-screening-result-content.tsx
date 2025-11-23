'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { ArrowLeft, Play } from 'lucide-react'
import VideoPlayer from '@/components/video-player'
import { getRecommendedVideos, formatESASScores } from '@/lib/videoRecomendations'
import ESASRuleEngine from '@/lib/esas-rule-engine'

interface ESASScreeningResultContentProps {
  screeningId: string
  guestId: string
}

export default function ESASScreeningResultContent({
  screeningId,
  guestId,
}: ESASScreeningResultContentProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [screening, setScreening] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchScreeningResult()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screeningId, guestId])

  const fetchScreeningResult = async () => {
    try {
      const supabase = createClient()

      // Fetch screening data with guest verification
      const { data: screeningData, error: screeningError } = await supabase
        .from('screenings')
        .select('*')
        .eq('id', screeningId)
        .eq('guest_identifier', guestId)
        .eq('is_guest', true)
        .single()

      if (screeningError) {
        throw new Error(`Data screening tidak ditemukan: ${screeningError.message}`)
      }

      if (!screeningData) {
        throw new Error('Data screening tidak ditemukan')
      }

      setScreening(screeningData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memuat data screening',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Memuat hasil screening...</p>
        </div>
      </div>
    )
  }

  if (error || !screening) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error || 'Data screening tidak ditemukan'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/screening/guest')} className="w-full">
              Kembali ke Form Screening
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const esasData = screening.esas_data
  const identity = esasData?.identity || {}
  // const recommendation = screening.recommendation || {}

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div
        id="screening-result-content"
        className="relative z-10 container mx-auto px-4 py-8 max-w-4xl print:mt-0"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/screening/guest')}
              className="flex items-center gap-2 print:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Screening
            </Button>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 print:hidden">
              <Button
                size="sm"
                onClick={() =>
                  router.push(
                    `/register/from-guest?guest_id=${guestId}&screening_id=${screeningId}`
                  )
                }
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <span className="hidden sm:inline">💾</span>
                Simpan & Buat Akun
              </Button>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-sky-900 mb-2">Hasil Screening ESAS</h1>
            <p className="text-sky-600 text-lg">Edmonton Symptom Assessment System</p>
            <p className="text-sky-500 text-sm mt-2">
              Screening Tamu •{' '}
              {new Date(screening.created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </motion.div>

        {/* Patient Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Informasi Pasien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama Pasien</p>
                  <p className="font-semibold">{identity.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usia</p>
                  <p className="font-semibold">{identity.age || '-'} tahun</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jenis Kelamin</p>
                  <p className="font-semibold">
                    {identity.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Screening</p>
                  <p className="font-semibold text-xs">{screeningId.substring(0, 8)}...</p>
                </div>
                {identity.facility_name && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Fasilitas</p>
                    <p className="font-semibold">{identity.facility_name}</p>
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
          className="mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Ringkasan Penilaian</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Dari hasil screening, Anda berisiko mengalami masalah pada:
              </p>
              <div className="space-y-3">
                {(() => {
                  const esasScores = screening.esas_data?.questions || {}
                  const symptoms = [
                    {
                      key: '1',
                      name: 'Nyeri',
                      score:
                        typeof esasScores['1'] === 'object'
                          ? esasScores['1']?.score
                          : esasScores['1'] || screening.esas_data?.pain || 0,
                    },
                    {
                      key: '2',
                      name: 'Kelelahan',
                      score:
                        typeof esasScores['2'] === 'object'
                          ? esasScores['2']?.score
                          : esasScores['2'] || screening.esas_data?.tiredness || 0,
                    },
                    {
                      key: '3',
                      name: 'Gangguan tidur',
                      score:
                        typeof esasScores['3'] === 'object'
                          ? esasScores['3']?.score
                          : esasScores['3'] || screening.esas_data?.drowsiness || 0,
                    },
                    {
                      key: '4',
                      name: 'Mual (Nausea)',
                      score:
                        typeof esasScores['4'] === 'object'
                          ? esasScores['4']?.score
                          : esasScores['4'] || screening.esas_data?.nausea || 0,
                    },
                    {
                      key: '5',
                      name: 'Tidak nafsu makan',
                      score:
                        typeof esasScores['5'] === 'object'
                          ? esasScores['5']?.score
                          : esasScores['5'] || screening.esas_data?.lack_of_appetite || 0,
                    },
                    {
                      key: '6',
                      name: 'Sesak',
                      score:
                        typeof esasScores['6'] === 'object'
                          ? esasScores['6']?.score
                          : esasScores['6'] || screening.esas_data?.shortness_of_breath || 0,
                    },
                    {
                      key: '7',
                      name: 'Depresi',
                      score:
                        typeof esasScores['7'] === 'object'
                          ? esasScores['7']?.score
                          : esasScores['7'] || screening.esas_data?.depression || 0,
                    },
                    {
                      key: '8',
                      name: 'Kecemasan (Ansietas)',
                      score:
                        typeof esasScores['8'] === 'object'
                          ? esasScores['8']?.score
                          : esasScores['8'] || screening.esas_data?.anxiety || 0,
                    },
                    {
                      key: '9',
                      name: 'Cara Anda dan keluarga menghadapi masalah',
                      score:
                        typeof esasScores['9'] === 'object'
                          ? esasScores['9']?.score
                          : esasScores['9'] || screening.esas_data?.wellbeing || 0,
                    },
                  ]

                  const getSeverityCategory = (score: number) => {
                    if (score === 0) return null
                    if (score >= 1 && score <= 3)
                      return {
                        label: 'Ringan',
                        color: 'bg-green-100 text-green-800 border-green-200',
                      }
                    if (score >= 4 && score <= 6)
                      return {
                        label: 'Sedang',
                        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      }
                    if (score >= 7 && score <= 10)
                      return { label: 'Berat', color: 'bg-red-100 text-red-800 border-red-200' }
                    return null
                  }

                  const filteredSymptoms = symptoms.filter((symptom) => symptom.score > 0)

                  if (filteredSymptoms.length === 0) {
                    return (
                      <div className="text-center py-6 text-gray-500">
                        <p>Tidak ada gejala yang dilaporkan (semua skor = 0)</p>
                      </div>
                    )
                  }

                  return filteredSymptoms.map((symptom, index) => {
                    const severity = getSeverityCategory(symptom.score)
                    if (!severity) return null

                    return (
                      <div
                        key={symptom.key}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">
                          {index + 1}. {symptom.name} kategori
                        </span>
                        <div className="flex items-center gap-2">
                          {/* <span className="text-sm text-gray-600">{symptom.score}/10</span> */}
                          <Badge className={severity.color}>{severity.label}</Badge>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dynamic Content Section - Based on ESAS Score Logic */}
        {(() => {
          const highestScore = screening?.highest_score || 0
          const displayLogic = ESASRuleEngine.getDisplayLogic(highestScore)
          const esasScores = screening ? formatESASScores(screening.esas_data) : []
          const recommendedVideos = screening ? getRecommendedVideos(esasScores, highestScore) : []

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-8"
            >
              {/* Video Section - For all answered questions with scores 1-10 */}
              {displayLogic.showVideos && recommendedVideos.length > 0 && (
                <Card className="bg-white/90 backdrop-blur-md border-sky-200 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-sky-900 flex items-center gap-2">
                      <Play className="w-5 h-5 text-purple-500" />
                      Rekomendasi Video Terapi
                    </CardTitle>
                    <CardDescription className="text-sky-600">
                      Berikut adalah latihan yang dapat anda lakukan :
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

              {/* No Videos Available Message - For answered questions with no matching videos */}
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

        {/* Reminder Paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-lg font-medium text-sky-700">
            Untuk Pelayanan Lebih Lanjut Silahkan Hubungi Pelayanan Kesehatan Terdekat
          </p>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center print:hidden"
        >
          <Button
            onClick={() => router.push('/screening/guest')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Screening Baru
          </Button>
        </motion.div>
      </div>

      <Footer />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:mt-0 {
            margin-top: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
