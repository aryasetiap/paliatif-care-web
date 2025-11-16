// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'perawat' | 'pasien'
          created_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          role?: 'admin' | 'perawat' | 'pasien'
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'admin' | 'perawat' | 'pasien'
          created_at?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          user_id: string
          name: string
          age: number
          gender: string
          facility_name: string | null
          created_at: string | null
          updated_at: string | null
          phone: string | null
          address: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          medical_history: string | null
          allergies: string | null
          current_medications: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          age: number
          gender: string
          facility_name?: string | null
          created_at?: string | null
          updated_at?: string | null
          phone?: string | null
          address?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          medical_history?: string | null
          allergies?: string | null
          current_medications?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          age?: number
          gender?: string
          facility_name?: string | null
          created_at?: string | null
          updated_at?: string | null
          phone?: string | null
          address?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          medical_history?: string | null
          allergies?: string | null
          current_medications?: string | null
        }
        Relationships: []
      }
      screenings: {
        Row: {
          id: string
          user_id: string | null
          patient_id: string | null
          screening_type: string
          status: string
          esas_data: Record<string, any>
          recommendation: Record<string, any>
          created_at: string | null
          updated_at: string | null
          highest_score: number
          primary_question: number
          risk_level: string
          guest_identifier: string | null
          is_guest: boolean | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          patient_id?: string | null
          screening_type?: string
          status?: string
          esas_data: Record<string, any>
          recommendation: Record<string, any>
          created_at?: string | null
          updated_at?: string | null
          highest_score?: number
          primary_question?: number
          risk_level?: string
          guest_identifier?: string | null
          is_guest?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string | null
          patient_id?: string | null
          screening_type?: string
          status?: string
          esas_data?: Record<string, any>
          recommendation?: Record<string, any>
          created_at?: string | null
          updated_at?: string | null
          highest_score?: number
          primary_question?: number
          risk_level?: string
          guest_identifier?: string | null
          is_guest?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "screenings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      screenings_with_user_info: {
        Row: {
          id: string | null
          user_id: string | null
          patient_id: string | null
          screening_type: string | null
          status: string | null
          esas_data: Record<string, any> | null
          recommendation: Record<string, any> | null
          created_at: string | null
          updated_at: string | null
          highest_score: number | null
          primary_question: number | null
          risk_level: string | null
          guest_identifier: string | null
          is_guest: boolean | null
          full_name: string | null
          user_role: 'admin' | 'perawat' | 'pasien' | null
          role_display: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screenings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Enums: {
      user_role: "admin" | "perawat" | "pasien"
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

export interface Patient {
  id: string
  user_id: string
  name: string
  age: number
  gender: string
  facility_name: string | null
  created_at: string | null
  updated_at: string | null
  phone: string | null
  address: string | null
  emergency_contact: string | null
  emergency_phone: string | null
  medical_history: string | null
  allergies: string | null
  current_medications: string | null
  screenings?: Screening[]
}

export interface Screening {
  id: string
  user_id: string | null
  patient_id: string | null
  screening_type: string
  status: string
  esas_data: Record<string, any>
  recommendation: Record<string, any>
  created_at: string | null
  updated_at: string | null
  highest_score: number
  primary_question: number
  risk_level: string
  guest_identifier: string | null
  is_guest: boolean | null
  patients?: {
    name: string
    age: number
    gender: string
    facility_name: string | null
  }
  user?: {
    full_name: string
    role: 'admin' | 'perawat' | 'pasien'
  }
}

export interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'perawat' | 'pasien'
  created_at: string | null
}

// Role types
export type UserRole = 'admin' | 'perawat' | 'pasien'

export interface UserWithRole extends User {
  profile?: Profile
}

// Role-based permissions
export interface RolePermissions {
  canViewAllPatients: boolean
  canManageUsers: boolean
  canAccessAdminDashboard: boolean
  canScreenSelf: boolean
  canViewOwnData: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewAllPatients: true,
    canManageUsers: true,
    canAccessAdminDashboard: true,
    canScreenSelf: false,
    canViewOwnData: true
  },
  perawat: {
    canViewAllPatients: false,
    canManageUsers: false,
    canAccessAdminDashboard: false,
    canScreenSelf: false,
    canViewOwnData: true
  },
  pasien: {
    canViewAllPatients: false,
    canManageUsers: false,
    canAccessAdminDashboard: false,
    canScreenSelf: true,
    canViewOwnData: true
  }
}

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
  gender: string
  facility_name?: string
  phone?: string
  address?: string
  emergency_contact?: string
  emergency_phone?: string
  medical_history?: string
  allergies?: string
  current_medications?: string
}

export interface ScreeningFormData {
  patient_id?: string
  patient_name?: string
  patient_age: number
  patient_gender: string
  facility_name?: string
  screening_type: 'initial' | 'follow_up'
  esas_data: Record<string, any>
  guest_identifier?: string
  is_guest?: boolean
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
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  interventions: string[]
  recommendations: string[]
  primary_question?: number
  therapy_type?: string
  frequency?: string
  action_required?: string
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
  gender: string
  lastScreening: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  is_guest?: boolean
  user_role?: 'admin' | 'perawat' | 'pasien'
}

// Chart data types
export interface RiskDistribution {
  low: number
  medium: number
  high: number
  critical: number
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
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  screening_type?: string
  is_guest?: boolean
  user_role?: 'admin' | 'perawat' | 'pasien'
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