// Patient Management PDF Integration
// Integrates PDF generation with patient management system

import { ESASReportData } from './pdf-generator'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import InterventionEngine from './intervention-system'
import { ESASRuleEngine } from './esas-rule-engine'

// Types from existing system
import type { Database } from './database.types'

type PatientData = Database['public']['Tables']['patients']['Row']
type ScreeningData = Database['public']['Tables']['screenings']['Row']

export class PatientManagementPDF {
  /**
   * Convert database data to PDF report format
   */
  static convertDatabaseToReportData(
    patient: PatientData,
    screening: ScreeningData,
    healthcareProvider: {
      name: string
      title: string
      licenseNumber?: string
    }
  ): ESASReportData {
    // Parse ESAS data
    const esasData = screening.esas_data as any
    const esasScores: Record<string, number> = {}

    // Extract scores from ESAS data structure
    if (esasData?.questions) {
      Object.entries(esasData.questions).forEach(([key, value]: [string, any]) => {
        esasScores[key] = value.score || 0
      })
    }

    // Extract recommendation data safely
    const recommendation = screening.recommendation as any || {}

    // Re-process ESAS to ensure consistency
    const esasResult = ESASRuleEngine.processESASScreening(esasScores as any)

    return {
      patient: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender as 'L' | 'P',
        facilityName: patient.facility_name || undefined
      },
      screening: {
        id: screening.id,
        date: screening.created_at || new Date().toISOString(),
        screeningType: screening.screening_type as 'initial' | 'follow_up',
        esasScores: esasScores,
        highestScore: screening.highest_score || esasResult.highestScore,
        primaryQuestion: screening.primary_question || esasResult.primaryQuestion,
        riskLevel: screening.risk_level as 'low' | 'medium' | 'high' || esasResult.riskLevel,
        actionRequired: recommendation.action_required || esasResult.actionRequired,
        diagnosis: recommendation.diagnosis || esasResult.diagnosis,
        therapyType: recommendation.therapy_type || esasResult.therapyType,
        interventionSteps: recommendation.intervention_steps || esasResult.interventionSteps,
        references: recommendation.references || esasResult.references,
        priorityLevel: recommendation.priority || esasResult.priorityLevel
      },
      healthcareProvider
    }
  }

  /**
   * Generate PDF for a specific screening
   */
  static generateScreeningPDF(
    patient: PatientData,
    screening: ScreeningData,
    healthcareProvider: {
      name: string
      title: string
      licenseNumber?: string
    }
  ): ESASReportData {
    return this.convertDatabaseToReportData(patient, screening, healthcareProvider)
  }

  /**
   * Generate PDF for the latest screening of a patient
   */
  static async generateLatestScreeningPDF(
    patient: PatientData,
    screenings: ScreeningData[],
    healthcareProvider: {
      name: string
      title: string
      licenseNumber?: string
    }
  ): Promise<ESASReportData | null> {
    if (screenings.length === 0) {
      return null
    }

    // Sort by creation date and get the latest
    const latestScreening = screenings.sort((a, b) =>
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    )[0]

    return this.generateScreeningPDF(patient, latestScreening, healthcareProvider)
  }

  /**
   * Generate multiple PDFs for all screenings of a patient
   */
  static generateAllScreeningsPDFs(
    patient: PatientData,
    screenings: ScreeningData[],
    healthcareProvider: {
      name: string
      title: string
      licenseNumber?: string
    }
  ): ESASReportData[] {
    if (screenings.length === 0) {
      return []
    }

    // Sort screenings by date
    const sortedScreenings = screenings.sort((a, b) =>
      new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
    )

    return sortedScreenings.map(screening =>
      this.generateScreeningPDF(patient, screening, healthcareProvider)
    )
  }

  /**
   * Generate PDF summary for patient history
   */
  static generatePatientHistorySummaryPDF(
    patient: PatientData,
    screenings: ScreeningData[],
    healthcareProvider: {
      name: string
      title: string
      licenseNumber?: string
    }
  ): ESASReportData | null {
    if (screenings.length === 0) {
      return null
    }

    // Get latest screening for primary data
    const latestScreening = screenings.sort((a, b) =>
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    )[0]

    const baseReportData = this.generateScreeningPDF(patient, latestScreening, healthcareProvider)

    if (!baseReportData) {
      return null
    }

    // Add history summary information
    const historySummary = this.createHistorySummary(screenings)

    // Modify the report to include history
    return {
      ...baseReportData,
      screening: {
        ...baseReportData.screening,
        interventionSteps: [
          ...baseReportData.screening.interventionSteps,
          '',
          'RIWAYAT SCREENING PASIEN:',
          ...historySummary
        ]
      }
    }
  }

  /**
   * Create history summary from multiple screenings
   */
  private static createHistorySummary(screenings: ScreeningData[]): string[] {
    const summary: string[] = []
    const sortedScreenings = screenings.sort((a, b) =>
      new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
    )

    summary.push(`Total screening: ${screenings.length} kali`)
    summary.push(`Periode: ${new Date(sortedScreenings[0].created_at || '').toLocaleDateString('id-ID')} - ${new Date(sortedScreenings[sortedScreenings.length - 1].created_at || '').toLocaleDateString('id-ID')}`)

    // Risk level distribution
    const riskDistribution = screenings.reduce((acc, screening) => {
      const risk = screening.risk_level || 'unknown'
      acc[risk] = (acc[risk] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    summary.push('Distribusi tingkat risiko:')
    Object.entries(riskDistribution).forEach(([risk, count]) => {
      const riskText = risk === 'high' ? 'Tinggi' : risk === 'medium' ? 'Sedang' : risk === 'low' ? 'Rendah' : risk
      summary.push(`  - ${riskText}: ${count} kali`)
    })

    // Most common symptoms
    const symptomScores = this.calculateAverageSymptomScores(screenings)
    const topSymptoms = Object.entries(symptomScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    if (topSymptoms.length > 0) {
      summary.push('Gejala dengan rata-rata skor tertinggi:')
      topSymptoms.forEach(([question, score]) => {
        summary.push(`  - Pertanyaan ${question}: ${score.toFixed(1)}`)
      })
    }

    return summary
  }

  /**
   * Calculate average symptom scores across screenings
   */
  private static calculateAverageSymptomScores(screenings: ScreeningData[]): Record<string, number> {
    const symptomTotals: Record<string, number> = {}
    const screeningCounts: Record<string, number> = {}

    screenings.forEach(screening => {
      const esasData = screening.esas_data as any
      if (esasData?.questions) {
        Object.entries(esasData.questions).forEach(([key, value]: [string, any]) => {
          const score = value.score || 0
          symptomTotals[key] = (symptomTotals[key] || 0) + score
          screeningCounts[key] = (screeningCounts[key] || 0) + 1
        })
      }
    })

    // Calculate averages
    const averages: Record<string, number> = {}
    Object.keys(symptomTotals).forEach(key => {
      averages[key] = screeningCounts[key] > 0 ? symptomTotals[key] / screeningCounts[key] : 0
    })

    return averages
  }

  /**
   * Validate patient and screening data for PDF generation
   */
  static validateDataForPDF(
    patient: PatientData,
    screening: ScreeningData
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate patient data
    if (!patient.name || patient.name.trim().length < 2) {
      errors.push('Nama pasien harus diisi')
    }
    if (!patient.age || patient.age < 0 || patient.age > 150) {
      errors.push('Usia pasien tidak valid')
    }
    if (!patient.gender || !['L', 'P'].includes(patient.gender)) {
      errors.push('Jenis kelamin pasien tidak valid')
    }

    // Validate screening data
    if (!screening.id) {
      errors.push('ID screening tidak valid')
    }
    if (!screening.created_at) {
      errors.push('Tanggal screening tidak valid')
    }
    if (!screening.esas_data) {
      errors.push('Data ESAS tidak ditemukan')
    } else {
      const esasData = screening.esas_data as any
      if (!esasData.questions || Object.keys(esasData.questions).length !== 9) {
        errors.push('Data pertanyaan ESAS tidak lengkap')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Create mock healthcare provider data
   */
  static createDefaultHealthcareProvider(): {
    name: string
    title: string
    licenseNumber?: string
  } {
    return {
      name: 'Tim Paliatif Care',
      title: 'Healthcare Provider',
      licenseNumber: 'PC-' + Date.now().toString().slice(-8)
    }
  }

  /**
   * Generate PDF filename for patient screenings
   */
  static generatePatientPDFFilename(
    patient: PatientData,
    screening: ScreeningData,
    type: 'screening' | 'history' | 'summary' = 'screening'
  ): string {
    const date = new Date(screening.created_at || '')
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
    const patientName = patient.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)

    const typeSuffix = type === 'screening' ? 'Screening' :
                      type === 'history' ? 'History' :
                      'Summary'

    return `ESAS_${typeSuffix}_${patientName}_${dateStr}_${screening.id.slice(-8)}.pdf`
  }
}

export default PatientManagementPDF