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
import { ArrowLeft, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('screening-result-content')
      if (!element) {
        throw new Error('Content element not found')
      }

      // Show loading toast
      toast({
        title: 'Membuat PDF',
        description: 'Sedang membuat dokumen PDF yang dioptimasi, mohon tunggu...',
      })

      // Create canvas with optimized settings for smaller PDF size
      const canvas = await html2canvas(element, {
        scale: 1.2, // Further reduced for better optimization
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        // Optimize for smaller file size
        removeContainer: true,
        imageTimeout: 0,
        foreignObjectRendering: false, // Disable for better compatibility
        onclone: (clonedDoc) => {
          // Remove print:hidden elements and optimize for PDF
          const printElements = clonedDoc.querySelectorAll('.print\\:hidden')
          printElements.forEach((el) => el.remove())

          // Optimize styles for PDF
          const body = clonedDoc.body
          if (body) {
            body.style.background = '#ffffff'
            body.style.color = '#000000'
            body.style.fontFamily = 'Arial, sans-serif'
          }

          // Remove animations and transitions
          const style = clonedDoc.createElement('style')
          style.textContent = `
            * { animation: none !important; transition: none !important; }
            .motion-div { transform: none !important; opacity: 1 !important; }
          `
          clonedDoc.head.appendChild(style)
        },
      })

      // Create PDF with optimized image settings
      const imgData = canvas.toDataURL('image/jpeg', 0.8) // Use JPEG with 80% quality
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true, // Enable compression
      })

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add new pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Generate filename
      const patientName = (identity.name || 'Pasien').replace(/\s+/g, '_')
      const date = new Date().toLocaleDateString('id-ID').replace(/\//g, '-')
      const filename = `Hasil_Screening_ESAS_${patientName}_${date}.pdf`

      // Save PDF
      pdf.save(filename)

      // Show success toast with optimization info
      toast({
        title: 'PDF Berhasil Diunduh',
        description: 'File PDF yang dioptimasi telah berhasil dibuat (ukuran lebih kecil)',
      })
    } catch (error) {
      toast({
        title: 'Gagal Membuat PDF',
        description:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat membuat file PDF. Silakan coba lagi.',
        variant: 'destructive',
      })
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
  const recommendation = screening.recommendation || {}

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
              {/* <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Cetak
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Bagikan
                </Button>
              </div> */}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Tingkat Risiko</p>
                  <Badge className={`${getRiskLevelColor(screening.risk_level)} text-lg px-4 py-2`}>
                    {screening.risk_level === 'low' && 'Rendah'}
                    {screening.risk_level === 'medium' && 'Sedang'}
                    {screening.risk_level === 'high' && 'Tinggi'}
                    {screening.risk_level === 'critical' && 'Kritis'}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Skor Tertinggi</p>
                  <div className="text-2xl font-bold text-red-600">
                    {screening.highest_score}/10
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Diagnosis Utama</p>
                  <p className="font-semibold text-sky-700">{recommendation.summary || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ESAS Questions Results */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Hasil Pertanyaan ESAS</CardTitle>
              <CardDescription className="text-sky-600">
                Skor 0 (tidak ada keluhan) hingga 10 (keluhan terberat)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(questions).map(([key, score]: [string, unknown]) => {
                  const numericScore = typeof score === 'number' ? score : Number(score) || 0
                  return (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {key}. {getESASQuestionText(key)}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getScoreColor(numericScore)} border`}>
                            {numericScore} - {getScoreLevel(numericScore)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Tingkat keparahan: {getESASQuestionDescription(key, numericScore)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div> */}

        {/* Recommendations */}
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="bg-white/90 backdrop-blur-md border-sky-200">
              <CardHeader>
                <CardTitle className="text-xl text-sky-900">Rekomendasi Tindakan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Diagnosis Keperawatan</h4>
                    <p className="text-gray-700">{recommendation.summary || '-'}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Tipe Terapi</h4>
                    <p className="text-gray-700">{recommendation.therapy_type || '-'}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Langkah Intervensi</h4>
                    {recommendation.interventions && recommendation.interventions.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        {recommendation.interventions.map((step: string, index: number) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-gray-600">
                        Tidak ada intervensi khusus yang direkomendasikan
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Tindakan yang Diperlukan</h4>
                    <p className="text-gray-700">{recommendation.action_required || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Disclaimer */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h4 className="font-semibold text-yellow-800 mb-2">🏥 PENTING DIPERHATIKAN</h4>
                <div className="text-yellow-700 text-sm space-y-2">
                  <p>
                    Hasil screening ini merupakan alat bantu penilaian awal dan{' '}
                    <strong>bukan pengganti diagnosis medis profesional</strong>.
                  </p>
                  <p className="font-medium">⚠️ Segera hubungi fasilitas kesehatan jika:</p>
                  <ul className="text-left max-w-md mx-auto space-y-1">
                    <li>• Skor gejala ≥ 7 (keluhan berat)</li>
                    <li>• Mengalami sesak napas yang berat</li>
                    <li>• Nyeri yang tidak tertolong dengan obat</li>
                    <li>• Perubahan kondisi yang mendadak</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div> */}

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
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Unduh Hasil (PDF)
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
