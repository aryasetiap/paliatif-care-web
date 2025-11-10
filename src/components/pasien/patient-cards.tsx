'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  User,
  Calendar,
  Activity,
  AlertTriangle,
  Eye,
  ChevronRight,
  Clock,
  MapPin
} from 'lucide-react'
import { type Patient } from '@/lib/patient-management-index'
import Link from 'next/link'

interface PatientCardProps {
  patient: Patient & {
    last_screening?: {
      risk_level: string
      highest_score: number
      created_at: string
    }
    screening_count?: number
  }
  compact?: boolean
}

export function PatientCard({ patient, compact = false }: PatientCardProps) {
  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskLevelText = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'Kritis'
      case 'high':
        return 'Tinggi'
      case 'medium':
        return 'Sedang'
      case 'low':
        return 'Rendah'
      default:
        return 'Belum Ada'
    }
  }

  const getDaysSinceLastScreening = (date?: string) => {
    if (!date) return null
    const days = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  const daysSinceLastScreening = getDaysSinceLastScreening(patient.last_screening?.created_at)

  return (
    <Card className="bg-white/90 backdrop-blur-md border border-sky-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {patient.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sky-900 text-lg leading-tight truncate group-hover:text-blue-700 transition-colors">
                {patient.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-sky-600 mt-1">
                <span>{patient.age} tahun</span>
                <span>•</span>
                <span>{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              {patient.facility_name && (
                <div className="flex items-center gap-1 text-xs text-sky-500 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{patient.facility_name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {patient.last_screening && (
              <Badge className={getRiskLevelColor(patient.last_screening.risk_level)}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {getRiskLevelText(patient.last_screening.risk_level)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {!compact && (
          <div className="space-y-3">
            {/* Screening Status */}
            {patient.last_screening ? (
              <div className="flex items-center justify-between p-3 bg-sky-50/50 rounded-lg border border-sky-200">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-sky-900">
                      Skor: {patient.last_screening.highest_score}/10
                    </p>
                    <div className="flex items-center gap-1 text-xs text-sky-600">
                      <Clock className="h-3 w-3" />
                      <span>
                        {daysSinceLastScreening !== null && (
                          <>
                            {daysSinceLastScreening === 0 ? 'Hari ini' :
                             daysSinceLastScreening === 1 ? 'Kemarin' :
                             `${daysSinceLastScreening} hari lalu`}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {daysSinceLastScreening !== null && daysSinceLastScreening > 14 && (
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                    Perlu Follow-up
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 text-gray-500">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Belum ada screening</span>
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600">Total Screening</p>
                <p className="text-lg font-semibold text-blue-900">
                  {patient.screening_count || 0}
                </p>
              </div>
              <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600">Terdaftar</p>
                <p className="text-lg font-semibold text-purple-900">
                  {new Date(patient.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 border-sky-300 text-sky-700 hover:bg-sky-50" asChild>
            <Link href={`/pasien/${patient.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              Detail
            </Link>
          </Button>
          <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white" asChild>
            <Link href={`/screening/new?patient=${patient.id}`}>
              <Activity className="h-4 w-4 mr-1" />
              Screening
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface PatientCardListProps {
  patients: Array<Patient & {
    last_screening?: {
      risk_level: string
      highest_score: number
      created_at: string
    }
    screening_count?: number
  }>
  loading?: boolean
  compact?: boolean
}

export function PatientCardList({ patients, loading, compact = false }: PatientCardListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="bg-white/90 border border-sky-200 animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 mx-auto mb-4 text-sky-300" />
        <h3 className="text-xl font-semibold text-sky-900 mb-2">Belum Ada Data Pasien</h3>
        <p className="text-sky-600 mb-6">
          Mulai dengan melakukan screening untuk pasien pertama
        </p>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white" asChild>
          <Link href="/screening/new">
            <Activity className="mr-2 h-4 w-4" />
            Screening Pertama
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          compact={compact}
        />
      ))}
    </div>
  )
}

export function PatientCardCompact({ patient }: { patient: Patient & {
  last_screening?: {
    risk_level: string
    highest_score: number
    created_at: string
  }
  screening_count?: number
}}) {
  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskLevelText = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'Kritis'
      case 'high':
        return 'Tinggi'
      case 'medium':
        return 'Sedang'
      case 'low':
        return 'Rendah'
      default:
        return 'Belum Ada'
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-md border border-sky-200 hover:shadow-md transition-all duration-300 hover:border-blue-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {patient.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2)}
            </div>
            <div>
              <h4 className="font-medium text-sky-900 text-sm truncate max-w-[120px]">
                {patient.name}
              </h4>
              <p className="text-xs text-sky-600">
                {patient.age} tahun • {patient.gender === 'L' ? 'L' : 'P'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {patient.last_screening && (
              <Badge className={`text-xs ${getRiskLevelColor(patient.last_screening.risk_level)}`}>
                {getRiskLevelText(patient.last_screening.risk_level)}
              </Badge>
            )}
            <Button size="sm" variant="ghost" className="p-1" asChild>
              <Link href={`/pasien/${patient.id}`}>
                <ChevronRight className="h-4 w-4 text-sky-600" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}