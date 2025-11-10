import { createClient } from './supabase'
import { z } from 'zod'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { patientSchema, patientSearchSchema, getValidationErrors } from './validations'
import type { Database, TablesInsert, TablesUpdate } from './database.types'

// Type definitions
export type Patient = Database['public']['Tables']['patients']['Row']
export type PatientInsert = TablesInsert<'patients'>
export type PatientUpdate = TablesUpdate<'patients'>
export type PatientSearch = {
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type PatientWithScreenings = Patient & {
  screenings: Database['public']['Tables']['screenings']['Row'][]
  last_screening?: Database['public']['Tables']['screenings']['Row']
  screening_count: number
}

export type DashboardStats = {
  totalPatients: number
  totalScreenings: number
  screeningsThisMonth: number
  recentPatients: Patient[]
  highRiskPatients: Patient[]
  averageAge: number
  genderDistribution: {
    L: number
    P: number
  }
}

// Error handling utility
export class PatientError extends Error {
  constructor(
    message: string,
    public code: string = 'PATIENT_ERROR',
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'PatientError'
  }
}

/**
 * Create a new patient with validation
 */
export const createPatient = async (patientData: PatientInsert): Promise<Patient> => {
  try {
    // Validate input data
    const validatedData = patientSchema.parse(patientData)

    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Check if patient with same name, age, and gender already exists for this user
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', currentUser.data.user.id)
      .eq('name', validatedData.name)
      .eq('age', validatedData.age)
      .eq('gender', validatedData.gender)
      .single()

    if (existingPatient) {
      throw new PatientError(
        'Pasien dengan nama, usia, dan jenis kelamin yang sama sudah ada',
        'DUPLICATE_PATIENT',
        409
      )
    }

    // Create patient with user_id
    const patientWithUser = {
      ...validatedData,
      user_id: currentUser.data.user.id,
    }

    const { data, error } = await supabase
      .from('patients')
      .insert(patientWithUser)
      .select()
      .single()

    if (error) {
      throw new PatientError(error.message, 'DATABASE_ERROR', 500)
    }

    return data
  } catch (error) {
    if (error instanceof PatientError) {
      throw error
    }
    if (error instanceof z.ZodError) {
      throw new PatientError('Data pasien tidak valid', 'VALIDATION_ERROR', 400)
    }
    throw new PatientError('Gagal membuat pasien baru', 'CREATE_ERROR', 500)
  }
}

/**
 * Update patient information with validation
 */
export const updatePatient = async (
  patientId: string,
  updates: PatientUpdate
): Promise<Patient> => {
  try {
    // Validate input data
    const validatedData = patientSchema.partial().parse(updates)

    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Check if patient exists and belongs to current user
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()

    if (!existingPatient) {
      throw new PatientError('Pasien tidak ditemukan', 'NOT_FOUND', 404)
    }

    if (existingPatient.user_id !== currentUser.data.user.id) {
      throw new PatientError('Akses ditolak', 'FORBIDDEN', 403)
    }

    // Check for duplicates if name, age, or gender is being updated
    if (validatedData.name || validatedData.age || validatedData.gender) {
      const { data: duplicatePatient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', currentUser.data.user.id)
        .eq('name', validatedData.name || existingPatient.name)
        .eq('age', validatedData.age || existingPatient.age)
        .eq('gender', validatedData.gender || existingPatient.gender)
        .neq('id', patientId)
        .single()

      if (duplicatePatient) {
        throw new PatientError(
          'Pasien dengan nama, usia, dan jenis kelamin yang sama sudah ada',
          'DUPLICATE_PATIENT',
          409
        )
      }
    }

    const { data, error } = await supabase
      .from('patients')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', patientId)
      .select()
      .single()

    if (error) {
      throw new PatientError(error.message, 'DATABASE_ERROR', 500)
    }

    return data
  } catch (error) {
    if (error instanceof PatientError) {
      throw error
    }
    if (error instanceof z.ZodError) {
      throw new PatientError('Data pasien tidak valid', 'VALIDATION_ERROR', 400)
    }
    throw new PatientError('Gagal mengupdate data pasien', 'UPDATE_ERROR', 500)
  }
}

/**
 * Search patients with advanced filtering and pagination
 */
export const searchPatients = async (
  searchParams: PatientSearch = {}
): Promise<{
  patients: Patient[]
  total: number
  page: number
  limit: number
  totalPages: number
}> => {
  try {
    const validatedParams = patientSearchSchema.parse(searchParams)

    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    const {
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = validatedParams

    // Build query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', currentUser.data.user.id)

    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Apply date range filter
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Apply sorting
    query = query.order(sortBy as keyof Patient, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new PatientError(error.message, 'DATABASE_ERROR', 500)
    }

    return {
      patients: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  } catch (error) {
    if (error instanceof PatientError) {
      throw error
    }
    throw new PatientError('Gagal melakukan pencarian pasien', 'SEARCH_ERROR', 500)
  }
}

/**
 * Get patient by ID with screenings
 */
export const getPatientById = async (patientId: string): Promise<PatientWithScreenings> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Get patient with screenings
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
          created_at,
          recommendation
        )
      `
      )
      .eq('id', patientId)
      .eq('user_id', currentUser.data.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new PatientError('Pasien tidak ditemukan', 'NOT_FOUND', 404)
      }
      throw new PatientError(error.message, 'DATABASE_ERROR', 500)
    }

    // Sort screenings by date
    const screenings = data.screenings.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return {
      ...data,
      screenings,
      last_screening: screenings[0],
      screening_count: screenings.length,
    }
  } catch (error) {
    if (error instanceof PatientError) {
      throw error
    }
    throw new PatientError('Gagal mengambil data pasien', 'GET_ERROR', 500)
  }
}

/**
 * Delete patient (soft delete by updating status)
 */
export const deletePatient = async (patientId: string): Promise<void> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Check if patient exists and belongs to current user
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id, user_id')
      .eq('id', patientId)
      .single()

    if (!existingPatient) {
      throw new PatientError('Pasien tidak ditemukan', 'NOT_FOUND', 404)
    }

    if (existingPatient.user_id !== currentUser.data.user.id) {
      throw new PatientError('Akses ditolak', 'FORBIDDEN', 403)
    }

    // Check if patient has screenings
    const { data: screenings } = await supabase
      .from('screenings')
      .select('id')
      .eq('patient_id', patientId)
      .limit(1)

    if (screenings && screenings.length > 0) {
      throw new PatientError(
        'Tidak dapat menghapus pasien yang memiliki riwayat screening',
        'HAS_SCREENINGS',
        400
      )
    }

    // Delete patient
    const { error } = await supabase.from('patients').delete().eq('id', patientId)

    if (error) {
      throw new PatientError(error.message, 'DATABASE_ERROR', 500)
    }
  } catch (error) {
    if (error instanceof PatientError) {
      throw error
    }
    throw new PatientError('Gagal menghapus pasien', 'DELETE_ERROR', 500)
  }
}

/**
 * Get dashboard statistics for patients
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    const userId = currentUser.data.user.id

    // Get total patients
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get total screenings
    const { count: totalScreenings } = await supabase
      .from('screenings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get screenings this month
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const { count: screeningsThisMonth } = await supabase
      .from('screenings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${currentMonth}-01`)
      .lt('created_at', `${currentMonth}-31`)

    // Get recent patients (last 5)
    const { data: recentPatients } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get gender distribution
    const { data: genderData } = await supabase
      .from('patients')
      .select('gender')
      .eq('user_id', userId)

    const genderDistribution = genderData?.reduce(
      (acc, patient) => {
        acc[patient.gender as 'L' | 'P']++
        return acc
      },
      { L: 0, P: 0 }
    ) || { L: 0, P: 0 }

    // Get average age
    const { data: ageData } = await supabase.from('patients').select('age').eq('user_id', userId)

    const averageAge =
      ageData && ageData.length > 0
        ? Math.round(ageData.reduce((sum, patient) => sum + patient.age, 0) / ageData.length)
        : 0

    // Get high risk patients (patients with screenings that have high risk level)
    const { data: highRiskScreenings } = await supabase
      .from('screenings')
      .select('patient_id')
      .eq('user_id', userId)
      .eq('risk_level', 'high')

    const highRiskPatientIds = [...new Set(highRiskScreenings?.map((s) => s.patient_id) || [])]

    const { data: highRiskPatients } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .in('id', highRiskPatientIds)
      .order('updated_at', { ascending: false })

    return {
      totalPatients: totalPatients || 0,
      totalScreenings: totalScreenings || 0,
      screeningsThisMonth: screeningsThisMonth || 0,
      recentPatients: recentPatients || [],
      highRiskPatients: highRiskPatients || [],
      averageAge,
      genderDistribution,
    }
  } catch (error) {
    if (error instanceof PatientError) {
      throw error
    }
    throw new PatientError('Gagal mengambil statistik dashboard', 'DASHBOARD_ERROR', 500)
  }
}

/**
 * Get patient screening history
 */
export const getPatientScreeningHistory = async (patientId: string) => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Verify patient belongs to user
    const { data: patient } = await supabase
      .from('patients')
      .select('id, user_id')
      .eq('id', patientId)
      .single()

    if (!patient || patient.user_id !== currentUser.data.user.id) {
      throw new PatientError('Pasien tidak ditemukan', 'NOT_FOUND', 404)
    }

    // Get screening history
    const { data, error } = await supabase
      .from('screenings')
      .select(
        `
        id,
        screening_type,
        status,
        highest_score,
        primary_question,
        risk_level,
        esas_data,
        recommendation,
        created_at,
        updated_at
      `
      )
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new PatientError(error.message, 'DATABASE_ERROR', 500)
    }

    return data || []
  } catch (error) {
    if (error instanceof PatientError) {
      throw error
    }
    throw new PatientError('Gagal mengambil riwayat screening pasien', 'HISTORY_ERROR', 500)
  }
}

/**
 * Get patients with their latest screening for dashboard display
 */
export const getPatientsWithLatestScreening = async (limit: number = 10) => {
  try {
    const supabase = createClient()
    const currentUser = await supabase.auth.getUser()

    if (!currentUser.data.user) {
      throw new PatientError('User not authenticated', 'UNAUTHORIZED', 401)
    }

    // Get patients with their latest screening using a subquery approach
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
        screenings!inner (
          id,
          screening_type,
          highest_score,
          primary_question,
          risk_level,
          created_at
        )
      `
      )
      .eq('user_id', currentUser.data.user.id)
      .order('screenings.created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new PatientError(error.message, 'DATABASE_ERROR', 500)
    }

    // Group by patient and get only the latest screening for each
    const patientMap = new Map()

    data?.forEach((item: any) => {
      const patientKey = item.id
      if (
        !patientMap.has(patientKey) ||
        new Date(item.screenings.created_at).getTime() >
          new Date(patientMap.get(patientKey).screenings.created_at).getTime()
      ) {
        patientMap.set(patientKey, item)
      }
    })

    return Array.from(patientMap.values())
  } catch (error) {
    if (error instanceof PatientError) {
      throw error
    }
    throw new PatientError('Gagal mengambil data pasien terbaru', 'LATEST_ERROR', 500)
  }
}
