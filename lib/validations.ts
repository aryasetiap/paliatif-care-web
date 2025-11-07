import { z } from 'zod'

// Authentication validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email harus diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password harus diisi')
    .min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Nama lengkap harus diisi')
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    email: z
      .string()
      .min(1, 'Email harus diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'
      ),
    confirmPassword: z.string().min(1, 'Konfirmasi password harus diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

// Patient validation schemas
export const patientSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama pasien harus diisi')
    .min(3, 'Nama pasien minimal 3 karakter')
    .max(100, 'Nama pasien maksimal 100 karakter'),
  age: z
    .number()
    .min(0, 'Usia tidak valid')
    .max(150, 'Usia maksimal 150 tahun')
    .positive('Usia harus angka positif'),
  gender: z.enum(['L', 'P'], {
    required_error: 'Jenis kelamin harus dipilih',
  }),
  facility_name: z
    .string()
    .max(100, 'Nama fasilitas maksimal 100 karakter')
    .optional()
    .or(z.literal('')),
})

// Screening form validation schemas
export const screeningPatientInfoSchema = z.object({
  patient_name: z
    .string()
    .min(1, 'Nama pasien harus diisi')
    .min(3, 'Nama pasien minimal 3 karakter')
    .max(100, 'Nama pasien maksimal 100 karakter'),
  patient_age: z
    .number()
    .min(0, 'Usia tidak valid')
    .max(150, 'Usia maksimal 150 tahun')
    .positive('Usia harus angka positif'),
  patient_gender: z.enum(['L', 'P'], {
    required_error: 'Jenis kelamin harus dipilih',
  }),
  facility_name: z
    .string()
    .max(100, 'Nama fasilitas maksimal 100 karakter')
    .optional()
    .or(z.literal('')),
  screening_type: z.enum(['initial', 'follow_up'], {
    required_error: 'Tipe screening harus dipilih',
  }),
})

// Screening questionnaire schema (placeholder for client questions)
export const screeningQuestionnaireSchema = z.object({
  // This will be updated when client provides the actual screening questions
  // For now, we'll create a flexible structure that can accommodate various question types
  questions: z.record(z.any()),
  symptoms: z.array(z.string()).optional(),
  pain_level: z.number().min(0).max(10).optional(),
  mobility: z.string().optional(),
  appetite: z.string().optional(),
  sleep: z.string().optional(),
  emotional_state: z.string().optional(),
  social_support: z.string().optional(),
  // Add more fields as needed when client provides actual questions
})

// Complete screening form schema
export const screeningFormSchema = z.object({
  patient_info: screeningPatientInfoSchema,
  questionnaire: screeningQuestionnaireSchema,
})

// Profile update schema
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Nama lengkap harus diisi')
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
})

// Search and filter schemas
export const patientSearchSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Export type inference
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type PatientFormData = z.infer<typeof patientSchema>
export type ScreeningPatientInfoFormData = z.infer<typeof screeningPatientInfoSchema>
export type ScreeningQuestionnaireFormData = z.infer<typeof screeningQuestionnaireSchema>
export type ScreeningFormData = z.infer<typeof screeningFormSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type PatientSearchFormData = z.infer<typeof patientSearchSchema>

// Validation error helper
export const getValidationErrors = (error: any): Record<string, string> => {
  if (error instanceof z.ZodError) {
    const errors: Record<string, string> = {}
    error.errors.forEach((err) => {
      const field = err.path.join('.')
      errors[field] = err.message
    })
    return errors
  }
  return { general: 'Terjadi kesalahan validasi' }
}

// Form field options
export const GENDER_OPTIONS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
] as const

export const SCREENING_TYPE_OPTIONS = [
  { value: 'initial', label: 'Screening Awal' },
  { value: 'follow_up', label: 'Screening Follow-up' },
] as const

export const RISK_LEVEL_OPTIONS = [
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
] as const

export const SORT_BY_OPTIONS = [
  { value: 'name', label: 'Nama' },
  { value: 'created_at', label: 'Tanggal Dibuat' },
  { value: 'updated_at', label: 'Tanggal Diupdate' },
] as const

export const SORT_ORDER_OPTIONS = [
  { value: 'asc', label: 'A-Z' },
  { value: 'desc', label: 'Z-A' },
] as const