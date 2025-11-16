'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ESASRuleEngine } from '@/lib/esas-rule-engine'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/stores/authStore'
import { ESASPasienForm } from './esas-form-variants'
import { ESASPerawatForm } from './esas-form-perawat'
import { ESASGuestForm } from './esas-form-guest'

interface ESAScreeningFormData {
  identity: {
    name: string
    age: number
    gender: string
    contact_info?: string
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

interface ESASFormRouterProps {
  isGuestMode?: boolean
}

export default function ESASFormRouter({ isGuestMode = false }: ESASFormRouterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, profile, userRole } = useAuthStore()

  // Determine which form to show based on user role and mode
  const getFormVariant = () => {
    // Guest mode takes precedence
    if (isGuestMode) {
      return 'guest'
    }

    // Check for explicit type parameter
    const type = searchParams.get('type')
    if (type === 'self' && userRole === 'pasien') {
      return 'pasien'
    }

    // Default based on user role
    if (userRole === 'pasien') {
      return 'pasien'
    } else if (userRole === 'perawat' || userRole === 'admin') {
      return 'perawat'
    }

    // Fallback to guest if no role detected
    return 'guest'
  }

  const formVariant = getFormVariant()

  const handlePasienSubmit = async (data: ESAScreeningFormData) => {
    try {
      if (!user || !profile) {
        throw new Error('User tidak terautentikasi')
      }

      const supabase = createClient()

      // Process ESAS data with rule engine
      const esasResult = ESASRuleEngine.processESASScreening(data.questions)

      // Determine if this is self-screening (pasien screening for themselves)
      const isSelfScreening = searchParams.get('type') === 'self'

      let patientId: string

      if (isSelfScreening) {
        // For self-screening, create patient record if it doesn't exist
        const patientData = {
          user_id: user.id,
          name: data.patient_info.patient_name.trim(),
          age: data.patient_info.patient_age,
          gender: data.patient_info.patient_gender,
          facility_name: data.patient_info.facility_name || null,
        }

        // Check if patient already exists
        const { data: existingPatients, error: patientCheckError } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', data.patient_info.patient_name.trim())
          .eq('age', data.patient_info.patient_age)
          .eq('gender', data.patient_info.patient_gender)
          .limit(1)

        if (patientCheckError) {
          throw new Error(`Gagal memeriksa data pasien: ${patientCheckError.message}`)
        }

        if (existingPatients && existingPatients.length > 0) {
          patientId = existingPatients[0].id
        } else {
          // Create new patient record
          const { data: newPatient, error: patientError } = await supabase
            .from('patients')
            .insert(patientData)
            .select()
            .single()

          if (patientError) {
            throw new Error(`Gagal membuat data pasien: ${patientError.message}`)
          }

          patientId = newPatient.id
        }
      } else {
        // Regular patient selection - use existing logic
        // This should not happen for pasien form, but included for completeness
        throw new Error('Mode ini tidak didukung untuk form pasien')
      }

      // Create screening record
      const screeningData = {
        user_id: user.id,
        patient_id: patientId,
        screening_type: data.patient_info.screening_type,
        status: 'completed',
        esas_data: {
          ...data,
          timestamp: new Date().toISOString(),
          user_role: userRole,
          screening_mode: 'pasien-self'
        },
        recommendation: esasResult.recommendation,
        highest_score: esasResult.highestScore,
        primary_question: esasResult.primaryQuestion,
        risk_level: esasResult.riskLevel,
      }

      const { data: screening, error: screeningError } = await supabase
        .from('screenings')
        .insert(screeningData)
        .select()
        .single()

      if (screeningError) {
        throw new Error(`Gagal menyimpan screening: ${screeningError.message}`)
      }

      toast({
        title: "Berhasil",
        description: "Screening ESAS berhasil disimpan dalam rekam medis Anda.",
      })

      // Redirect to results page
      router.push(`/screening/${screening.id}/result`)

    } catch (error) {
      // Pasien form submit error
      throw error
    }
  }

  const handlePerawatSubmit = async (data: ESAScreeningFormData, patientId: string) => {
    try {
      if (!user || !profile) {
        throw new Error('User tidak terautentikasi')
      }

      const supabase = createClient()

      // Process ESAS data with rule engine
      const esasResult = ESASRuleEngine.processESASScreening(data.questions)

      // Create screening record
      const screeningData = {
        user_id: user.id,
        patient_id: patientId,
        screening_type: data.patient_info.screening_type,
        status: 'completed',
        esas_data: {
          ...data,
          timestamp: new Date().toISOString(),
          user_role: userRole,
          screening_mode: 'perawat-assisted'
        },
        recommendation: esasResult.recommendation,
        highest_score: esasResult.highestScore,
        primary_question: esasResult.primaryQuestion,
        risk_level: esasResult.riskLevel,
      }

      const { data: screening, error: screeningError } = await supabase
        .from('screenings')
        .insert(screeningData)
        .select()
        .single()

      if (screeningError) {
        throw new Error(`Gagal menyimpan screening: ${screeningError.message}`)
      }

      toast({
        title: "Berhasil",
        description: "Screening pasien berhasil disimpan.",
      })

      // Redirect to results page
      router.push(`/screening/${screening.id}/result`)

    } catch (error) {
      // Perawat form submit error
      throw error
    }
  }

  const handleGuestSubmit = async (data: ESAScreeningFormData) => {
    try {
      const supabase = createClient()

      // Generate guest identifier
      const guestIdentifier = crypto.randomUUID()

      // Process ESAS data with rule engine
      const esasResult = ESASRuleEngine.processESASScreening(data.questions)

      // Create screening record for guest
      const screeningData = {
        esas_data: {
          ...data,
          timestamp: new Date().toISOString(),
          user_role: 'guest',
          screening_mode: 'guest-self'
        },
        recommendation: esasResult.recommendation,
        screening_type: data.patient_info.screening_type,
        status: 'completed',
        highest_score: esasResult.highestScore,
        primary_question: esasResult.primaryQuestion,
        risk_level: esasResult.riskLevel,
        is_guest: true,
        guest_identifier: guestIdentifier,
        user_id: null,
        patient_id: null,
      }

      const { data: screening, error: screeningError } = await supabase
        .from('screenings')
        .insert(screeningData)
        .select()
        .single()

      if (screeningError) {
        throw new Error(`Gagal menyimpan screening: ${screeningError.message}`)
      }

      toast({
        title: "Berhasil",
        description: "Screening ESAS berhasil disimpan. ID Anda telah dibuat.",
      })

      // Redirect to guest results page with guest identifier
      router.push(`/screening/guest/${screening.id}/result?guest_id=${guestIdentifier}`)

      return {
        screeningId: screening.id,
        guestId: guestIdentifier
      }

    } catch (error) {
      // Guest form submit error
      throw error
    }
  }

  const handleCancel = () => {
    // Redirect based on user role and context
    if (isGuestMode) {
      router.push('/')
    } else if (userRole === 'pasien') {
      router.push('/pasien/dashboard')
    } else if (userRole === 'perawat' || userRole === 'admin') {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  // Render the appropriate form variant
  const renderForm = () => {
    switch (formVariant) {
      case 'pasien':
        return (
          <ESASPasienForm
            onSubmit={handlePasienSubmit}
            onCancel={handleCancel}
          />
        )

      case 'perawat':
        return (
          <ESASPerawatForm
            onSubmit={handlePerawatSubmit}
            onCancel={handleCancel}
          />
        )

      case 'guest':
      default:
        return (
          <ESASGuestForm
            onSubmit={handleGuestSubmit}
            onCancel={handleCancel}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {renderForm()}
    </div>
  )
}

// Helper function to determine form variant (exported for testing)
export function getFormVariant(isGuestMode: boolean, userRole: string | null, searchParams: URLSearchParams): string {
  // Guest mode takes precedence
  if (isGuestMode) {
    return 'guest'
  }

  // Check for explicit type parameter
  const type = searchParams.get('type')
  if (type === 'self' && userRole === 'pasien') {
    return 'pasien'
  }

  // Default based on user role
  if (userRole === 'pasien') {
    return 'pasien'
  } else if (userRole === 'perawat' || userRole === 'admin') {
    return 'perawat'
  }

  // Fallback to guest if no role detected
  return 'guest'
}