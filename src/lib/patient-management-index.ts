// Main Patient Management Backend Index
// This file exports all patient management related functions and types

// Core patient management functions
export {
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientById,
  getDashboardStats,
  getPatientsWithLatestScreening,
  type Patient,
  type PatientInsert,
  type PatientUpdate,
  type PatientSearch,
  type PatientWithScreenings,
  type DashboardStats,
  PatientError,
} from './patient-management'

// ESAS Rule Engine (NEW - implements RULES_SKRINING.md)
export {
  ESASRuleEngine,
  type ESASQuestions,
  type ESASQuestionsData,
  type ESASResult,
} from './esas-rule-engine'

// Patient-screening relationship functions
export {
  linkPatientToScreening,
  getPatientScreeningSummary,
  getPatientProgressAnalytics,
  getAllPatientsWithScreeningStatus,
  updateScreeningStatus,
  type PatientScreeningSummary,
  type PatientProgressAnalytics,
  ScreeningRelationshipError,
} from './patient-screening-relationship'

// Patient history tracking functions
export {
  getPatientHistory,
  getPatientTimeline,
  exportPatientHistory,
  getSymptomProgression,
  addHistoryNote,
  type PatientHistory,
  type TimelineEntry,
  type PatientHistoryStatistics,
  type PatientTrends,
  type InterventionHistory,
  PatientHistoryError,
} from './patient-history-tracking'

// Additional utility functions
export const getPatientManagementUtils = () => ({
  // Risk level calculation
  calculateRiskLevel: (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score <= 3) return 'low'
    if (score <= 6) return 'medium'
    if (score <= 8) return 'high'
    return 'critical'
  },

  // Age group classification
  getAgeGroup: (age: number): string => {
    if (age < 18) return 'Anak-anak'
    if (age < 40) return 'Dewasa Muda'
    if (age < 60) return 'Dewasa'
    return 'Lansia'
  },

  // Screening frequency recommendation
  getRecommendedScreeningFrequency: (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical':
      case 'high':
        return 'Mingguan'
      case 'medium':
        return 'Dua Mingguan'
      case 'low':
        return 'Bulanan'
      default:
        return 'Tidak diketahui'
    }
  },

  // Priority level for patient lists
  getPriorityLevel: (riskLevel: string): number => {
    switch (riskLevel) {
      case 'critical':
        return 4
      case 'high':
        return 3
      case 'medium':
        return 2
      case 'low':
        return 1
      default:
        return 0
    }
  },

  // Format date for display
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  // Calculate days since screening
  getDaysSinceScreening: (screeningDate: string): number => {
    const screening = new Date(screeningDate)
    const now = new Date()
    return Math.floor((now.getTime() - screening.getTime()) / (1000 * 60 * 60 * 24))
  },

  // Check if follow-up is needed
  isFollowUpNeeded: (screening: any): boolean => {
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(screening.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    return daysSince > 14 || screening.risk_level === 'high' || screening.risk_level === 'critical'
  },

  // Generate patient initials for avatar
  getPatientInitials: (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  },

  // Format patient display name
  formatPatientDisplayName: (name: string, age: number, gender: string): string => {
    const genderText = gender === 'L' ? 'Laki-laki' : 'Perempuan'
    return `${name}, ${age} tahun, ${genderText}`
  },

  // Get status color for UI
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50'
      case 'draft':
        return 'text-gray-600 bg-gray-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  },

  // Get risk level color for UI
  getRiskLevelColor: (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-200'
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'low':
        return 'text-green-700 bg-green-100 border-green-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  },

  // Generate patient summary text
  generatePatientSummary: (patient: any, latestScreening?: any): string => {
    let summary = `Pasien ${patient.name} (${patient.age} tahun, ${patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'})`

    if (latestScreening) {
      const daysSince = Math.floor(
        (new Date().getTime() - new Date(latestScreening.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )

      summary += `. Screening terakhir: ${daysSince} hari yang lalu dengan skor ${latestScreening.highest_score} (risiko ${latestScreening.risk_level})`
    } else {
      summary += '. Belum ada data screening'
    }

    return summary
  },

  // Validate patient data before operations
  validatePatientData: (patientData: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!patientData.name || patientData.name.trim().length < 3) {
      errors.push('Nama pasien minimal 3 karakter')
    }

    if (!patientData.age || patientData.age < 0 || patientData.age > 150) {
      errors.push('Usia harus antara 0-150 tahun')
    }

    if (!patientData.gender || !['L', 'P'].includes(patientData.gender)) {
      errors.push('Jenis kelamin harus L atau P')
    }

    if (patientData.facility_name && patientData.facility_name.length > 100) {
      errors.push('Nama fasilitas maksimal 100 karakter')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
})

// Import types from their respective modules
import type { Patient } from './patient-management'
import type { PatientWithScreenings, PatientSearch } from './patient-management'
import type { PatientHistory, TimelineEntry } from './patient-history-tracking'

// Types for React components
export interface PatientManagementState {
  patients: Patient[]
  selectedPatient: PatientWithScreenings | null
  loading: boolean
  error: string | null
  filters: PatientSearch
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PatientScreeningState {
  patientScreenings: any[]
  selectedScreening: any | null
  loading: boolean
  error: string | null
}

export interface PatientHistoryState {
  history: PatientHistory | null
  timeline: TimelineEntry[]
  loading: boolean
  error: string | null
}

// Constants for patient management
export const PATIENT_MANAGEMENT_CONSTANTS = {
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  SEARCH: {
    MIN_SEARCH_LENGTH: 2,
    DEBOUNCE_DELAY: 300,
  },
  VALIDATION: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 100,
    FACILITY_NAME_MAX_LENGTH: 100,
    AGE_MIN: 0,
    AGE_MAX: 150,
  },
  SCREENING: {
    FOLLOW_UP_DAYS_HIGH_RISK: 7,
    FOLLOW_UP_DAYS_MEDIUM_RISK: 14,
    FOLLOW_UP_DAYS_LOW_RISK: 30,
    MAX_DAYS_WITHOUT_SCREENING: 60,
  },
  COLORS: {
    PRIMARY: '#6280BA',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4',
  },
} as const

// Error messages in Indonesian
export const PATIENT_ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Data pasien tidak valid',
  DUPLICATE_PATIENT: 'Pasien dengan data yang sama sudah ada',
  NOT_FOUND: 'Pasien tidak ditemukan',
  UNAUTHORIZED: 'Anda tidak memiliki akses',
  FORBIDDEN: 'Akses ditolak',
  HAS_SCREENINGS: 'Tidak dapat menghapus pasien yang memiliki riwayat screening',
  DATABASE_ERROR: 'Terjadi kesalahan pada database',
  NETWORK_ERROR: 'Terjadi kesalahan jaringan',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
} as const

// Success messages in Indonesian
export const PATIENT_SUCCESS_MESSAGES = {
  PATIENT_CREATED: 'Pasien berhasil ditambahkan',
  PATIENT_UPDATED: 'Data pasien berhasil diperbarui',
  PATIENT_DELETED: 'Pasien berhasil dihapus',
  SCREENING_LINKED: 'Screening berhasil dihubungkan ke pasien',
  STATUS_UPDATED: 'Status screening berhasil diperbarui',
  HISTORY_EXPORTED: 'Riwayat pasien berhasil diekspor',
} as const

// All functions and constants are exported above for easy importing
