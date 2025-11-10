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

// ESAS Question validation schema sesuai PERTANYAAN_SKRINING_ESAS.md
export const esasQuestionsSchema = z.object({
  "1": z.number().min(0, 'Skor harus antara 0-10').max(10, 'Skor harus antara 0-10'),
  "2": z.number().min(0, 'Skor harus antara 0-10').max(10, 'Skor harus antara 0-10'),
  "3": z.number().min(0, 'Skor harus antara 0-10').max(10, 'Skor harus antara 0-10'),
  "4": z.number().min(0, 'Skor harus antara 0-10').max(10, 'Skor harus antara 0-10'),
  "5": z.number().min(0, 'Skor harus antara 0-10').max(10, 'Skor harus antara 0-10'),
  "6": z.number().min(0, 'Skor harus antara 0-10').max(10, 'Skor harus antara 0-10'),
  "7": z.number().min(0, 'Skor harus antara 0-10').max(10, 'Skor harus antara 0-10'),
  "8": z.number().min(0, 'Skor harus antara 0-10').max(10, 'Skor harus antara 0-10'),
  "9": z.number().min(0, 'Skor harus antara 0-10').max(10, 'Skor harus antara 0-10'),
}, {
  required_error: 'Semua pertanyaan ESAS harus diisi',
  invalid_type_error: 'Format skor tidak valid'
})

// ESAS Question data structure with text descriptions
export const esasQuestionsDataSchema = z.object({
  "1": z.object({
    score: z.number().min(0).max(10),
    text: z.literal('Nyeri'),
    description: z.enum(['ringan', 'sedang', 'berat']).optional()
  }),
  "2": z.object({
    score: z.number().min(0).max(10),
    text: z.literal('Lelah/Kekurangan Tenaga'),
    description: z.enum(['ringan', 'sedang', 'berat']).optional()
  }),
  "3": z.object({
    score: z.number().min(0).max(10),
    text: z.literal('Kantuk/Gangguan Tidur'),
    description: z.enum(['ringan', 'sedang', 'berat']).optional()
  }),
  "4": z.object({
    score: z.number().min(0).max(10),
    text: z.literal('Mual/Nausea'),
    description: z.enum(['ringan', 'sedang', 'berat']).optional()
  }),
  "5": z.object({
    score: z.number().min(0).max(10),
    text: z.literal('Nafsu Makan'),
    description: z.enum(['ringan', 'sedang', 'berat']).optional()
  }),
  "6": z.object({
    score: z.number().min(0).max(10),
    text: z.literal('Sesak/Pola Napas'),
    description: z.enum(['ringan', 'sedang', 'berat']).optional()
  }),
  "7": z.object({
    score: z.number().min(0).max(10),
    text: z.literal('Sedih/Keputusasaan'),
    description: z.enum(['ringan', 'sedang', 'berat']).optional()
  }),
  "8": z.object({
    score: z.number().min(0).max(10),
    text: z.literal('Cemas/Ansietas'),
    description: z.enum(['ringan', 'sedang', 'berat']).optional()
  }),
  "9": z.object({
    score: z.number().min(0).max(10),
    text: z.literal('Perasaan Keseluruhan'),
    description: z.enum(['ringan', 'sedang', 'berat']).optional()
  })
})

// Complete ESAS Screening form validation schema
export const esasScreeningFormSchema = z.object({
  patient_info: screeningPatientInfoSchema,
  questions: esasQuestionsSchema,
  esas_data: z.object({
    identity: z.object({
      name: z.string().min(1, 'Nama pasien harus diisi'),
      age: z.number().min(0, 'Usia tidak valid').max(150, 'Usia maksimal 150 tahun'),
      gender: z.enum(['L', 'P']),
      facility_name: z.string().optional()
    }),
    questions: esasQuestionsDataSchema
  }).optional()
})

// Legacy schema for backward compatibility
export const screeningQuestionnaireSchema = z.object({
  questions: esasQuestionsSchema,
  // Additional optional fields for flexibility
  symptoms: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

// Complete screening form schema (updated to use ESAS schema)
export const screeningFormSchema = esasScreeningFormSchema

// Export new types for ESAS
export type ESASQuestions = z.infer<typeof esasQuestionsSchema>
export type ESASQuestionsData = z.infer<typeof esasQuestionsDataSchema>
export type ESAScreeningFormData = z.infer<typeof esasScreeningFormSchema>

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
export type ScreeningFormData = z.infer<typeof screeningFormSchema>
export type ScreeningQuestionnaireFormData = z.infer<typeof screeningQuestionnaireSchema>
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