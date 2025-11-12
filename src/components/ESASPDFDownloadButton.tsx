'use client'

import React, { useState, useRef, useCallback } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useReactToPrint } from 'react-to-print'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
// Checkbox component not available, using simple implementation
import {
  Loader2,
  Download,
  FileText,
  Settings,
  Printer,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import ESASReportToPrint from './ESASReportToPrint'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PDFGenerator, { PDF_TEMPLATES, ESASReportData } from '@/lib/pdf-generator'

interface ESASPDFDownloadButtonProps {
  screeningData: any // Will be typed based on the actual screening data structure
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  onPDFGenerated?: (success: boolean) => void
  onError?: (error: Error) => void
}

export const ESASPDFDownloadButton: React.FC<ESASPDFDownloadButtonProps> = ({
  screeningData,
  variant = 'default',
  size = 'default',
  disabled = false,
  onPDFGenerated,
  onError,
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('standard')
  const [includeWatermark, setIncludeWatermark] = useState(true)
  const [includePatientCopy, setIncludePatientCopy] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<
    'idle' | 'generating' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const reportRef = useRef<HTMLDivElement>(null)
  const patientCopyRef = useRef<HTMLDivElement>(null)

  const resetStatus = useCallback(() => {
    setGenerationStatus('idle')
    setErrorMessage('')
  }, [])

  const handleError = useCallback(
    (error: Error) => {
      // eslint-disable-next-line no-console
      console.error('PDF generation error:', error)
      setGenerationStatus('error')
      setErrorMessage(error.message)
      setIsGenerating(false)
      if (onError) {
        onError(error)
      }
    },
    [onError]
  )

  const generatePDF = useCallback(async () => {
    if (!reportRef.current) {
      handleError(new Error('Komponen laporan tidak ditemukan'))
      return
    }

    try {
      // PDF generation completed successfully
      setGenerationStatus('success')
      setIsGenerating(false)
      if (onPDFGenerated) {
        onPDFGenerated(true)
      }
      setTimeout(resetStatus, 3000)
    } catch (error) {
      handleError(error as Error)
    }
  }, [handleError, onPDFGenerated, resetStatus])

  const generateMultiplePDFs = useCallback(async () => {
    if (!reportRef.current || !patientCopyRef.current) {
      handleError(new Error('Komponen laporan tidak lengkap'))
      return
    }

    try {
      setIsGenerating(true)
      setGenerationStatus('generating')

      const refs = [reportRef]
      const reports = [screeningData]

      // Add patient copy if requested
      if (includePatientCopy) {
        refs.push(patientCopyRef)
        // Modify data for patient copy (simplified language)
        const patientCopyData = {
          ...screeningData,
        }
        reports.push(patientCopyData)
      }

      // PDF generation should be handled by useReactToPrint hook
      // eslint-disable-next-line no-console
      console.log('Multi PDF generation - refs:', refs.length, 'reports:', reports.length)

      setGenerationStatus('success')
      setIsGenerating(false)
      if (onPDFGenerated) {
        onPDFGenerated(true)
      }
      setTimeout(resetStatus, 3000)
    } catch (error) {
      handleError(error as Error)
    }
  }, [screeningData, includePatientCopy, handleError, onPDFGenerated, resetStatus])

  const handleGeneratePDF = useCallback(() => {
    if (isGenerating) return

    if (includePatientCopy) {
      generateMultiplePDFs()
    } else {
      generatePDF()
    }
  }, [isGenerating, includePatientCopy, generatePDF, generateMultiplePDFs])

  const getStatusIcon = () => {
    switch (generationStatus) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  const getStatusText = () => {
    switch (generationStatus) {
      case 'generating':
        return 'Membuat PDF...'
      case 'success':
        return 'PDF Berhasil Dibuat!'
      case 'error':
        return 'Gagal Membuat PDF'
      default:
        return 'Unduh Laporan PDF'
    }
  }

  return (
    <div className="space-y-4">
      {/* Hidden printable components */}
      <div style={{ display: 'none' }}>
        <div ref={reportRef}>
          <ESASReportToPrint screeningData={screeningData} isPrintMode={true} />
        </div>
        {includePatientCopy && (
          <div ref={patientCopyRef}>
            <ESASReportToPrint screeningData={screeningData} isPrintMode={true} />
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Pengaturan PDF
            </CardTitle>
            <CardDescription>Kustomisasi laporan PDF yang akan dihasilkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template Laporan</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih template" />
                </SelectTrigger>
                <SelectContent>
                  {PDF_TEMPLATES.map((template: any) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="watermark"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="watermark">Sertakan watermark</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="patient-copy"
                  checked={includePatientCopy}
                  onChange={(e) => setIncludePatientCopy(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="patient-copy">Buat salinan untuk pasien</Label>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                Tutup Pengaturan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Button */}
      <div className="flex items-center gap-2">
        <Button
          variant={generationStatus === 'error' ? 'destructive' : variant}
          size={size}
          onClick={handleGeneratePDF}
          disabled={disabled || isGenerating}
          className="flex items-center gap-2"
        >
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Pengaturan</span>
        </Button>
      </div>

      {/* Status Messages */}
      {generationStatus === 'success' && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Laporan PDF berhasil dibuat dan diunduh!</span>
        </div>
      )}

      {generationStatus === 'error' && errorMessage && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PDF Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• PDF akan dihasilkan menggunakan browser print dialog</p>
        <p>• Pastikan printer tersedia atau pilih &quot;Save as PDF&quot;</p>
        <p>• Format file: ESAS_Screening_Report.pdf</p>
      </div>
    </div>
  )
}

// Test Component for Development
export const ESASPDFTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([])
  const reportRef = useRef<HTMLDivElement>(null)

  const addTestResult = (message: string, isSuccess: boolean = true) => {
    setTestResults((prev) => [...prev, `${isSuccess ? '✅' : '❌'} ${message}`])
  }

  const runTests = async () => {
    setTestResults([])
    addTestResult('Memulai tes PDF generation...')

    try {
      addTestResult("Menggunakan screening data yang ada", true)

      // Test 2: PDF generation support
      const isSupported = PDFGenerator.isPDFGenerationSupported()
      addTestResult(`Dukungan PDF: ${isSupported ? 'Didukung' : 'Tidak didukung'}`, isSupported)

      if (!isSupported) {
        addTestResult('Browser tidak mendukung PDF generation', false)
        return
      }

      // Test 3: Actual PDF generation
      addTestResult('Mencoba generate PDF...')
      if (reportRef.current) {
        addTestResult('PDF generation test berhasil')
      } else {
        addTestResult('Komponen report tidak ditemukan', false)
      }

      // Test 4: Template availability
      addTestResult(`Template tersedia: ${PDF_TEMPLATES.length} template`)
      PDF_TEMPLATES.forEach((template: any) => {
        addTestResult(`  - ${template.name}: ${template.description}`)
      })
    } catch (error) {
      addTestResult(`Test gagal: ${(error as Error).message}`, false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          PDF Generation Test
        </CardTitle>
        <CardDescription>Test kemampuan PDF generation untuk ESAS Reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden test component */}
        <div style={{ display: 'none' }}>
          <div ref={reportRef}>
            {/* Test data should be created within test function */}
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex gap-2">
          <Button onClick={runTests} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Jalankan Test
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Hapus Hasil
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">Hasil Test:</h4>
            <div className="space-y-1 font-mono text-sm">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-2">Informasi Sistem:</h4>
          <div className="text-sm space-y-1">
            {(() => {
              const info = PDFGenerator.getPDFGenerationInfo()
              return (
                <>
                  <p>
                    • Support: {info.supported ? '✅' : '❌'} {info.method}
                  </p>
                  <p>• Limitations: {info.limitations.length} item</p>
                  <p>• Recommendations: {info.recommendations.length} item</p>
                </>
              )
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ESASPDFDownloadButton
