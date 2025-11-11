'use client'

import React, { forwardRef } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// Types - using the actual screening data structure
interface ScreeningData {
  id: string
  esas_data: {
    identity: {
      name: string
      age: number
      gender: string
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
  recommendation: {
    diagnosis: string
    intervention_steps: string[]
    references: string[]
    action_required: string
    priority: number
    therapy_type: string
    frequency: string
  }
  highest_score: number
  primary_question: number
  risk_level: string
  created_at: string
  updated_at: string
}

// Component for displaying ESAS questions and scores
interface ESASScoreCardProps {
  questionNumber: number
  questionText: string
  score: number
  isPrimary: boolean
}

const ESASScoreCard: React.FC<ESASScoreCardProps> = ({
  questionNumber,
  questionText,
  score,
  isPrimary
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 7) return 'bg-red-100 text-red-800 border-red-300'
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (score >= 1) return 'bg-green-100 text-green-800 border-green-300'
    return 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getScoreLevel = (score: number): string => {
    if (score === 0) return 'Tidak ada keluhan'
    if (score <= 3) return 'Ringan'
    if (score <= 6) return 'Sedang'
    return 'Berat'
  }

  return (
    <div className={`p-4 border-2 rounded-lg ${isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-800">
          {questionNumber}. {questionText}
        </h4>
        {isPrimary && (
          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
            Prioritas Utama
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full border-2 font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <span className="text-sm text-gray-600">
            ({getScoreLevel(score)})
          </span>
        </div>
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${score >= 7 ? 'bg-red-500' : score >= 4 ? 'bg-yellow-500' : score >= 1 ? 'bg-green-500' : 'bg-gray-400'}`}
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Main printable component
interface ESASReportToPrintProps {
  screeningData: ScreeningData
  isPrintMode?: boolean
}

const ESASReportToPrint = forwardRef<HTMLDivElement, ESASReportToPrintProps>(
  ({ screeningData, isPrintMode = false }, ref) => {
    const formatDate = (dateString: string): string => {
      try {
        return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id })
      } catch {
        return dateString
      }
    }

    const getRiskLevelColor = (level: string): string => {
      switch (level) {
        case 'high': return 'text-red-700 bg-red-100'
        case 'medium': return 'text-orange-700 bg-orange-100'
        case 'low': return 'text-green-700 bg-green-100'
        default: return 'text-gray-700 bg-gray-100'
      }
    }

    const getRiskLevelText = (level: string): string => {
      switch (level) {
        case 'high': return 'Tinggi'
        case 'medium': return 'Sedang'
        case 'low': return 'Rendah'
        default: return 'Tidak Diketahui'
      }
    }

    const esasQuestions = [
      { number: 1, text: "Nyeri" },
      { number: 2, text: "Lelah/Kekurangan Tenaga" },
      { number: 3, text: "Kantuk/Gangguan Tidur" },
      { number: 4, text: "Mual/Nausea" },
      { number: 5, text: "Nafsu Makan" },
      { number: 6, text: "Sesak/Pola Napas" },
      { number: 7, text: "Sedih/Keputusasaan" },
      { number: 8, text: "Cemas/Ansietas" },
      { number: 9, text: "Perasaan Keseluruhan" }
    ]

    return (
      <div
        ref={ref}
        className={`bg-white min-h-screen ${isPrintMode ? '' : 'p-8'}`}
        style={isPrintMode ? { padding: '20px' } : {}}
      >
        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              LAPORAN HASIL SKRINING ESAS
            </h1>
            <p className="text-lg text-gray-600">
              Edmonton Symptom Assessment System
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Sistem Penilaian Gejala Edmonton
            </p>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Informasi Pasien
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama Lengkap</p>
              <p className="font-semibold">: {screeningData.esas_data.identity.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Usia</p>
              <p className="font-semibold">: {screeningData.esas_data.identity.age} tahun</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Jenis Kelamin</p>
              <p className="font-semibold">: {screeningData.esas_data.identity.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fasilitas</p>
              <p className="font-semibold">: {screeningData.esas_data.identity.facility_name || '-'}</p>
            </div>
          </div>
        </div>

        {/* Screening Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Informasi Skrining
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tanggal Skrining</p>
              <p className="font-semibold">: {formatDate(screeningData.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipe Skrining</p>
              <p className="font-semibold">: Screening Awal</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID Skrining</p>
              <p className="font-semibold">: {screeningData.id}</p>
            </div>
          </div>
        </div>

        {/* ESAS Scores */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Hasil Penilaian ESAS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {esasQuestions.map((question) => (
              <ESASScoreCard
                key={question.number}
                questionNumber={question.number}
                questionText={question.text}
                score={screeningData.esas_data.questions[question.number.toString()]?.score || 0}
                isPrimary={question.number === screeningData.primary_question}
              />
            ))}
          </div>
        </div>

        {/* Summary Analysis */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Analisis Hasil
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Skor Tertinggi</p>
                <p className="text-3xl font-bold text-red-600">{screeningData.highest_score}</p>
                <p className="text-sm text-gray-500 mt-1">dari 10</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Tingkat Risiko</p>
                <span className={`inline-block px-4 py-2 rounded-full font-semibold ${getRiskLevelColor(screeningData.risk_level)}`}>
                  {getRiskLevelText(screeningData.risk_level)}
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Prioritas</p>
                <p className="text-3xl font-bold text-blue-600">{screeningData.recommendation.priority}</p>
                <p className="text-sm text-gray-500 mt-1">dari 9</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis and Intervention */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Diagnosa dan Rencana Intervensi
          </h2>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Diagnosa Utama</h3>
              <p className="text-gray-700">{screeningData.recommendation.diagnosis}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Terapi yang Direkomendasikan</h3>
              <p className="text-gray-700 font-medium">{screeningData.recommendation.therapy_type}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Tindakan yang Diperlukan</h3>
              <p className="text-gray-700 bg-yellow-100 p-3 rounded border border-yellow-300">
                {screeningData.recommendation.action_required}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Langkah-Langkah Intervensi</h3>
              <ol className="list-decimal list-inside space-y-2">
                {screeningData.recommendation.intervention_steps.map((step, index) => (
                  <li key={index} className="text-gray-700">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Scientific References */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Referensi Ilmiah
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            {screeningData.recommendation.references.length > 0 ? (
              <ol className="list-decimal list-inside space-y-3">
                {screeningData.recommendation.references.map((reference, index) => (
                  <li key={index} className="text-gray-700 text-sm">
                    {reference}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500 italic">Tidak ada referensi spesifik yang dicantumkan</p>
            )}
          </div>
        </div>

        {/* Healthcare Provider and Signature */}
        <div className="mt-12 pt-8 border-t-2 border-gray-300">
          <div className="flex justify-between items-end">
            <div className="text-left">
              <p className="text-sm text-gray-600 mb-8">Diperiksa oleh:</p>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="font-semibold">Healthcare Provider</p>
                <p className="text-sm text-gray-600">Perawat</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Laporan ini dicetak secara otomatis</p>
              <p className="text-xs text-gray-400">
                {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-500">
            Sistem Skrining Gejala ESAS - Paliatif Care Management System
          </p>
          <p className="text-xs text-gray-400">
            Laporan ini bersifat rahasia dan hanya untuk keperluan medis
          </p>
        </div>
      </div>
    )
  }
)

ESASReportToPrint.displayName = 'ESASReportToPrint'

export default ESASReportToPrint