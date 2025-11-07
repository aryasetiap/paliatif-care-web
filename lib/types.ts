// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          name: string
          age: number
          gender: 'L' | 'P'
          facility_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          age: number
          gender: 'L' | 'P'
          facility_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          age?: number
          gender?: 'L' | 'P'
          facility_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      screenings: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          screening_type: string
          status: string
          screening_data: Record<string, any>
          recommendation: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          patient_id: string
          screening_type?: string
          status?: string
          screening_data: Record<string, any>
          recommendation: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          screening_type?: string
          status?: string
          screening_data?: Record<string, any>
          recommendation?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// App specific types
export interface User {
  id: string
  email?: string
  full_name?: string
  user_metadata?: Record<string, any>
}

export interface Patient extends Database['public']['Tables']['patients']['Row'] {
  screenings?: Screening[]
}

export interface Screening extends Database['public']['Tables']['screenings']['Row'] {
  patients?: {
    name: string
    age: number
    gender: 'L' | 'P'
    facility_name: string | null
  }
}

export interface Profile extends Database['public']['Tables']['profiles']['Row'] {}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

export interface PatientFormData {
  name: string
  age: number
  gender: 'L' | 'P'
  facility_name?: string
}

export interface ScreeningFormData {
  patient_id?: string
  patient_name?: string
  patient_age: number
  patient_gender: 'L' | 'P'
  facility_name?: string
  screening_type: 'initial' | 'follow_up'
  screening_data: Record<string, any>
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ScreeningResult {
  score: number
  riskLevel: 'low' | 'medium' | 'high'
  summary: string
  interventions: string[]
  recommendations: string[]
}

// Dashboard types
export interface DashboardStats {
  totalPatients: number
  totalScreenings: number
  monthlyScreenings: number
  averageRiskScore: number
}

export interface RecentPatient {
  id: string
  name: string
  age: number
  gender: 'L' | 'P'
  lastScreening: string
  riskLevel: 'low' | 'medium' | 'high'
}

// Chart data types
export interface RiskDistribution {
  low: number
  medium: number
  high: number
}

export interface MonthlyScreeningData {
  month: string
  count: number
}

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: string
  description?: string
}

// Search and filter types
export interface PatientFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
  riskLevel?: 'low' | 'medium' | 'high'
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}