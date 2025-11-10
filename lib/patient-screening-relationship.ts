import { createClient } from './supabase'
import type { Database, TablesInsert } from './database.types'

// Type definitions
export type Screening = Database['public']['Tables']['screenings']['Row']
export type ScreeningInsert = TablesInsert<'screenings'>
export type PatientScreeningSummary = {
  patient: Database['public']['Tables']['patients']['Row']
  latestScreening?: Screening
  screeningHistory: Screening[]
  screeningCount: number
  firstScreeningDate?: string
  lastScreeningDate?: string
  progressTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
  averageRiskScore: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
}

export type PatientProgressAnalytics = {
  patient: Database['public']['Tables']['patients']['Row']
  screenings: Screening[]
  trendAnalysis: {
    overallTrend: 'improving' | 'declining' | 'stable'
    riskTrend: 'improving' | 'declining' | 'stable'
    symptomProgress: {
      [questionNumber: string]: {
        scores: number[]
        trend: 'improving' | 'declining' | 'stable'
        averageScore: number
        maxScore: number
        minScore: number
      }
    }
  }
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  screeningFrequency: {
    totalScreenings: number
    averageDaysBetweenScreenings: number
    screeningStreak: number
    longestGapDays: number
  }
  recommendations: {
    followUpNeeded: boolean
    recommendedActions: string[]
    priorityLevel: 'low' | 'medium' | 'high'
    nextRecommendedScreeningDate: string
  }
}

// Error handling utility
export class ScreeningRelationshipError extends Error {
  constructor(
    message: string,
    public code: string = 'SCREENING_RELATIONSHIP_ERROR',
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ScreeningRelationshipError'
  }
}

/**
 * Link existing patient to new screening
 */
export const linkPatientToScreening = async (
  patientId: string,
  screeningData: ScreeningInsert
): Promise<Screening> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new ScreeningRelationshipError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Verify patient exists and belongs to current user
    const { data: patient } = await supabase
      .from('patients')
      .select('id, user_id, name, age, gender')
      .eq('id', patientId)
      .single()

    if (!patient) {
      throw new ScreeningRelationshipError('Pasien tidak ditemukan', 'PATIENT_NOT_FOUND', 404)
    }

    if (patient.user_id !== currentUser.data.user.id) {
      throw new ScreeningRelationshipError('Akses ditolak', 'FORBIDDEN', 403)
    }

    // Prepare screening data with patient info
    const esasData = screeningData.esas_data as any
    const enhancedScreeningData = {
      ...screeningData,
      patient_id: patientId,
      user_id: currentUser.data.user.id,
      esas_data: {
        ...esasData,
        identity: {
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          facility_name: esasData?.identity?.facility_name,
        },
      },
    }

    // Create screening
    const { data, error } = await supabase
      .from('screenings')
      .insert(enhancedScreeningData)
      .select()
      .single()

    if (error) {
      throw new ScreeningRelationshipError(error.message, 'DATABASE_ERROR', 500)
    }

    return data
  } catch (error) {
    if (error instanceof ScreeningRelationshipError) {
      throw error
    }
    throw new ScreeningRelationshipError('Gagal mengaitkan pasien ke screening', 'LINK_ERROR', 500)
  }
}

/**
 * Get comprehensive patient-screening summary
 */
export const getPatientScreeningSummary = async (
  patientId: string
): Promise<PatientScreeningSummary> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new ScreeningRelationshipError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Get patient with all screenings
    const { data, error } = await supabase
      .from('patients')
      .select(
        `
        *,
        screenings (
          id,
          screening_type,
          status,
          highest_score,
          primary_question,
          risk_level,
          esas_data,
          created_at
        )
      `
      )
      .eq('id', patientId)
      .eq('user_id', currentUser.data.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ScreeningRelationshipError('Pasien tidak ditemukan', 'PATIENT_NOT_FOUND', 404)
      }
      throw new ScreeningRelationshipError(error.message, 'DATABASE_ERROR', 500)
    }

    const screenings = data.screenings.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Calculate statistics
    const screeningCount = screenings.length
    const latestScreening = screenings[0]
    const firstScreening = screenings[screenings.length - 1]

    // Risk distribution
    const highRiskCount = screenings.filter(
      (s: any) => s.risk_level === 'high' || s.risk_level === 'critical'
    ).length
    const mediumRiskCount = screenings.filter((s: any) => s.risk_level === 'medium').length
    const lowRiskCount = screenings.filter((s: any) => s.risk_level === 'low').length

    // Average risk score
    const averageRiskScore =
      screenings.length > 0
        ? screenings.reduce((sum: number, s: any) => sum + s.highest_score, 0) / screenings.length
        : 0

    // Determine progress trend
    let progressTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data' =
      'insufficient_data'

    if (screenings.length >= 2) {
      const recent = screenings.slice(0, Math.min(3, screenings.length))
      const older = screenings.slice(Math.min(3, screenings.length), Math.min(6, screenings.length))

      if (older.length > 0) {
        const recentAvg = recent.reduce((sum: number, s: any) => sum + s.highest_score, 0) / recent.length
        const olderAvg = older.reduce((sum: number, s: any) => sum + s.highest_score, 0) / older.length

        if (recentAvg < olderAvg - 1) {
          progressTrend = 'improving'
        } else if (recentAvg > olderAvg + 1) {
          progressTrend = 'declining'
        } else {
          progressTrend = 'stable'
        }
      }
    }

    return {
      patient: data,
      latestScreening,
      screeningHistory: screenings,
      screeningCount,
      firstScreeningDate: firstScreening?.created_at,
      lastScreeningDate: latestScreening?.created_at,
      progressTrend,
      averageRiskScore: Math.round(averageRiskScore * 10) / 10,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
    }
  } catch (error) {
    if (error instanceof ScreeningRelationshipError) {
      throw error
    }
    throw new ScreeningRelationshipError(
      'Gagal mengambil ringkasan screening pasien',
      'SUMMARY_ERROR',
      500
    )
  }
}

/**
 * Get detailed patient progress analytics
 */
export const getPatientProgressAnalytics = async (
  patientId: string
): Promise<PatientProgressAnalytics> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new ScreeningRelationshipError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Get all screenings for the patient
    const { data: screenings, error } = await supabase
      .from('screenings')
      .select('*')
      .eq('patient_id', patientId)
      .eq('user_id', currentUser.data.user.id)
      .order('created_at', { ascending: true })

    if (error) {
      throw new ScreeningRelationshipError(error.message, 'DATABASE_ERROR', 500)
    }

    if (!screenings || screenings.length === 0) {
      throw new ScreeningRelationshipError(
        'Tidak ada data screening untuk pasien ini',
        'NO_SCREENING_DATA',
        404
      )
    }

    // Get patient data
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()

    if (!patient) {
      throw new ScreeningRelationshipError('Pasien tidak ditemukan', 'PATIENT_NOT_FOUND', 404)
    }

    // Analyze symptom progress for each question
    const symptomProgress: PatientProgressAnalytics['trendAnalysis']['symptomProgress'] = {}

    for (let i = 1; i <= 9; i++) {
      const questionScores = screenings
        .map((s) => {
          const esasData = s.esas_data as any
          return esasData?.questions?.[i]?.score || 0
        })
        .filter((score) => score > 0)

      if (questionScores.length > 0) {
        const avg = questionScores.reduce((sum, score) => sum + score, 0) / questionScores.length
        const max = Math.max(...questionScores)
        const min = Math.min(...questionScores)

        // Calculate trend
        let trend: 'improving' | 'declining' | 'stable' = 'stable'
        if (questionScores.length >= 2) {
          const recent = questionScores.slice(-Math.min(3, questionScores.length))
          const older = questionScores.slice(0, Math.max(0, questionScores.length - 3))

          if (older.length > 0) {
            const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length
            const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length

            if (recentAvg < olderAvg - 1) {
              trend = 'improving'
            } else if (recentAvg > olderAvg + 1) {
              trend = 'declining'
            }
          }
        }

        symptomProgress[i.toString()] = {
          scores: questionScores,
          trend,
          averageScore: Math.round(avg * 10) / 10,
          maxScore: max,
          minScore: min,
        }
      }
    }

    // Calculate overall trends
    const overallScores = screenings.map((s) => s.highest_score)
    const overallTrend = calculateTrend(overallScores)
    const riskScores = screenings.map((s) => {
      switch (s.risk_level) {
        case 'low':
          return 1
        case 'medium':
          return 2
        case 'high':
          return 3
        case 'critical':
          return 4
        default:
          return 0
      }
    })
    const riskTrend = calculateTrend(riskScores)

    // Risk distribution
    const riskDistribution = screenings.reduce(
      (acc, s) => {
        acc[s.risk_level as keyof typeof acc]++
        return acc
      },
      { low: 0, medium: 0, high: 0, critical: 0 }
    )

    // Screening frequency analysis
    const screeningFrequency = analyzeScreeningFrequency(screenings)

    // Generate recommendations
    const recommendations = generateRecommendations(screenings, overallTrend, riskTrend)

    return {
      patient,
      screenings,
      trendAnalysis: {
        overallTrend,
        riskTrend,
        symptomProgress,
      },
      riskDistribution,
      screeningFrequency,
      recommendations,
    }
  } catch (error) {
    if (error instanceof ScreeningRelationshipError) {
      throw error
    }
    throw new ScreeningRelationshipError(
      'Gagal menganalisis progress pasien',
      'ANALYTICS_ERROR',
      500
    )
  }
}

/**
 * Get all patients with their latest screening status
 */
export const getAllPatientsWithScreeningStatus = async () => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new ScreeningRelationshipError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Get patients with their latest screening using a window function approach
    const { data, error } = await supabase
      .from('patients')
      .select(
        `
        id,
        name,
        age,
        gender,
        facility_name,
        created_at,
        updated_at,
        screenings (
          id,
          screening_type,
          highest_score,
          primary_question,
          risk_level,
          created_at,
          status
        )
      `
      )
      .eq('user_id', currentUser.data.user.id)
      .order('screenings.created_at', { ascending: false })

    if (error) {
      throw new ScreeningRelationshipError(error.message, 'DATABASE_ERROR', 500)
    }

    // Process to get only the latest screening per patient
    const patientMap = new Map()

    data?.forEach((patient) => {
      if (patient.screenings && patient.screenings.length > 0) {
        const sortedScreenings = patient.screenings.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        const patientWithLatest = {
          ...patient,
          latestScreening: sortedScreenings[0],
          totalScreenings: patient.screenings.length,
          screeningStatus: getScreeningStatus(sortedScreenings[0]),
          needsFollowUp: needsFollowUpScreening(sortedScreenings[0]),
        }

        patientMap.set(patient.id, patientWithLatest)
      } else {
        patientMap.set(patient.id, {
          ...patient,
          latestScreening: null,
          totalScreenings: 0,
          screeningStatus: 'no_screening',
          needsFollowUp: true,
        })
      }
    })

    return Array.from(patientMap.values())
  } catch (error) {
    if (error instanceof ScreeningRelationshipError) {
      throw error
    }
    throw new ScreeningRelationshipError(
      'Gagal mengambil status screening semua pasien',
      'STATUS_ERROR',
      500
    )
  }
}

/**
 * Update screening status for a patient
 */
export const updateScreeningStatus = async (
  screeningId: string,
  status: Database['public']['Tables']['screenings']['Row']['status']
): Promise<Screening> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new ScreeningRelationshipError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Verify screening belongs to user
    const { data: existingScreening } = await supabase
      .from('screenings')
      .select('id, user_id, patient_id')
      .eq('id', screeningId)
      .single()

    if (!existingScreening) {
      throw new ScreeningRelationshipError('Screening tidak ditemukan', 'SCREENING_NOT_FOUND', 404)
    }

    if (existingScreening.user_id !== currentUser.data.user.id) {
      throw new ScreeningRelationshipError('Akses ditolak', 'FORBIDDEN', 403)
    }

    const { data, error } = await supabase
      .from('screenings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', screeningId)
      .select()
      .single()

    if (error) {
      throw new ScreeningRelationshipError(error.message, 'DATABASE_ERROR', 500)
    }

    return data
  } catch (error) {
    if (error instanceof ScreeningRelationshipError) {
      throw error
    }
    throw new ScreeningRelationshipError(
      'Gagal mengupdate status screening',
      'UPDATE_STATUS_ERROR',
      500
    )
  }
}

// Helper functions
function calculateTrend(scores: number[]): 'improving' | 'declining' | 'stable' {
  if (scores.length < 2) return 'stable'

  const recent = scores.slice(-Math.min(3, scores.length))
  const older = scores.slice(0, Math.max(0, scores.length - 3))

  if (older.length === 0) return 'stable'

  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length
  const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length

  if (recentAvg < olderAvg - 1) return 'improving'
  if (recentAvg > olderAvg + 1) return 'declining'
  return 'stable'
}

function analyzeScreeningFrequency(screenings: Screening[]) {
  const totalScreenings = screenings.length

  if (totalScreenings < 2) {
    return {
      totalScreenings,
      averageDaysBetweenScreenings: 0,
      screeningStreak: totalScreenings,
      longestGapDays: 0,
    }
  }

  const gaps: number[] = []
  for (let i = 1; i < screenings.length; i++) {
    const currentDate = screenings[i].created_at
    const previousDate = screenings[i - 1].created_at
    if (!currentDate || !previousDate) continue

    const daysDiff = Math.floor(
      (new Date(currentDate).getTime() -
        new Date(previousDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    gaps.push(daysDiff)
  }

  const averageDaysBetweenScreenings = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
  const longestGapDays = Math.max(...gaps)

  // Calculate current streak (consecutive screenings within 30 days)
  let screeningStreak = 1
  for (let i = screenings.length - 1; i > 0; i--) {
    const currentDate = screenings[i].created_at
    const previousDate = screenings[i - 1].created_at
    if (!currentDate || !previousDate) break

    const daysDiff = Math.floor(
      (new Date(currentDate).getTime() -
        new Date(previousDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    if (daysDiff <= 30) {
      screeningStreak++
    } else {
      break
    }
  }

  return {
    totalScreenings,
    averageDaysBetweenScreenings: Math.round(averageDaysBetweenScreenings),
    screeningStreak,
    longestGapDays,
  }
}

function generateRecommendations(
  screenings: Screening[],
  overallTrend: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  riskTrend: string
): PatientProgressAnalytics['recommendations'] {
  const latestScreening = screenings[screenings.length - 1]
  const daysSinceLastScreening = Math.floor(
    (new Date().getTime() - new Date(latestScreening.created_at || '').getTime()) / (1000 * 60 * 60 * 24)
  )

  const recommendedActions: string[] = []
  let priorityLevel: 'low' | 'medium' | 'high' = 'low'
  let followUpNeeded = false

  // Based on risk level
  if (latestScreening.risk_level === 'high' || latestScreening.risk_level === 'critical') {
    recommendedActions.push('Segera rujuk ke Fasilitas Kesehatan')
    recommendedActions.push('Monitor harian kondisi pasien')
    priorityLevel = 'high'
    followUpNeeded = true
  } else if (latestScreening.risk_level === 'medium') {
    recommendedActions.push('Jadwalkan follow-up dalam 1-2 minggu')
    recommendedActions.push('Implementasi intervensi non-farmakologis')
    priorityLevel = 'medium'
    followUpNeeded = true
  }

  // Based on trend
  if (overallTrend === 'declining') {
    recommendedActions.push('Evaluasi kembali rencana perawatan')
    recommendedActions.push('Pertimbangkan konsultasi spesialis')
    priorityLevel = priorityLevel === 'high' ? 'high' : 'medium'
    followUpNeeded = true
  }

  // Based on time since last screening
  const nextRecommendedDate = new Date()
  if (daysSinceLastScreening > 30) {
    recommendedActions.push('Jadwalkan ulang screening sesegera mungkin')
    followUpNeeded = true
  } else if (latestScreening.risk_level === 'high') {
    nextRecommendedDate.setDate(nextRecommendedDate.getDate() + 7)
  } else if (latestScreening.risk_level === 'medium') {
    nextRecommendedDate.setDate(nextRecommendedDate.getDate() + 14)
  } else {
    nextRecommendedDate.setDate(nextRecommendedDate.getDate() + 30)
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push('Lanjutkan monitoring rutin')
  }

  return {
    followUpNeeded,
    recommendedActions,
    priorityLevel,
    nextRecommendedScreeningDate: nextRecommendedDate.toISOString().split('T')[0],
  }
}

function getScreeningStatus(screening: any | null): string {
  if (!screening) return 'no_screening'
  if (screening.status !== 'completed') return screening.status

  const daysSinceScreening = Math.floor(
    (new Date().getTime() - new Date(screening.created_at || '').getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceScreening > 30) return 'overdue'
  if (screening.risk_level === 'high' || screening.risk_level === 'critical') return 'high_risk'
  if (screening.risk_level === 'medium') return 'medium_risk'
  return 'stable'
}

function needsFollowUpScreening(screening: any | null): boolean {
  if (!screening) return true

  const daysSinceScreening = Math.floor(
    (new Date().getTime() - new Date(screening.created_at || '').getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    daysSinceScreening > 14 ||
    screening.risk_level === 'high' ||
    screening.risk_level === 'critical'
  )
}
