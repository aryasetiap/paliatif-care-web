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
import { ESASPDFDownloadButton } from '@/components/ESASPDFDownloadButton'
import ESASReportToPrint from '@/components/ESASReportToPrint'
import { useReactToPrint } from 'react-to-print'

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
    description: 'Gejala ringan, monitoring rutin'
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Sedang',
    description: 'Gejala sedang, perlu evaluasi lebih lanjut'
  },
  high: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Tinggi',
    description: 'Gejala berat, perlu penanganan segera'
  },
  critical: {
    color: 'bg-red-200 text-red-900 border-red-300',
    label: 'Kritis',
    description: 'Gejala kritis, segera rujuk ke fasilitas kesehatan'
  }
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
  const printRef = React.useRef<HTMLDivElement>(null)

  const fetchScreeningData = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('screenings')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        setError(error.message)
        return
      }

      if (!data) {
        setError('Data screening tidak ditemukan')
        return
      }

      setScreeningData(data)
    } catch (error: any) {
      setError(error.message || 'Gagal mengambil data screening')
      toast.error("Gagal mengambil data screening")
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Laporan Screening ESAS - ${screeningData?.esas_data.identity.name}`,
  })

  useEffect(() => {
    fetchScreeningData()
  }, [fetchScreeningData])

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data screening...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !screeningData) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Data screening tidak ditemukan'}</p>
          <Button onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  const riskConfig = RISK_LEVEL_CONFIG[screeningData.risk_level as keyof typeof RISK_LEVEL_CONFIG] || RISK_LEVEL_CONFIG.low

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Screening ESAS</h1>
            <p className="text-gray-600">
              Edmonton Symptom Assessment System - Hasil Penilaian Gejala Pasien Paliatif
            </p>
          </div>
          <div className="flex gap-2">
            <ESASPDFDownloadButton screeningData={screeningData} />
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/screening/new')}
            >
              Screening Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden printable component */}
      <div className="hidden">
        <div ref={printRef}>
          <ESASReportToPrint screeningData={screeningData} />
        </div>
      </div>

      {/* Patient Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Pasien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nama Pasien</label>
              <p className="text-lg font-semibold text-gray-900">{screeningData.esas_data.identity.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Usia</label>
              <p className="text-lg font-semibold text-gray-900">{screeningData.esas_data.identity.age} tahun</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Jenis Kelamin</label>
              <p className="text-lg font-semibold text-gray-900">{screeningData.esas_data.identity.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tanggal Screening</label>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(screeningData.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            {screeningData.esas_data.identity.facility_name && (
              <div className="md:col-span-2 lg:col-span-4">
                <label className="text-sm font-medium text-gray-500">Fasilitas Kesehatan</label>
                <p className="text-lg font-semibold text-gray-900">{screeningData.esas_data.identity.facility_name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Hasil Evaluasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Skor Tertinggi</label>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-3xl font-bold ${getScoreColor(screeningData.highest_score).split(' ')[0]}`}>
                  {screeningData.highest_score}
                </span>
                <span className="text-sm text-gray-600">/ 10</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Tingkat Risiko</label>
              <div className="mt-1">
                <Badge className={`${riskConfig.color} border`}>
                  {riskConfig.label}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Prioritas</label>
              <p className="text-lg font-semibold text-gray-900">
                Prioritas {screeningData.recommendation.priority}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rekomendasi Tindakan</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={`${riskConfig.color} border`}>
              <AlertTitle className="text-lg font-semibold">
                {screeningData.recommendation.action_required}
              </AlertTitle>
              <AlertDescription className="mt-2">
                {riskConfig.description}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Diagnosis and Intervention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Diagnosa Keperawatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {screeningData.recommendation.diagnosis}
                </h3>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Terapi yang Direkomendasikan</h4>
                <Badge variant="outline" className="text-sm">
                  {screeningData.recommendation.therapy_type}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Frekuensi</h4>
                <p className="text-sm text-gray-600">
                  {screeningData.recommendation.frequency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intervensi Keperawatan</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <ol className="space-y-3">
                {screeningData.recommendation.intervention_steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Detailed ESAS Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Skor ESAS</CardTitle>
          <CardDescription>
            Rincian skor untuk setiap gejala yang dinilai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(screeningData.esas_data.questions).map(([questionNumber, questionData]) => (
              <div
                key={questionNumber}
                className={`p-4 rounded-lg border ${getScoreColor(questionData.score)} ${
                  parseInt(questionNumber) === screeningData.primary_question ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {questionNumber}. {questionData.text}
                  </span>
                  {parseInt(questionNumber) === screeningData.primary_question && (
                    <Badge variant="outline" className="text-xs">
                      Utama
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {questionData.score}
                  </span>
                  <span className="text-sm text-gray-600">/ 10</span>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className={`text-xs ${getScoreColor(questionData.score)}`}>
                    {getScoreLevel(questionData.score)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scientific References */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Referensi Ilmiah</CardTitle>
          <CardDescription>
            Dasar literatur untuk intervensi yang direkomendasikan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {screeningData.recommendation.references.map((reference, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  {reference}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push('/pasien')}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Lihat Daftar Pasien
        </Button>

        <Button
          onClick={() => router.push('/screening/new')}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Screening Baru
        </Button>
      </div>
    </div>
  )
}