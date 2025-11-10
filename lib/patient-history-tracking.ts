import { createClient } from './supabase'
import type { Database } from './database.types'

// Type definitions
export type PatientHistory = {
  patient: Database['public']['Tables']['patients']['Row']
  screenings: Database['public']['Tables']['screenings']['Row'][]
  timeline: TimelineEntry[]
  statistics: PatientHistoryStatistics
  trends: PatientTrends
  interventions: InterventionHistory[]
}

export type TimelineEntry = {
  id: string
  type: 'screening' | 'intervention' | 'milestone' | 'status_change' | 'note'
  date: string
  title: string
  description: string
  data?: any
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'completed' | 'in_progress' | 'planned'
}

export type PatientHistoryStatistics = {
  totalScreenings: number
  screeningFrequency: {
    thisMonth: number
    lastMonth: number
    average: number
  }
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  symptomAnalysis: {
    [symptom: string]: {
      averageScore: number
      maxScore: number
      minScore: number
      improvementRate: number
    }
  }
  interventionEffectiveness: {
    [interventionType: string]: {
      appliedCount: number
      averageImprovement: number
      successRate: number
    }
  }
  timeBasedProgress: {
    firstScreening: string | null
    lastScreening: string | null
    totalDays: number
    averageImprovementPerMonth: number
  }
}

export type PatientTrends = {
  overall: {
    direction: 'improving' | 'declining' | 'stable'
    confidence: number
    trend: { date: string, score: number }[]
  }
  symptoms: {
    [symptomNumber: string]: {
      direction: 'improving' | 'declining' | 'stable'
      confidence: number
      trend: { date: string, score: number }[]
    }
  }
  risk: {
    direction: 'improving' | 'declining' | 'stable'
    confidence: number
    trend: { date: string, riskLevel: number }[]
  }
}

export type InterventionHistory = {
  id: string
  date: string
  type: string
  title: string
  description: string[]
  effectiveness: {
    beforeScore?: number
    afterScore?: number
    improvement: number
    duration: number
    effectiveness: 'high' | 'medium' | 'low'
  }
  followUp: {
    nextDate?: string
    required: boolean
    status: 'completed' | 'pending' | 'missed'
  }
}

// Error handling utility
export class PatientHistoryError extends Error {
  constructor(
    message: string,
    public code: string = 'PATIENT_HISTORY_ERROR',
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'PatientHistoryError'
  }
}

/**
 * Get complete patient history with timeline and analytics
 */
export const getPatientHistory = async (patientId: string): Promise<PatientHistory> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientHistoryError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Get patient data with all screenings
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .eq('user_id', currentUser.data.user.id)
      .single()

    if (patientError) {
      throw new PatientHistoryError(patientError.message, 'PATIENT_NOT_FOUND', 404)
    }

    // Get all screenings for the patient
    const { data: screenings, error: screeningsError } = await supabase
      .from('screenings')
      .select('*')
      .eq('patient_id', patientId)
      .eq('user_id', currentUser.data.user.id)
      .order('created_at', { ascending: true })

    if (screeningsError) {
      throw new PatientHistoryError(screeningsError.message, 'SCREENINGS_ERROR', 500)
    }

    const screeningsList = screenings || []

    // Generate timeline
    const timeline = generateTimeline(screeningsList)

    // Calculate statistics
    const statistics = calculateHistoryStatistics(screeningsList)

    // Analyze trends
    const trends = analyzePatientTrends(screeningsList)

    // Generate intervention history
    const interventions = generateInterventionHistory(screeningsList)

    return {
      patient,
      screenings: screeningsList,
      timeline,
      statistics,
      trends,
      interventions
    }
  } catch (error) {
    if (error instanceof PatientHistoryError) {
      throw error
    }
    throw new PatientHistoryError(
      'Gagal mengambil riwayat pasien',
      'HISTORY_ERROR',
      500
    )
  }
}

/**
 * Get patient progress timeline
 */
export const getPatientTimeline = async (
  patientId: string,
  startDate?: string,
  endDate?: string
): Promise<TimelineEntry[]> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientHistoryError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Build query
    let query = supabase
      .from('screenings')
      .select('*')
      .eq('patient_id', patientId)
      .eq('user_id', currentUser.data.user.id)

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: screenings, error } = await query
      .order('created_at', { ascending: true })

    if (error) {
      throw new PatientHistoryError(error.message, 'TIMELINE_ERROR', 500)
    }

    return generateTimeline(screenings || [])
  } catch (error) {
    if (error instanceof PatientHistoryError) {
      throw error
    }
    throw new PatientHistoryError(
      'Gagal mengambil timeline pasien',
      'TIMELINE_ERROR',
      500
    )
  }
}

/**
 * Export patient history to various formats
 */
export const exportPatientHistory = async (
  patientId: string,
  format: 'pdf' | 'csv' | 'json' = 'pdf'
): Promise<{
  data: string | Uint8Array
  filename: string
  mimeType: string
}> => {
  try {
    const history = await getPatientHistory(patientId)

    switch (format) {
      case 'json':
        return {
          data: JSON.stringify(history, null, 2),
          filename: `patient-history-${history.patient.name}-${new Date().toISOString().split('T')[0]}.json`,
          mimeType: 'application/json'
        }

      case 'csv':
        return exportHistoryToCSV(history)

      case 'pdf':
        return exportHistoryToPDF(history)

      default:
        throw new PatientHistoryError('Format tidak didukung', 'INVALID_FORMAT', 400)
    }
  } catch (error) {
    if (error instanceof PatientHistoryError) {
      throw error
    }
    throw new PatientHistoryError(
      'Gagal mengekspor riwayat pasien',
      'EXPORT_ERROR',
      500
    )
  }
}

/**
 * Track symptom progression over time
 */
export const getSymptomProgression = async (
  patientId: string,
  symptomNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
): Promise<{
  [symptomNumber: string]: {
    progression: { date: string, score: number, riskLevel: string }[]
    statistics: {
      averageScore: number
      improvementRate: number
      variability: number
      trendDirection: 'improving' | 'declining' | 'stable'
    }
  }
}> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientHistoryError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    const { data: screenings, error } = await supabase
      .from('screenings')
      .select('created_at, esas_data, risk_level, highest_score')
      .eq('patient_id', patientId)
      .eq('user_id', currentUser.data.user.id)
      .order('created_at', { ascending: true })

    if (error) {
      throw new PatientHistoryError(error.message, 'PROGRESSION_ERROR', 500)
    }

    const result: any = {}

    for (const symptomNum of symptomNumbers) {
      const symptomKey = symptomNum.toString()
      const progression: any[] = []

      screenings?.forEach(screening => {
        const esasData = screening.esas_data as any
        const symptomData = esasData?.questions?.[symptomKey]

        if (symptomData && symptomData.score) {
          progression.push({
            date: screening.created_at,
            score: symptomData.score,
            riskLevel: screening.risk_level
          })
        }
      })

      // Calculate statistics
      const scores = progression.map(p => p.score)
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

      // Calculate improvement rate
      let improvementRate = 0
      if (scores.length >= 2) {
        const firstScore = scores[0]
        const lastScore = scores[scores.length - 1]
        improvementRate = ((firstScore - lastScore) / firstScore) * 100
      }

      // Calculate variability (standard deviation)
      const variance = scores.length > 1
        ? scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length
        : 0
      const variability = Math.sqrt(variance)

      // Determine trend direction
      let trendDirection: 'improving' | 'declining' | 'stable' = 'stable'
      if (scores.length >= 3) {
        const recent = scores.slice(-3)
        const older = scores.slice(0, -3)

        if (older.length > 0) {
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

          if (recentAvg < olderAvg - 1) {
            trendDirection = 'improving'
          } else if (recentAvg > olderAvg + 1) {
            trendDirection = 'declining'
          }
        }
      }

      result[symptomKey] = {
        progression,
        statistics: {
          averageScore: Math.round(averageScore * 10) / 10,
          improvementRate: Math.round(improvementRate * 10) / 10,
          variability: Math.round(variability * 10) / 10,
          trendDirection
        }
      }
    }

    return result
  } catch (error) {
    if (error instanceof PatientHistoryError) {
      throw error
    }
    throw new PatientHistoryError(
      'Gagal mengambil progresi gejala',
      'PROGRESSION_ERROR',
      500
    )
  }
}

/**
 * Add milestone or note to patient history
 */
export const addHistoryNote = async (
  patientId: string,
  note: {
    type: 'milestone' | 'note' | 'intervention' | 'status_change'
    title: string
    description: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    data?: any
  }
): Promise<TimelineEntry> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientHistoryError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Verify patient exists and belongs to user
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('user_id', currentUser.data.user.id)
      .single()

    if (!patient) {
      throw new PatientHistoryError('Pasien tidak ditemukan', 'PATIENT_NOT_FOUND', 404)
    }

    // Create timeline entry (this would ideally be stored in a separate table)
    const timelineEntry: TimelineEntry = {
      id: generateId(),
      type: note.type,
      date: new Date().toISOString(),
      title: note.title,
      description: note.description,
      data: note.data,
      severity: note.severity,
      status: 'completed'
    }

    // In a real implementation, this would be saved to a history_notes table
    // For now, we return the created entry

    return timelineEntry
  } catch (error) {
    if (error instanceof PatientHistoryError) {
      throw error
    }
    throw new PatientHistoryError(
      'Gagal menambahkan catatan riwayat',
      'NOTE_ERROR',
      500
    )
  }
}

// Helper functions
function generateTimeline(screenings: Database['public']['Tables']['screenings']['Row'][]): TimelineEntry[] {
  const timeline: TimelineEntry[] = []

  screenings.forEach(screening => {
    const esasData = screening.esas_data as any
    const primaryQuestion = esasData?.questions?.[screening.primary_question]

    timeline.push({
      id: screening.id,
      type: 'screening',
      date: screening.created_at || '',
      title: `ESAS Screening - ${screening.screening_type}`,
      description: `Skor tertinggi: ${screening.highest_score} (${primaryQuestion?.text || 'N/A'})`,
      data: screening,
      severity: screening.risk_level as any,
      status: screening.status as any
    })
  })

  return timeline.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function calculateHistoryStatistics(screenings: Database['public']['Tables']['screenings']['Row'][]): PatientHistoryStatistics {
  const totalScreenings = screenings.length

  // Screening frequency
  const thisMonth = screenings.filter(s => {
    if (!s.created_at) return false
    const screeningDate = new Date(s.created_at)
    const now = new Date()
    return screeningDate.getMonth() === now.getMonth() &&
           screeningDate.getFullYear() === now.getFullYear()
  }).length

  const lastMonth = screenings.filter(s => {
    if (!s.created_at) return false
    const screeningDate = new Date(s.created_at)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    return screeningDate.getMonth() === lastMonth.getMonth() &&
           screeningDate.getFullYear() === lastMonth.getFullYear()
  }).length

  const average = totalScreenings > 0
    ? Math.round((totalScreenings / getDaysBetweenFirstAndLast(screenings)) * 30)
    : 0

  // Risk distribution
  const riskDistribution = screenings.reduce((acc, s) => {
    acc[s.risk_level as keyof typeof acc]++
    return acc
  }, { low: 0, medium: 0, high: 0, critical: 0 })

  // Symptom analysis
  const symptomAnalysis = calculateSymptomAnalysis(screenings)

  // Time-based progress
  const timeBasedProgress = {
    firstScreening: screenings.length > 0 ? screenings[0].created_at : null,
    lastScreening: screenings.length > 0 ? screenings[screenings.length - 1].created_at : null,
    totalDays: getDaysBetweenFirstAndLast(screenings),
    averageImprovementPerMonth: calculateAverageImprovement(screenings)
  }

  return {
    totalScreenings,
    screeningFrequency: {
      thisMonth,
      lastMonth,
      average
    },
    riskDistribution,
    symptomAnalysis,
    interventionEffectiveness: {}, // To be implemented
    timeBasedProgress
  }
}

function analyzePatientTrends(screenings: Database['public']['Tables']['screenings']['Row'][]): PatientTrends {
  const scores = screenings.map(s => s.highest_score)
  const riskLevels = screenings.map(s => {
    switch (s.risk_level) {
      case 'low': return 1
      case 'medium': return 2
      case 'high': return 3
      case 'critical': return 4
      default: return 0
    }
  })

  const overallTrend = calculateTrendData(scores, screenings.map(s => s.created_at).filter(Boolean) as string[])
  const riskTrend = calculateTrendData(riskLevels, screenings.map(s => s.created_at).filter(Boolean) as string[], true)

  const symptoms: any = {}

  for (let i = 1; i <= 9; i++) {
    const symptomScores = screenings.map(s => {
      const esasData = s.esas_data as any
      return esasData?.questions?.[i]?.score || 0
    }).filter(score => score > 0)

    symptoms[i.toString()] = calculateTrendData(symptomScores, screenings.map(s => s.created_at).filter(Boolean) as string[])
  }

  return {
    overall: overallTrend,
    symptoms,
    risk: riskTrend
  }
}

function generateInterventionHistory(screenings: Database['public']['Tables']['screenings']['Row'][]): InterventionHistory[] {
  const interventions: InterventionHistory[] = []

  screenings.forEach((screening, index) => {
    const recommendation = screening.recommendation as any
    if (recommendation && recommendation.diagnosis) {
      const beforeScore = index > 0 ? screenings[index - 1].highest_score : undefined
      const afterScore = screening.highest_score

      let improvement = 0
      let effectiveness: 'high' | 'medium' | 'low' = 'low'

      if (beforeScore && afterScore) {
        improvement = beforeScore - afterScore
        if (improvement >= 3) effectiveness = 'high'
        else if (improvement >= 1) effectiveness = 'medium'
      }

      interventions.push({
        id: `${screening.id}-intervention`,
        date: screening.created_at || new Date().toISOString(),
        type: recommendation.therapy_type || 'Unknown',
        title: recommendation.diagnosis || 'Intervention',
        description: recommendation.intervention_steps || [],
        effectiveness: {
          beforeScore,
          afterScore,
          improvement,
          duration: 0, // Would need duration calculation
          effectiveness
        },
        followUp: {
          required: true,
          status: 'pending'
        }
      })
    }
  })

  return interventions
}

function calculateTrendData(scores: number[], dates: string[]): {
  direction: 'improving' | 'declining' | 'stable'
  confidence: number
  trend: { date: string, score: number }[]
}

function calculateTrendData(scores: number[], dates: string[], isRiskTrend: true): {
  direction: 'improving' | 'declining' | 'stable'
  confidence: number
  trend: { date: string, riskLevel: number }[]
}

function calculateTrendData(scores: number[], dates: string[], isRiskTrend?: boolean): {
  direction: 'improving' | 'declining' | 'stable'
  confidence: number
  trend: { date: string, score: number }[] | { date: string, riskLevel: number }[]
} {
  if (scores.length < 2) {
    const trend = isRiskTrend
      ? scores.map((score, i) => ({ date: dates[i], riskLevel: score }))
      : scores.map((score, i) => ({ date: dates[i], score }))

    return {
      direction: 'stable',
      confidence: 0,
      trend
    }
  }

  const trend = isRiskTrend
    ? scores.map((score, i) => ({ date: dates[i], riskLevel: score }))
    : scores.map((score, i) => ({ date: dates[i], score }))

  // Simple linear regression for trend direction
  const n = scores.length
  const sumX = scores.reduce((sum, _, i) => sum + i, 0)
  const sumY = scores.reduce((sum, score) => sum + score, 0)
  const sumXY = scores.reduce((sum, score, i) => sum + (i * score), 0)
  const sumXX = scores.reduce((sum, _, i) => sum + (i * i), 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const confidence = Math.min(Math.abs(slope) * 10, 100)

  let direction: 'improving' | 'declining' | 'stable' = 'stable'
  if (slope < -0.1) direction = 'improving'
  else if (slope > 0.1) direction = 'declining'

  return { direction, confidence, trend }
}

function calculateSymptomAnalysis(screenings: Database['public']['Tables']['screenings']['Row'][]) {
  const analysis: any = {}

  for (let i = 1; i <= 9; i++) {
    const symptomKey = i.toString()
    const scores: number[] = []

    screenings.forEach(screening => {
      const esasData = screening.esas_data as any
      const symptomData = esasData?.questions?.[symptomKey]
      if (symptomData && symptomData.score) {
        scores.push(symptomData.score)
      }
    })

    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const max = Math.max(...scores)
      const min = Math.min(...scores)

      let improvementRate = 0
      if (scores.length >= 2) {
        const first = scores[0]
        const last = scores[scores.length - 1]
        improvementRate = ((first - last) / first) * 100
      }

      analysis[`symptom_${i}`] = {
        averageScore: Math.round(avg * 10) / 10,
        maxScore: max,
        minScore: min,
        improvementRate: Math.round(improvementRate * 10) / 10
      }
    }
  }

  return analysis
}

function getDaysBetweenFirstAndLast(screenings: Database['public']['Tables']['screenings']['Row'][]): number {
  if (screenings.length < 2) return 0

  const firstDate = screenings[0].created_at
  const lastDate = screenings[screenings.length - 1].created_at

  if (!firstDate || !lastDate) return 0

  const first = new Date(firstDate)
  const last = new Date(lastDate)
  return Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24))
}

function calculateAverageImprovement(screenings: Database['public']['Tables']['screenings']['Row'][]): number {
  if (screenings.length < 2) return 0

  let totalImprovement = 0
  for (let i = 1; i < screenings.length; i++) {
    const improvement = screenings[i - 1].highest_score - screenings[i].highest_score
    totalImprovement += improvement
  }

  return Math.round((totalImprovement / (screenings.length - 1)) * 10) / 10
}

function exportHistoryToCSV(history: PatientHistory): {
  data: string
  filename: string
  mimeType: string
} {
  const csvHeaders = [
    'Tanggal',
    'Tipe Screening',
    'Skor Tertinggi',
    'Pertanyaan Utama',
    'Tingkat Risiko',
    'Status'
  ]

  const csvRows = history.screenings.map(screening => [
    screening.created_at,
    screening.screening_type,
    screening.highest_score,
    screening.primary_question,
    screening.risk_level,
    screening.status
  ])

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n')

  return {
    data: csvContent,
    filename: `patient-history-${history.patient.name}-${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv'
  }
}

function exportHistoryToPDF(history: PatientHistory): {
  data: Uint8Array
  filename: string
  mimeType: string
} {
  // This would typically use a PDF library like jsPDF or puppeteer
  // For now, return a placeholder
  const pdfContent = `Patient History Report for ${history.patient.name}\n\n` +
    `Total Screenings: ${history.statistics.totalScreenings}\n` +
    `First Screening: ${history.statistics.timeBasedProgress.firstScreening}\n` +
    `Last Screening: ${history.statistics.timeBasedProgress.lastScreening}\n\n` +
    `Risk Distribution:\n` +
    `- Low: ${history.statistics.riskDistribution.low}\n` +
    `- Medium: ${history.statistics.riskDistribution.medium}\n` +
    `- High: ${history.statistics.riskDistribution.high}\n` +
    `- Critical: ${history.statistics.riskDistribution.critical}`

  const encoder = new TextEncoder()
  return {
    data: encoder.encode(pdfContent),
    filename: `patient-history-${history.patient.name}-${new Date().toISOString().split('T')[0]}.pdf`,
    mimeType: 'application/pdf'
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}