'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

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

import { esasScreeningFormSchema, type ESAScreeningFormData } from '@/lib/validations'
import { ESASRuleEngine } from '@/lib/esas-rule-engine'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import '@/styles/modern-patterns.css'

// ESAS Questions dengan deskripsi lengkap sesuai PERTANYAAN_SKRINING_ESAS.md
const ESAS_QUESTIONS = [
  {
    number: '1',
    text: 'Seberapa besar keluhan nyeri yang Anda alami saat ini?',
    descriptions: {
      '0': 'Tidak ada nyeri',
      '1-3':
        'Nyeri ringan - Pasien masih dapat beraktivitas normal tanpa hambatan. Tidak membutuhkan tindakan khusus, hanya observasi rutin',
      '4-6':
        'Nyeri sedang -  Nyeri mulai terasa mengganggu aktivitas sehari-hari seperti berjalan, tidur, atau makan. Pasien mungkin membutuhkan obat nyeri ringan–sedang dan dukungan nonfarmakologis (relaksasi, kompres hangat/dingin)',
      '7-10':
        'Nyeri berat - Nyeri terasa hebat, pasien tampak kesakitan, sulit tidur atau beraktivitas, bahkan saat istirahat. Diperlukan tindakan segera, evaluasi obat analgesik kuat, dan pemantauan ketat',
    },
  },
  {
    number: '2',
    text: 'Seberapa besar keluhan lelah atau kekurangan tenaga yang Anda alami saat ini? (Kelelahan/keletihan, intoleransi aktivitas)',
    descriptions: {
      '0': 'Tidak Lelah',
      '1-3':
        'Lelah ringan - Pasien merasa segar, masih mampu melakukan aktivitas normal tanpa hambatan berarti',
      '4-6':
        'Lelah sedang - Pasien mulai cepat lelah, membutuhkan waktu istirahat lebih sering, dan aktivitas berkurang',
      '7-10':
        'Lelah berat - Pasien tampak sangat lemah, sulit melakukan aktivitas ringan, lebih banyak berbaring di tempat tidur',
    },
  },
  {
    number: '3',
    text: 'Apakah Anda saat ini mengalami rasa kantuk atau sulit menahan kantuk? (Gangguan pola tidur)',
    descriptions: {
      '0': 'Tidak mengantuk',
      '1-3':
        'Mengantuk ringan - Pasien terjaga penuh, pola tidur normal, tidak merasa mengantuk di siang hari',
      '4-6':
        'Mengantuk sedang - Pasien mudah mengantuk di siang hari, sulit fokus atau mempertahankan aktivitas lama',
      '7-10':
        'Mengantuk berat - Pasien sering tertidur, sulit terjaga, tidur hampir sepanjang waktu',
    },
  },
  {
    number: '4',
    text: 'Seberapa besar mual atau rasa ingin muntah yang Anda alami saat ini? (Nausea)',
    descriptions: {
      '0': 'Tidak mual',
      '1-3':
        'Mual ringan - Tidak ada keluhan mual, atau hanya terasa sesekali tanpa mengganggu makan/minum',
      '4-6':
        'Mual sedang - Rasa mual mulai mengganggu nafsu makan, kadang menyebabkan muntah ringan',
      '7-10':
        'Mual berat - Mual terus-menerus atau disertai muntah berat, pasien tidak mampu makan atau minum sama sekali',
    },
  },
  {
    number: '5',
    text: 'Seberapa berkurang nafsu makan yang Anda alami saat ini? (Resiko defisit nutrisi)',
    descriptions: {
      '0-3':
        'Nafsu makan normal / sedikit berkurangMasih mampu makan dengan baik, hanya sedikit penurunan selera makan',
      '4-6':
        'Nafsu makan menurun sedang - Mulai sulit makan, porsi berkurang dari biasanya, sering menolak makanan tertentu',
      '7-10':
        'Nafsu makan sangat menurun - Tidak ada keinginan makan, menolak asupan meski lapar, membutuhkan dukungan nutrisi tambahan',
    },
  },
  {
    number: '6',
    text: 'Apakah Anda saat ini mengalami sesak saat bernapas? (pola nafas tidak efektif, bersihan jalan nafas tidak efektif)',
    descriptions: {
      '0': 'Tidak sesak',
      '1-3':
        'Tidak sesak / Sesak ringan - Bernapas dengan normal, tidak ada kesulitan napas saat aktivitas ringan',
      '4-6':
        'Sesak sedang - Mulai sesak saat berbicara atau berjalan, membutuhkan istirahat lebih sering',
      '7-10':
        'Sesak berat - Sesak bahkan saat istirahat, tampak gelisah atau menggunakan otot bantu napas; perlu intervensi segera (oksigen, posisi semi-fowler)',
    },
  },
  {
    number: '7',
    text: 'Seberapa sedih, murung atau kehilangan semangat Anda saat ini? (keputus asaan, depresi)',
    descriptions: {
      '0': 'Tidak sedih',
      '1-3': 'Sedih ringan - Pasien merasa tenang dan tetap bersemangat menjalani aktivitas',
      '4-6':
        'Sedih sedang - Mulai kehilangan minat atau semangat, sering merasa murung atau tertekan',
      '7-10':
        'Sedih berat - Pasien tampak sangat sedih, putus asa, kehilangan motivasi hidup, perlu dukungan psikologis segera',
    },
  },
  {
    number: '8',
    text: 'Seberapa besar Anda mengalami cemas atau khawatir saat ini? (ansietas)',
    descriptions: {
      '0': 'Tidak cemas',
      '1-3': 'Cemas ringan - Perasaan tenang dan stabil, mampu mengendalikan kekhawatiran',
      '4-6': 'Cemas sedang - Sering merasa gelisah atau sulit tidur karena kekhawatiran',
      '7-10':
        'Cemas berat - Pasien sangat gelisah, panik, jantung berdebar, sulit tenang; butuh penanganan segera',
    },
  },
  {
    number: '9',
    text: 'Secara keseluruhan, bagaimana perasaan Anda saat ini? (kesiapan koping keluarga)',
    descriptions: {
      '0-3':
        'Merasa sangat baik / ringan - Pasien merasa tenang, nyaman, dan positif terhadap kondisi tubuhnya',
      '4-6':
        'Perasaan sedang / tidak nyaman - Pasien merasa kurang bersemangat, cepat lelah, atau kehilangan motivasi',
      '7-10':
        'Perasaan buruk / sangat tidak nyaman - Pasien merasa sangat buruk, kehilangan kendali emosional, dan kualitas hidup menurun drastis',
    },
  },
]

interface ESASQuestionComponentProps {
  question: (typeof ESAS_QUESTIONS)[0]
  value: number
  onChange: (value: number) => void
  error?: string
}

function ESASQuestionComponent({ question, value, onChange, error }: ESASQuestionComponentProps) {
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
      className={`${getScoreColor(value)} transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-md border-sky-200`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-sky-900">
              {question.number}. {question.text}
            </CardTitle>
          </div>
          {value !== undefined && (
            <Badge className={`${getScoreBadgeColor(value)} text-white border-0`}>
              {value} - {getScoreLevel(value)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <FormLabel className="text-sm font-medium text-sky-700">Pilih Skor (0-10)</FormLabel>
          <div className="grid grid-cols-6 sm:grid-cols-11 gap-1 sm:gap-2">
            {Array.from({ length: 11 }, (_, i) => (
              <Button
                key={i}
                type="button"
                variant={value === i ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 text-xs transition-all duration-200 hover:scale-105 ${
                  value === i
                    ? getScoreBadgeColor(i) + ' text-white border-current shadow-md'
                    : 'border-sky-300 hover:border-sky-400 hover:bg-sky-50'
                }`}
                onClick={() => onChange(i)}
              >
                {i}
              </Button>
            ))}
          </div>
          {error && <FormMessage className="text-sm text-red-500" />}
        </div>

        {value !== undefined && (
          <div
            className={`p-3 rounded-lg text-sm border transition-all duration-300 ${
              value === 0
                ? 'bg-gray-50 text-gray-700 border-gray-200'
                : value >= 1 && value <= 3
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : value >= 4 && value <= 6
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : value >= 7 && value <= 10
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <div className="font-medium mb-1 flex items-center">{getScoreLevel(value)}</div>
            <div className="text-xs leading-relaxed">{getDescriptionForScore(value)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ESASScreeningPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [existingPatients, setExistingPatients] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showExistingPatients, setShowExistingPatients] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const form = useForm<ESAScreeningFormData>({
    resolver: zodResolver(esasScreeningFormSchema),
    defaultValues: {
      patient_info: {
        patient_name: '',
        patient_age: 0,
        patient_gender: 'L',
        facility_name: '',
        screening_type: 'initial',
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

  // Search existing patients
  const searchPatients = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setExistingPatients([])
        return
      }

      setIsSearching(true)
      try {
        const supabase = createClient()

        // Get current user first
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error('User not authenticated')
        }

        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', user.id)
          .ilike('name', `%${query}%`)
          .limit(5)

        if (error) throw error
        setExistingPatients(data || [])
      } catch (error) {
        console.error('Search patients error:', error)
        toast({
          title: 'Error',
          description: 'Gagal mencari pasien',
          variant: 'destructive',
        })
      } finally {
        setIsSearching(false)
      }
    },
    [toast]
  )

  // Handle search input with debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value)
      const timer = setTimeout(() => {
        searchPatients(value)
      }, 300)

      return () => clearTimeout(timer)
    },
    [searchPatients, setSearchQuery]
  )

  // Select existing patient
  const selectPatient = useCallback(
    (patient: any) => {
      form.setValue('patient_info.patient_name', patient.name)
      form.setValue('patient_info.patient_age', patient.age)
      form.setValue('patient_info.patient_gender', patient.gender)
      form.setValue('patient_info.facility_name', patient.facility_name || '')
      setShowExistingPatients(false)
      setSearchQuery('')
      setExistingPatients([])
    },
    [form]
  )

  // Handle form submission
  const onSubmit = async (data: ESAScreeningFormData) => {
    setIsSubmitting(true)
    try {
      console.log('=== FORM SUBMISSION START ===')
      console.log('Form data received:', data)

      // Validate input data
      if (!data.patient_info.patient_name?.trim()) {
        throw new Error('Nama pasien harus diisi')
      }

      if (!data.patient_info.patient_age || data.patient_info.patient_age <= 0) {
        throw new Error('Usia pasien harus valid')
      }

      if (!data.patient_info.patient_gender) {
        throw new Error('Jenis kelamin harus dipilih')
      }

      console.log('Input validation passed')
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Authentication error:', userError)
        throw new Error('User not authenticated')
      }

      console.log('Current user authenticated:', {
        id: user.id,
        email: user.email,
        role: user.role,
        app_metadata: user.app_metadata
      })

      // Process ESAS screening using rule engine
      const esasResult = ESASRuleEngine.processESASScreening(data.questions)

      // Format data for database
      const dbData = ESASRuleEngine.formatScreeningForDB(
        esasResult,
        data.patient_info,
        data.patient_info.screening_type
      )

      // Check if patient exists
      console.log('Looking for existing patient with criteria:', {
        user_id: user.id,
        name: data.patient_info.patient_name.trim(),
        age: data.patient_info.patient_age,
        gender: data.patient_info.patient_gender
      })

      const { data: existingPatients, error: patientCheckError } = await supabase
        .from('patients')
        .select('id, name, age, gender')
        .eq('user_id', user.id)
        .eq('name', data.patient_info.patient_name.trim())
        .eq('age', data.patient_info.patient_age)
        .eq('gender', data.patient_info.patient_gender)

      if (patientCheckError) {
        console.error('Error checking existing patient:', patientCheckError)
        throw new Error(`Gagal memeriksa data pasien: ${patientCheckError.message}`)
      }

      console.log('Found existing patients:', existingPatients)

      const existingPatient = existingPatients && existingPatients.length > 0 ? existingPatients[0] : null

      let patientId: string

      if (existingPatient) {
        console.log('Using existing patient ID:', existingPatient.id)
        patientId = existingPatient.id
      } else {
        // Create new patient
        const patientData = {
          user_id: user.id,
          name: data.patient_info.patient_name.trim(),
          age: data.patient_info.patient_age,
          gender: data.patient_info.patient_gender,
          facility_name: data.patient_info.facility_name?.trim() || null,
        }

        console.log('Creating new patient with data:', patientData)

        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert(patientData)
          .select()
          .single()

        if (patientError) {
          console.error('Error creating patient:', patientError)
          console.error('Patient error details:', {
            message: patientError.message,
            details: patientError.details,
            hint: patientError.hint,
            code: patientError.code
          })
          throw new Error(`Gagal membuat data pasien: ${patientError.message}`)
        }

        patientId = newPatient.id
        console.log('New patient created successfully:', newPatient)
      }

      // Create screening
      console.log('Creating screening with data:', { ...dbData, patient_id: patientId })

      const { data: screening, error: screeningError } = await supabase
        .from('screenings')
        .insert({
          user_id: user.id,
          ...dbData,
          patient_id: patientId,
        })
        .select()
        .single()

      if (screeningError) {
        console.error('Error creating screening:', screeningError)
        console.error('Screening error details:', {
          message: screeningError.message,
          details: screeningError.details,
          hint: screeningError.hint,
          code: screeningError.code
        })
        console.error('Screening data attempted:', {
          user_id: user.id,
          ...dbData,
          patient_id: patientId,
        })
        throw new Error(`Gagal membuat screening: ${screeningError.message}`)
      }

      console.log('=== SCREENING CREATION SUCCESS ===')
      console.log('Screening created:', screening)

      toast({
        title: 'Berhasil',
        description: 'Screening ESAS berhasil disimpan',
      })

      // Redirect to result page
      router.push(`/screening/${screening.id}/result`)
    } catch (error) {
      console.error('Screening submission error:', error)

      let errorMessage = 'Gagal menyimpan screening. Silakan coba lagi.'
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save draft functionality
  const saveDraft = async () => {
    setIsSavingDraft(true)
    try {
      const formData = form.getValues()

      // Save to localStorage for draft
      const draftData = {
        ...formData,
        saved_at: new Date().toISOString(),
      }

      localStorage.setItem('esas_screening_draft', JSON.stringify(draftData))

      toast({
        title: 'Draft Disimpan',
        description: 'Draft screening berhasil disimpan secara lokal',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan draft',
        variant: 'destructive',
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('esas_screening_draft')
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft)
        // Reset form with draft data (excluding patient info if user wants to start fresh)
        form.reset({
          ...draftData,
          patient_info: {
            ...draftData.patient_info,
            patient_name: '',
            patient_age: 0,
            patient_gender: 'L',
          },
        })

        toast({
          title: 'Draft Ditemukan',
          description:
            'Draft screening sebelumnya telah dimuat. Anda dapat melanjutkan atau memulai baru.',
        })
      } catch {
        // Silently handle draft loading error
      }
    }
  })

  return (
    <div className="relative min-h-screen">
      <HeaderNav />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl mt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-sky-900 mb-2">Form Skrining ESAS</h1>
            <p className="text-sky-600 text-lg">
              Edmonton Symptom Assessment System - Penilaian Gejala Pasien Paliatif
            </p>
            <p className="text-sky-500 text-sm mt-2">
              Evaluasi komprehensif 9 gejala paliatif dengan skala 0-10
            </p>
          </div>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Patient Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border-sky-200">
                <CardHeader>
                  <CardTitle className="text-xl text-sky-900">Informasi Pasien</CardTitle>
                  <CardDescription className="text-sky-600">
                    Masukkan data identitas pasien yang akan discreening
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patient_info.patient_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-700">Nama Pasien *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Masukkan nama pasien"
                                {...field}
                                className="bg-white/90 border-sky-300 focus:border-blue-500"
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleSearchChange(e.target.value)
                                  setShowExistingPatients(true)
                                }}
                                onFocus={() => setShowExistingPatients(true)}
                              />
                              {isSearching && (
                                <div className="absolute right-3 top-3">
                                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />

                          {/* Show existing patients dropdown */}
                          {showExistingPatients &&
                            searchQuery.trim() &&
                            existingPatients.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-md border-sky-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {existingPatients.map((patient) => (
                                  <button
                                    key={patient.id}
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-sky-50 border-b border-sky-100 last:border-b-0 transition-colors"
                                    onClick={() => selectPatient(patient)}
                                  >
                                    <div className="font-medium text-sm text-sky-900">
                                      {patient.name}
                                    </div>
                                    <div className="text-xs text-sky-600">
                                      {patient.age} tahun •{' '}
                                      {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
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
                              placeholder="Masukkan usia"
                              className="bg-white/90 border-sky-300 focus:border-blue-500"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patient_info.patient_gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-700">Jenis Kelamin *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/90 border-sky-300 focus:border-blue-500">
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

                    <FormField
                      control={form.control}
                      name="patient_info.facility_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-700">Nama Fasilitas (Opsional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan nama fasilitas kesehatan"
                              className="bg-white/90 border-sky-300 focus:border-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="patient_info.screening_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-700">Tipe Screening *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/90 border-sky-300 focus:border-blue-500">
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
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* ESAS Questions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-sky-900 mb-2">Pertanyaan ESAS</h2>
                <p className="text-sky-600 mb-4">
                  Nilai setiap gejala dari 0 (tidak ada keluhan) hingga 10 (keluhan terberat)
                </p>

                {/* Score Legend */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="outline" className="bg-gray-100 border-gray-300 text-gray-700">
                    0 = Tidak ada keluhan
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 border-green-300 text-green-800">
                    1-3 = Ringan
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 border-yellow-300 text-yellow-800"
                  >
                    4-6 = Sedang
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 border-red-300 text-red-800">
                    7-10 = Berat
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {ESAS_QUESTIONS.map((question, index) => (
                  <motion.div
                    key={question.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  >
                    <FormField
                      control={form.control}
                      name={`questions.${question.number}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <ESASQuestionComponent
                            question={question}
                            value={field.value || 0}
                            onChange={field.onChange}
                            error={
                              (
                                form.formState.errors.questions?.[
                                  question.number as keyof typeof form.formState.errors.questions
                                ] as any
                              )?.message
                            }
                          />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Form Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveDraft}
                    disabled={isSavingDraft}
                    className="border-sky-300 text-sky-700 hover:bg-sky-50"
                  >
                    {isSavingDraft ? 'Menyimpan...' : 'Simpan Draft'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="border-sky-300 text-sky-700 hover:bg-sky-50"
                  >
                    Reset Form
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-sky-300 text-sky-700 hover:bg-sky-50"
                  >
                    Batal
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !form.formState.isValid}
                    className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                  >
                    {isSubmitting ? 'Memproses...' : 'Submit Screening'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </form>
        </Form>
      </div>

      <Footer />
    </div>
  )
}
