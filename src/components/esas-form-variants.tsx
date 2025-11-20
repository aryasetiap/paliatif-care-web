'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/stores/authStore'
import '@/styles/modern-patterns.css'

interface ESAScreeningFormData {
  patient_info: {
    patient_name: string
    patient_age: number
    patient_gender: string
    contact_info?: string
    facility_name?: string
    screening_type?: string
  }
  questions: {
    [key: string]: number
  }
}

// ESAS Questions (dipindahkan dari file utama untuk organisasi yang lebih baik)
const ESAS_QUESTIONS = [
  {
    number: '1',
    text: 'Seberapa besar keluhan nyeri yang Anda alami saat ini?',
    descriptions: {
      '0': 'Tidak ada nyeri',
      '1-3': 'Nyeri ringan - Pasien masih dapat beraktivitas normal tanpa hambatan',
      '4-6': 'Nyeri sedang - Nyeri mulai terasa mengganggu aktivitas sehari-hari',
      '7-10': 'Nyeri berat - Nyeri terasa hebat, pasien tampak kesakitan',
    },
  },
  {
    number: '2',
    text: 'Seberapa besar keluhan lelah atau kekurangan tenaga yang Anda alami saat ini?',
    descriptions: {
      '0': 'Tidak Lelah',
      '1-3': 'Lelah ringan - Pasien merasa segar, masih mampu melakukan aktivitas normal',
      '4-6': 'Lelah sedang - Pasien mulai cepat lelah, membutuhkan waktu istirahat lebih sering',
      '7-10': 'Lelah berat - Pasien tampak sangat lemah, sulit melakukan aktivitas ringan',
    },
  },
  {
    number: '3',
    text: 'Apakah Anda saat ini mengalami rasa kantuk atau sulit menahan kantuk?',
    descriptions: {
      '0': 'Tidak mengantuk',
      '1-3': 'Mengantuk ringan - Pasien terjaga penuh, pola tidur normal',
      '4-6': 'Mengantuk sedang - Pasien mudah mengantuk di siang hari, sulit fokus',
      '7-10': 'Mengantuk berat - Pasien sering tertidur, sulit terjaga',
    },
  },
  {
    number: '4',
    text: 'Seberapa besar mual atau rasa ingin muntah yang Anda alami saat ini?',
    descriptions: {
      '0': 'Tidak mual',
      '1-3': 'Mual ringan - Tidak ada keluhan mual, atau hanya terasa sesekali',
      '4-6': 'Mual sedang - Rasa mual mulai mengganggu nafsu makan',
      '7-10': 'Mual berat - Mual terus-menerus atau disertai muntah berat',
    },
  },
  {
    number: '5',
    text: 'Seberapa berkurang nafsu makan yang Anda alami saat ini?',
    descriptions: {
      '0': 'Nafsu makan normal',
      '1-3': 'Nafsu makan normal / sedikit berkurang - Masih mampu makan dengan baik',
      '4-6': 'Nafsu makan menurun sedang - Mulai sulit makan, porsi berkurang dari biasanya',
      '7-10': 'Nafsu makan sangat menurun - Tidak ada keinginan makan, menolak asupan',
    },
  },
  {
    number: '6',
    text: 'Apakah Anda saat ini mengalami sesak saat bernapas?',
    descriptions: {
      '0': 'Tidak sesak',
      '1-3': 'Tidak sesak / Sesak ringan - Bernapas dengan normal',
      '4-6': 'Sesak sedang - Mulai sesak saat berbicara atau berjalan',
      '7-10': 'Sesak berat - Sesak bahkan saat istirahat, perlu intervensi segera',
    },
  },
  {
    number: '7',
    text: 'Seberapa sedih, murung atau kehilangan semangat Anda saat ini?',
    descriptions: {
      '0': 'Tidak sedih',
      '1-3': 'Sedih ringan - Pasien merasa tenang dan tetap bersemangat',
      '4-6': 'Sedih sedang - Mulai kehilangan minat atau semangat, sering merasa murung',
      '7-10': 'Sedih berat - Pasien tampak sangat sedih, putus asa, perlu dukungan psikologis',
    },
  },
  {
    number: '8',
    text: 'Seberapa besar Anda mengalami cemas atau khawatir saat ini?',
    descriptions: {
      '0': 'Tidak cemas',
      '1-3': 'Cemas ringan - Perasaan tenang dan stabil, mampu mengendalikan kekhawatiran',
      '4-6': 'Cemas sedang - Sering merasa gelisah atau sulit tidur karena kekhawatiran',
      '7-10': 'Cemas berat - Pasien sangat gelisah, panik, butuh penanganan segera',
    },
  },
  {
    number: '9',
    text: 'Secara keseluruhan, bagaimana perasaan Anda saat ini?',
    descriptions: {
      '0': 'Merasa sangat baik - Pasien merasa sehat dan bugar',
      '1-3': 'Merasa sangat baik / ringan - Pasien merasa tenang, nyaman, dan positif',
      '4-6': 'Perasaan sedang / tidak nyaman - Pasien merasa kurang bersemangat, cepat lelah',
      '7-10':
        'Perasaan buruk / sangat tidak nyaman - Pasien merasa sangat buruk, kehilangan kendali',
    },
  },
]

interface ESASQuestionComponentProps {
  question: (typeof ESAS_QUESTIONS)[0]
  value: number
  onChange: (value: number) => void
  error?: string
  disabled?: boolean
}

function ESASQuestionComponent({
  question,
  value,
  onChange,
  error,
  disabled = false,
}: ESASQuestionComponentProps) {
  const getScoreColor = (score: number) => {
    if (score === 0) return 'bg-gray-100 border-gray-300'
    if (score >= 1 && score <= 3) return 'bg-green-100 border-green-300'
    if (score >= 4 && score <= 6) return 'bg-yellow-100 border-yellow-300'
    if (score >= 7 && score <= 10) return 'bg-red-100 border-red-300'
    return 'bg-gray-100 border-gray-300'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score === 0) return 'bg-gray-500'
    if (score >= 1 && score <= 3) return 'bg-green-500'
    if (score >= 4 && score <= 6) return 'bg-yellow-500'
    if (score >= 7 && score <= 10) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const getScoreLevel = (score: number) => {
    if (score === 0) return 'Tidak ada keluhan'
    if (score >= 1 && score <= 3) return 'Ringan'
    if (score >= 4 && score <= 6) return 'Sedang'
    if (score >= 7 && score <= 10) return 'Berat'
    return 'Tidak valid'
  }

  const getDescriptionForScore = (score: number) => {
    if (score === 0) return question.descriptions['0']
    if (score >= 1 && score <= 3) return question.descriptions['1-3']
    if (score >= 4 && score <= 6) return question.descriptions['4-6']
    if (score >= 7 && score <= 10) return question.descriptions['7-10']
    return ''
  }

  return (
    <Card
      className={`${getScoreColor(value)} transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-md border-sky-200 ${disabled ? 'opacity-75' : ''}`}
    >
      <CardHeader>
        <CardTitle className="text-lg text-sky-900">
          <span className="font-bold text-sky-600">{question.number}.</span> {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Selection */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Skor:</span>
          <div className="flex items-center gap-2">
            <Badge className={`${getScoreBadgeColor(value)} text-white`}>
              {value} - {getScoreLevel(value)}
            </Badge>
          </div>
        </div>

        {/* Score Buttons */}
        <div className="grid grid-cols-11 gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <Button
              key={score}
              type="button"
              variant={value === score ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(score)}
              disabled={disabled}
              className={`h-8 w-8 text-xs p-0 ${value === score ? 'ring-2 ring-sky-400' : ''}`}
            >
              {score}
            </Button>
          ))}
        </div>

        {/* Description */}
        <div className="text-sm text-gray-600 bg-white/60 rounded-md p-3 border border-gray-200">
          <strong>Deskripsi: </strong>
          {getDescriptionForScore(value)}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 rounded-md p-2 border border-red-200">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Form Variants untuk berbagai user roles
interface ESASFormVariantProps {
  userRole: 'admin' | 'perawat' | 'pasien' | null
  isGuestMode?: boolean
  onSubmit?: (data: ESAScreeningFormData) => Promise<void>
  onCancel?: () => void
}

// 1. Pasien Self-Screening Form
function ESASPasienForm({ userRole: _userRole, onSubmit, onCancel }: ESASFormVariantProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { profile } = useAuthStore()

  const form = useForm<ESAScreeningFormData>({
    defaultValues: {
      patient_info: {
        patient_name: profile?.full_name || '',
        patient_age: 0, // Will be calculated or entered
        patient_gender: 'L', // Default
        facility_name: '',
        screening_type: 'initial',
        contact_info: '',
      },
      questions: {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,
        '8': 0,
        '9': 0,
      },
    },
    mode: 'onChange',
  })

  const handleQuestionChange = (questionNumber: string, value: number) => {
    form.setValue(`questions.${questionNumber}` as any, value, { shouldValidate: true })
  }

  const handleSubmit = async (data: ESAScreeningFormData) => {
    if (!onSubmit) return

    try {
      setIsSubmitting(true)

      // Pre-fill patient data for self-screening
      const enhancedData = {
        ...data,
        patient_info: {
          ...data.patient_info,
          patient_name: profile?.full_name || data.patient_info.patient_name,
        },
      }

      await onSubmit(enhancedData)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyimpan screening',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 pt-16"
    >
      {/* Header untuk Pasien */}
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-4 py-2 mb-4"
        >
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-blue-700 font-medium">Mode Self-Screening Pasien</span>
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          ESAS Screening
        </h1>
        <p className="text-gray-600">
          Evaluasi gejala Anda secara mandiri. Hasil akan tersimpan dalam rekam medis Anda.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Patient Info Section */}
          <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Informasi Pasien</CardTitle>
              <CardDescription>
                Data diri Anda untuk keperluan screening dan rekam medis
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient_info.patient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-700">Nama Lengkap *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama lengkap Anda"
                        defaultValue={profile?.full_name || ''}
                        {...field}
                        className="bg-white/90 border-sky-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patient_info.patient_age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-700">Usia *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan usia Anda"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-white/90 border-sky-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patient_info.patient_gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-700">Jenis Kelamin *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/90 border-sky-300">
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="patient_info.facility_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-700">Fasilitas Kesehatan (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama rumah sakit atau klinik"
                        {...field}
                        className="bg-white/90 border-sky-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              {/* <FormField
                control={form.control}
                name="patient_info.screening_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-700">Tipe Screening *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/90 border-sky-300">
                          <SelectValue placeholder="Pilih tipe screening" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="initial">Screening Awal</SelectItem>
                        <SelectItem value="follow_up">Screening Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </CardContent>
          </Card>

          {/* ESAS Questions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-sky-900 mb-4">Pertanyaan ESAS</h2>
            <div className="grid gap-6">
              {ESAS_QUESTIONS.map((question) => (
                <ESASQuestionComponent
                  key={question.number}
                  question={question}
                  value={form.watch(`questions.${question.number}` as any) || 0}
                  onChange={(value) => handleQuestionChange(question.number, value)}
                  error={form.formState.errors.questions?.[question.number]?.message}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-8"
              >
                Batal
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan Screening'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}

export { ESASPasienForm, ESASQuestionComponent, ESAS_QUESTIONS }
