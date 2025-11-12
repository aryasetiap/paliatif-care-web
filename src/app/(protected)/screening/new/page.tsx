'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

import { esasScreeningFormSchema, type ESAScreeningFormData } from '@/lib/validations'
import { ESASRuleEngine } from '@/lib/esas-rule-engine'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

// ESAS Questions dengan deskripsi lengkap sesuai PERTANYAAN_SKRINING_ESAS.md
const ESAS_QUESTIONS = [
  {
    number: "1",
    text: "Seberapa besar keluhan nyeri yang Anda alami saat ini?",
    descriptions: {
      "0": "Tidak ada nyeri",
      "1-3": "Nyeri ringan - Pasien masih dapat beraktivitas normal tanpa hambatan",
      "4-6": "Nyeri sedang - Nyeri mulai terganggu aktivitas sehari-hari",
      "7-10": "Nyeri berat - Nyeri terasa hebat, perlu tindakan segera"
    }
  },
  {
    number: "2",
    text: "Seberapa besar keluhan lelah atau kekurangan tenaga yang Anda alami saat ini?",
    descriptions: {
      "0": "Tidak Lelah",
      "1-3": "Lelah ringan - Pasien merasa segar, masih mampu aktivitas normal",
      "4-6": "Lelah sedang - Pasien mulai cepat lelah, aktivitas berkurang",
      "7-10": "Lelah berat - Pasien tampak sangat lemah, sulit melakukan aktivitas ringan"
    }
  },
  {
    number: "3",
    text: "Apakah Anda saat ini mengalami rasa kantuk atau sulit menahan kantuk?",
    descriptions: {
      "0": "Tidak mengantuk",
      "1-3": "Mengantuk ringan - Pasien terjaga penuh, pola tidur normal",
      "4-6": "Mengantuk sedang - Pasien mudah mengantuk di siang hari",
      "7-10": "Mengantuk berat - Pasien sering tertidur, sulit terjaga"
    }
  },
  {
    number: "4",
    text: "Seberapa besar mual atau rasa ingin muntah yang Anda alami saat ini?",
    descriptions: {
      "0": "Tidak mual",
      "1-3": "Mual ringan - Tidak ada keluhan mual yang mengganggu",
      "4-6": "Mual sedang - Rasa mual mulai mengganggu nafsu makan",
      "7-10": "Mual berat - Mual terus-menerus atau disertai muntah berat"
    }
  },
  {
    number: "5",
    text: "Seberapa berkurang nafsu makan yang Anda alami saat ini?",
    descriptions: {
      "0-3": "Nafsu makan normal / sedikit berkurang",
      "4-6": "Nafsu makan menurun sedang - Mulai sulit makan, porsi berkurang",
      "7-10": "Nafsu makan sangat menurun - Tidak ada keinginan makan sama sekali"
    }
  },
  {
    number: "6",
    text: "Apakah Anda saat ini mengalami sesak saat bernapas?",
    descriptions: {
      "0": "Tidak sesak",
      "1-3": "Tidak sesak / Sesak ringan - Bernapas normal saat aktivitas ringan",
      "4-6": "Sesak sedang - Mulai sesak saat berbicara atau berjalan",
      "7-10": "Sesak berat - Sesak bahkan saat istirahat, perlu intervensi segera"
    }
  },
  {
    number: "7",
    text: "Seberapa sedih, murung atau kehilangan semangat Anda saat ini?",
    descriptions: {
      "0": "Tidak sedih",
      "1-3": "Sedih ringan - Pasien merasa tenang dan tetap bersemangat",
      "4-6": "Sedih sedang - Mulai kehilangan minat atau semangat",
      "7-10": "Sedih berat - Pasien tampak sangat sedih, putus asa"
    }
  },
  {
    number: "8",
    text: "Seberapa besar Anda mengalami cemas atau khawatir saat ini?",
    descriptions: {
      "0": "Tidak cemas",
      "1-3": "Cemas ringan - Perasaan tenang dan stabil",
      "4-6": "Cemas sedang - Sering merasa gelisah atau sulit tidur",
      "7-10": "Cemas berat - Pasien sangat gelisah, panik, jantung berdebar"
    }
  },
  {
    number: "9",
    text: "Secara keseluruhan, bagaimana perasaan Anda saat ini?",
    descriptions: {
      "0-3": "Merasa sangat baik / ringan - Pasien merasa tenang dan nyaman",
      "4-6": "Perasaan sedang / tidak nyaman - Pasien merasa kurang bersemangat",
      "7-10": "Perasaan buruk / sangat tidak nyaman - Kualitas hidup menurun drastis"
    }
  }
]

interface ESASQuestionComponentProps {
  question: typeof ESAS_QUESTIONS[0]
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
    if (score === 0) return question.descriptions["0"]
    if (score >= 1 && score <= 3) return question.descriptions["1-3"]
    if (score >= 4 && score <= 6) return question.descriptions["4-6"]
    if (score >= 7 && score <= 10) return question.descriptions["7-10"]
    return ""
  }

  return (
    <Card className={`${getScoreColor(value)} transition-all duration-300`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {question.number}. {question.text}
            </CardTitle>
          </div>
          {value !== undefined && (
            <Badge className={`${getScoreBadgeColor(value)} text-white`}>
              {value} - {getScoreLevel(value)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <FormLabel className="text-sm font-medium">Pilih Skor (0-10)</FormLabel>
          <div className="grid grid-cols-6 sm:grid-cols-11 gap-1 sm:gap-2">
            {Array.from({ length: 11 }, (_, i) => (
              <Button
                key={i}
                type="button"
                variant={value === i ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 text-xs ${
                  value === i
                    ? getScoreBadgeColor(i) + ' text-white border-current'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => onChange(i)}
              >
                {i}
              </Button>
            ))}
          </div>
          {error && (
            <FormMessage className="text-sm text-red-500" />
          )}
        </div>

        {value !== undefined && (
          <div className={`p-3 rounded-lg text-sm ${
            value === 0 ? 'bg-gray-50 text-gray-700' :
            value >= 1 && value <= 3 ? 'bg-green-50 text-green-700' :
            value >= 4 && value <= 6 ? 'bg-yellow-50 text-yellow-700' :
            value >= 7 && value <= 10 ? 'bg-red-50 text-red-700' :
            'bg-gray-50 text-gray-700'
          }`}>
            <div className="font-medium mb-1">
              {getScoreLevel(value)}
            </div>
            <div className="text-xs leading-relaxed">
              {getDescriptionForScore(value)}
            </div>
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
        screening_type: 'initial'
      },
      questions: {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0
      }
    },
    mode: "onChange"
  })

  
  // Search existing patients
  const searchPatients = useCallback(async (query: string) => {
    if (!query.trim()) {
      setExistingPatients([])
      return
    }

    setIsSearching(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5)

      if (error) throw error
      setExistingPatients(data || [])
    } catch {
      toast({
        title: "Error",
        description: "Gagal mencari pasien",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }, [toast])

  // Handle search input with debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    const timer = setTimeout(() => {
      searchPatients(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchPatients, setSearchQuery])

  // Select existing patient
  const selectPatient = useCallback((patient: any) => {
    form.setValue('patient_info.patient_name', patient.name)
    form.setValue('patient_info.patient_age', patient.age)
    form.setValue('patient_info.patient_gender', patient.gender)
    form.setValue('patient_info.facility_name', patient.facility_name || '')
    setShowExistingPatients(false)
    setSearchQuery('')
    setExistingPatients([])
  }, [form])

  // Handle form submission
  const onSubmit = async (data: ESAScreeningFormData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      // Process ESAS screening using rule engine
      const esasResult = ESASRuleEngine.processESASScreening(data.questions)

      // Format data for database
      const dbData = ESASRuleEngine.formatScreeningForDB(
        esasResult,
        data.patient_info,
        data.patient_info.screening_type
      )

      // Check if patient exists
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('name', data.patient_info.patient_name)
        .eq('age', data.patient_info.patient_age)
        .eq('gender', data.patient_info.patient_gender)
        .single()

      let patientId: string

      if (existingPatient) {
        patientId = existingPatient.id
      } else {
        // Create new patient
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            name: data.patient_info.patient_name,
            age: data.patient_info.patient_age,
            gender: data.patient_info.patient_gender,
            facility_name: data.patient_info.facility_name,
          })
          .select()
          .single()

        if (patientError) throw patientError
        patientId = newPatient.id
      }

      // Create screening
      const { data: screening, error: screeningError } = await supabase
        .from('screenings')
        .insert({
          ...dbData,
          patient_id: patientId,
        })
        .select()
        .single()

      if (screeningError) throw screeningError

      toast({
        title: "Berhasil",
        description: "Screening ESAS berhasil disimpan",
      })

      // Redirect to result page
      router.push(`/screening/${screening.id}/result`)

    } catch {
      toast({
        title: "Error",
        description: "Gagal menyimpan screening. Silakan coba lagi.",
        variant: "destructive"
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
        title: "Draft Disimpan",
        description: "Draft screening berhasil disimpan secara lokal",
      })
    } catch {
      toast({
        title: "Error",
        description: "Gagal menyimpan draft",
        variant: "destructive"
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
          }
        })

        toast({
          title: "Draft Ditemukan",
          description: "Draft screening sebelumnya telah dimuat. Anda dapat melanjutkan atau memulai baru.",
        })
      } catch {
        // Silently handle draft loading error
      }
    }
  })

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Form Skrining ESAS</h1>
        <p className="text-gray-600">
          Edmonton Symptom Assessment System - Penilaian Gejala Pasien Paliatif
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pasien</CardTitle>
              <CardDescription>
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
                      <FormLabel>Nama Pasien *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Masukkan nama pasien"
                            {...field}
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
                      {showExistingPatients && searchQuery.trim() && existingPatients.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {existingPatients.map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              onClick={() => selectPatient(patient)}
                            >
                              <div className="font-medium text-sm">{patient.name}</div>
                              <div className="text-xs text-gray-500">
                                {patient.age} tahun • {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
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
                      <FormLabel>Usia *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Masukkan usia"
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
                      <FormLabel>Jenis Kelamin *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel>Nama Fasilitas (Opsional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nama fasilitas kesehatan"
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
                    <FormLabel>Tipe Screening *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

          <Separator />

          {/* ESAS Questions Section */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pertanyaan ESAS</h2>
              <p className="text-gray-600 mb-4">
                Nilai setiap gejala dari 0 (tidak ada keluhan) hingga 10 (keluhan terberat)
              </p>

              {/* Score Legend */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-gray-100">0 = Tidak ada keluhan</Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">1-3 = Ringan</Badge>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">4-6 = Sedang</Badge>
                <Badge variant="outline" className="bg-red-100 text-red-800">7-10 = Berat</Badge>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-4">
                {ESAS_QUESTIONS.map((question) => (
                  <FormField
                    key={question.number}
                    control={form.control}
                    name={`questions.${question.number}` as any}
                    render={({ field }) => (
                      <FormItem>
                        <ESASQuestionComponent
                          question={question}
                          value={field.value || 0}
                          onChange={field.onChange}
                          error={
                        (form.formState.errors.questions?.[question.number as keyof typeof form.formState.errors.questions] as any)?.message
                      }
                        />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                disabled={isSavingDraft}
              >
                {isSavingDraft ? "Menyimpan..." : "Simpan Draft"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset Form
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="px-8"
              >
                {isSubmitting ? "Memproses..." : "Submit Screening"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}