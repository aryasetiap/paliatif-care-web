'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { esasScreeningFormSchema, type ESAScreeningFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/stores/authStore'
import { ESASQuestionComponent, ESAS_QUESTIONS } from './esas-form-variants'

interface ESASPerawatFormProps {
  onSubmit?: (data: ESAScreeningFormData, patientId: string) => Promise<void>
  onCancel?: () => void
}

interface Patient {
  id: string
  name: string
  age: number
  gender: 'L' | 'P'
  facility_name?: string
  user_id: string
  last_screening?: string
}

function ESASPerawatForm({ onSubmit, onCancel }: ESASPerawatFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPatientList, setShowPatientList] = useState(false)
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing')

  const { toast } = useToast()
  const { user } = useAuthStore()

  const form = useForm<ESAScreeningFormData>({
    resolver: zodResolver(esasScreeningFormSchema),
    defaultValues: {
      patient_info: {
        patient_name: '',
        patient_age: 0,
        patient_gender: 'L',
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

  // Search patients
  const searchPatients = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setPatients([])
        return
      }

      setIsSearching(true)
      try {
        const supabase = createClient()
        const { data: patientData, error } = await supabase
          .from('patients')
          .select('*')
          .ilike('name', `%${query}%`)
          .order('name', { ascending: true })
          .limit(10)

        if (error) {
          toast({
            title: "Error",
            description: "Gagal mencari data pasien",
            variant: "destructive",
          })
          return
        }

        setPatients(patientData || [])
      } catch {
        // Search error
      } finally {
        setIsSearching(false)
      }
    },
    [toast]
  )

  // Handle search change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && activeTab === 'existing') {
        searchPatients(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchPatients, activeTab])

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowPatientList(false)
    setSearchQuery(patient.name)

    // Update form with patient data
    form.setValue('patient_info.patient_name', patient.name)
    form.setValue('patient_info.patient_age', patient.age)
    form.setValue('patient_info.patient_gender', patient.gender)
    form.setValue('patient_info.facility_name', patient.facility_name || '')

    // Determine screening type based on last screening
    const screeningType = patient.last_screening ? 'follow_up' : 'initial'
    form.setValue('patient_info.screening_type', screeningType)
  }

  const handleNewPatientSubmit = async (data: ESAScreeningFormData) => {
    try {
      const supabase = createClient()

      // Create new patient
      const patientData = {
        name: data.patient_info.patient_name.trim(),
        age: data.patient_info.patient_age,
        gender: data.patient_info.patient_gender,
        facility_name: data.patient_info.facility_name || null,
        user_id: user!.id,
      }

      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single()

      if (patientError) {
        throw new Error(`Gagal membuat data pasien: ${patientError.message}`)
      }

      return newPatient
    } catch (error) {
      throw error
    }
  }

  const handleQuestionChange = (questionNumber: string, value: number) => {
    form.setValue(`questions.${questionNumber}` as any, value, { shouldValidate: true })
  }

  const handleSubmit = async (data: ESAScreeningFormData) => {
    if (!onSubmit) return

    try {
      setIsSubmitting(true)

      let patientId: string

      if (activeTab === 'existing' && selectedPatient) {
        patientId = selectedPatient.id
      } else if (activeTab === 'new') {
        const newPatient = await handleNewPatientSubmit(data)
        patientId = newPatient.id
      } else {
        throw new Error('Silakan pilih pasien atau buat pasien baru')
      }

      await onSubmit(data, patientId)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan screening",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetPatientSelection = () => {
    setSelectedPatient(null)
    setSearchQuery('')
    setPatients([])
    setShowPatientList(false)
    form.resetField('patient_info.patient_name')
    form.resetField('patient_info.patient_age')
    form.resetField('patient_info.patient_gender')
    form.resetField('patient_info.facility_name')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6"
    >
      {/* Header untuk Perawat */}
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-4 py-2 mb-4"
        >
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-medium">Mode Perawat - ESAS Screening</span>
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Evaluasi Gejala Pasien
        </h1>
        <p className="text-gray-600">
          Lakukan screening ESAS untuk pasien yang Anda tangani. Pilih pasien yang sudah ada atau buat data baru.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Patient Selection Section */}
          <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-200">
            <CardHeader>
              <CardTitle className="text-xl text-green-900">Pemilihan Pasien</CardTitle>
              <CardDescription>
                Pilih pasien yang sudah terdaftar atau buat data pasien baru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'existing' | 'new')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">Pasien Terdaftar</TabsTrigger>
                  <TabsTrigger value="new">Pasien Baru</TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4">
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name="patient_info.patient_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700">Cari Nama Pasien</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Ketik nama pasien untuk mencari..."
                                {...field}
                                value={searchQuery}
                                onChange={(e) => {
                                  field.onChange(e)
                                  setSearchQuery(e.target.value)
                                  setShowPatientList(true)
                                }}
                                onFocus={() => setShowPatientList(true)}
                                disabled={!!selectedPatient}
                                className="bg-white/90 border-green-300"
                              />
                              {isSearching && (
                                <div className="absolute right-3 top-3">
                                  <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Patient Search Results */}
                    {showPatientList && !selectedPatient && searchQuery.trim() && (
                      <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-md border-green-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {patients.length > 0 ? (
                          patients.map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-green-100 last:border-b-0 transition-colors"
                              onClick={() => handlePatientSelect(patient)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-green-900">{patient.name}</div>
                                  <div className="text-sm text-green-600">
                                    {patient.age} tahun • {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                  </div>
                                  {patient.facility_name && (
                                    <div className="text-xs text-green-500">{patient.facility_name}</div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {patient.last_screening ? (
                                    <Badge variant="secondary" className="text-xs">
                                      Ada screening lama
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      Screening pertama
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-green-600">
                            <div className="text-sm">Tidak ada pasien dengan nama &ldquo;{searchQuery}&rdquo;</div>
                            <div className="text-xs mt-1">Coba kata kunci lain atau buat pasien baru</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Patient Display */}
                  {selectedPatient && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <span className="font-medium text-green-900">Pasien Terpilih:</span>
                            <div className="font-bold text-lg text-green-800">{selectedPatient.name}</div>
                            <div className="text-sm text-green-600">
                              {selectedPatient.age} tahun • {selectedPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </div>
                            {selectedPatient.facility_name && (
                              <div className="text-xs text-green-500">{selectedPatient.facility_name}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={resetPatientSelection}
                          className="text-red-600 hover:text-red-700"
                        >
                          Ganti Pasien
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="new" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patient_info.patient_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700">Nama Lengkap Pasien *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan nama pasien"
                              {...field}
                              className="bg-white/90 border-green-300"
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
                          <FormLabel className="text-green-700">Usia *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Usia pasien"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="bg-white/90 border-green-300"
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
                          <FormLabel className="text-green-700">Jenis Kelamin *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/90 border-green-300">
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
                          <FormLabel className="text-green-700">Fasilitas Kesehatan</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Rumah sakit atau klinik"
                              {...field}
                              className="bg-white/90 border-green-300"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Screening Type */}
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="patient_info.screening_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-green-700">Tipe Screening *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/90 border-green-300">
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
              </div>
            </CardContent>
          </Card>

          {/* ESAS Questions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-900 mb-4">Pertanyaan ESAS</h2>
            {/* @ts-expect-error TypeScript error with question indexing - fix later */}
            <div className="grid gap-6">
              {ESAS_QUESTIONS.map((question) => (
                <ESASQuestionComponent
                  key={question.number}
                  question={question}
                  value={form.watch(`questions.${question.number}` as any) || 0}
                  onChange={(value) => handleQuestionChange(question.number, value)}
                  error={form.formState.errors.questions?.[question.number]?.message as string}
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
              disabled={isSubmitting || (activeTab === 'existing' && !selectedPatient)}
              className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Menyimpan Screening...
                </>
              ) : (
                'Simpan Screening Pasien'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}

export { ESASPerawatForm }