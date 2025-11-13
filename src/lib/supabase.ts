import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client-side Supabase client
export const createClient = () => {
  return createClientComponentClient()
}

// Server-side Supabase client - only use this in server components
export const createServerClient = async () => {
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
  const { cookies } = await import('next/headers')
  return createServerComponentClient({ cookies })
}

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const signOut = async () => {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export const getCurrentUser = async () => {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return user
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  const supabase = createClient()

  return supabase.auth.onAuthStateChange(callback)
}

// Profile functions
export const getProfile = async (userId: string) => {
  const supabase = createClient()

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const updateProfile = async (userId: string, updates: any) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Patient functions
export const getPatients = async (userId: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const createPatient = async (patientData: any) => {
  const supabase = createClient()

  const { data, error } = await supabase.from('patients').insert(patientData).select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Screening functions
export const getScreenings = async (userId: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('screenings')
    .select(
      `
      *,
      patients (
        name,
        age,
        gender
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const createScreening = async (screeningData: any) => {
  const supabase = createClient()

  const { data, error } = await supabase.from('screenings').insert(screeningData).select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const resetPassword = async (email: string) => {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export const updatePassword = async (newPassword: string) => {
  const supabase = createClient()

  try {
    // Update the password - Supabase will handle session validation automatically
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      // Handle specific error cases
      if (error.message.includes('Invalid session') || error.message.includes('expired')) {
        throw new Error('Link reset password telah kadaluarsa. Silakan minta link reset password baru.')
      }
      throw new Error(error.message)
    }
  } catch (err: any) {
    // Handle network or other errors
    if (err.message?.includes('session') || err.message?.includes('expired')) {
      throw new Error('Link reset password telah kadaluarsa. Silakan minta link reset password baru.')
    }
    throw err
  }
}

export const getScreeningById = async (screeningId: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('screenings')
    .select(
      `
      *,
      patients (
        name,
        age,
        gender,
        facility_name
      )
    `
    )
    .eq('id', screeningId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
