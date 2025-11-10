// PDF Generation Utilities for ESAS Reports
// Provides types and validation for PDF generation

export interface ESASReportData {
  patient: {
    name: string
    age: number
    gender: 'L' | 'P'
    facilityName?: string
  }
  screening: {
    id: string
    date: string
    screeningType: 'initial' | 'follow_up'
    esasScores: Record<string, number>
    highestScore: number
    primaryQuestion: number
    riskLevel: 'low' | 'medium' | 'high'
    actionRequired: string
    diagnosis: string
    therapyType: string
    interventionSteps: string[]
    references: string[]
    priorityLevel: number
  }
  healthcareProvider: {
    name: string
    title: string
    licenseNumber?: string
  }
}

export interface PDFGenerationOptions {
  filename?: string
  title?: string
  onBeforePrint?: () => void
  onAfterPrint?: (success: boolean) => void
  onError?: (error: Error) => void
}

export interface PDFTemplate {
  id: string
  name: string
  description: string
  orientation: 'portrait' | 'landscape'
  includeWatermark?: boolean
  includeHeader?: boolean
  includeFooter?: boolean
}

// Available PDF templates
export const PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: 'standard',
    name: 'Standard Medical Report',
    description: 'Laporan medis standar dengan format lengkap',
    orientation: 'portrait',
    includeWatermark: true,
    includeHeader: true,
    includeFooter: true
  },
  {
    id: 'compact',
    name: 'Compact Summary',
    description: 'Ringkasan ringkas untuk dokumentasi cepat',
    orientation: 'portrait',
    includeWatermark: false,
    includeHeader: true,
    includeFooter: false
  },
  {
    id: 'detailed',
    name: 'Detailed Analysis',
    description: 'Analisis detail dengan grafik dan referensi lengkap',
    orientation: 'portrait',
    includeWatermark: true,
    includeHeader: true,
    includeFooter: true
  },
  {
    id: 'patient',
    name: 'Patient Copy',
    description: 'Versi pasien dengan bahasa yang mudah dipahami',
    orientation: 'portrait',
    includeWatermark: false,
    includeHeader: false,
    includeFooter: true
  }
]

export class PDFGenerator {
  /**
   * Generate filename for PDF download
   */
  static generateFilename(data: ESASReportData, template?: PDFTemplate): string {
    const date = new Date(data.screening.date)
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
    const patientName = data.patient.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)
    const templateName = template ? `_${template.id}` : ''

    return `ESAS_Report_${patientName}_${dateStr}${templateName}.pdf`
  }

  /**
   * Validate ESAS report data before PDF generation
   */
  static validateReportData(data: ESASReportData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate patient data
    if (!data.patient.name || data.patient.name.trim().length < 2) {
      errors.push('Nama pasien harus diisi')
    }
    if (!data.patient.age || data.patient.age < 0 || data.patient.age > 150) {
      errors.push('Usia pasien tidak valid')
    }
    if (!data.patient.gender || !['L', 'P'].includes(data.patient.gender)) {
      errors.push('Jenis kelamin pasien tidak valid')
    }

    // Validate screening data
    if (!data.screening.id || data.screening.id.trim().length < 1) {
      errors.push('ID skrining tidak valid')
    }
    if (!data.screening.date) {
      errors.push('Tanggal skrining harus diisi')
    }
    if (!data.screening.esasScores || Object.keys(data.screening.esasScores).length !== 9) {
      errors.push('Data skor ESAS tidak lengkap (harus 9 pertanyaan)')
    }
    if (typeof data.screening.highestScore !== 'number' || data.screening.highestScore < 0 || data.screening.highestScore > 10) {
      errors.push('Skor tertinggi tidak valid')
    }
    if (!data.screening.diagnosis || data.screening.diagnosis.trim().length < 5) {
      errors.push('Diagnosa harus diisi')
    }
    if (!data.screening.therapyType || data.screening.therapyType.trim().length < 2) {
      errors.push('Jenis terapi harus diisi')
    }

    // Validate healthcare provider data
    if (!data.healthcareProvider.name || data.healthcareProvider.name.trim().length < 2) {
      errors.push('Nama penangan harus diisi')
    }
    if (!data.healthcareProvider.title || data.healthcareProvider.title.trim().length < 2) {
      errors.push('Jabatan penangan harus diisi')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Create mock data for testing
   */
  static createMockReportData(overrides: Partial<ESASReportData> = {}): ESASReportData {
    const mockData: ESASReportData = {
      patient: {
        name: 'Ahmad Wijaya',
        age: 65,
        gender: 'L',
        facilityName: 'RSUD Kota Semarang'
      },
      screening: {
        id: 'ESAS-2024-001',
        date: new Date().toISOString(),
        screeningType: 'initial',
        esasScores: {
          '1': 7, // Nyeri
          '2': 5, // Lelah
          '3': 3, // Kantuk
          '4': 6, // Mual
          '5': 4, // Nafsu makan
          '6': 8, // Sesak (highest)
          '7': 5, // Sedih
          '8': 6, // Cemas
          '9': 4  // Perasaan keseluruhan
        },
        highestScore: 8,
        primaryQuestion: 6,
        riskLevel: 'high',
        actionRequired: 'Segera rujuk ke Fasilitas Kesehatan atau Profesional untuk Penanganan Segera',
        diagnosis: '3. Diagnosa: Pola Napas Tidak Efektif',
        therapyType: 'Latihan Napas Dalam dan Pijatan Lembut',
        interventionSteps: [
          'Pastikan ruangan bersih, tenang, dan bebas asap/debu.',
          'Duduk setengah tegak dengan dua bantal di belakang punggung.',
          'Pejamkan mata sejenak, rilekskan bahu, dan rasakan posisi nyaman.',
          'Mulai latihan napas dalam: tarik napas perlahan lewat hidung (4 detik), tahan (7 detik), hembuskan pelan lewat mulut (8 detik). Ulangi 3–5 kali.',
          'Lanjutkan dengan pijatan lembut menggunakan ujung jari pada bahu dan punggung atas selama 2 detik, ulangi 5 kali di tiap sisi dengan tekanan ringan.',
          'Perhatikan reaksi tubuh; hentikan jika pusing, batuk, atau sesak.',
          'Setelah selesai, duduk santai selama satu menit dan minum air putih hangat. Lakukan dua kali sehari atau saat sesak.'
        ],
        references: [
          'Kushariyadi, Ufaidah, F. S., Rondhianto, & Candra, E. Y. S. (2023). Combination Therapy Slow Deep Breathing and Acupressure to Overcome Ineffective Breathing Pattern Nursing Problems: A Case Study. Nursing and Health Sciences Journal, 3(3), 229-236. https://doi.org/10.53713/nhsj.v3i3.289'
        ],
        priorityLevel: 1
      },
      healthcareProvider: {
        name: 'Dr. Siti Nurhaliza, S.Kep., Ns.',
        title: 'Perawat Paliatif Senior',
        licenseNumber: '1234567890'
      }
    }

    return { ...mockData, ...overrides }
  }

  /**
   * Check if browser supports PDF generation
   */
  static isPDFGenerationSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.print === 'function' &&
      typeof document !== 'undefined'
    )
  }

  /**
   * Get PDF generation status and capabilities
   */
  static getPDFGenerationInfo(): {
    supported: boolean
    method: string
    limitations: string[]
    recommendations: string[]
  } {
    return {
      supported: this.isPDFGenerationSupported(),
      method: 'Browser Print Dialog',
      limitations: [
        'Tergantung pada browser print dialog',
        'Tidak ada watermark kustom tanpa library tambahan',
        'Styling mungkin berbeda antar browser',
        'Fitur multi-halaman terbatas'
      ],
      recommendations: [
        'Gunakan Chrome atau Firefox untuk hasil terbaik',
        'Pastikan koneksi printer tersedia',
        'Test print sebelum produksi',
        'Consider server-side PDF generation untuk fitur lanjutan'
      ]
    }
  }
}

export default PDFGenerator