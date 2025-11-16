'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
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
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { User, Save, ArrowLeft, AlertCircle } from 'lucide-react'
import '@/styles/modern-patterns.css'

// Validation schema for patient profile
const patientProfileSchema = {
  full_name: (value: string) => {
    if (!value || value.trim().length < 2) {
      return 'Nama lengkap minimal 2 karakter'
    }
    return true
  },
  age: (value: number) => {
    if (!value || value < 0 || value > 150) {
      return 'Usia harus antara 0-150 tahun'
    }
    return true
  },
  gender: (value: string) => {
    if (!value || !['L', 'P'].includes(value)) {
      return 'Jenis kelamin harus dipilih'
    }
    return true
  },
  phone: (value: string | undefined) => {
    if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
      return 'Nomor telepon tidak valid'
    }
    return true
  },
  address: (value: string | undefined) => {
    if (value && value.trim().length < 5) {
      return 'Alamat minimal 5 karakter'
    }
    return true
  },
}

interface PatientProfileData {
  full_name: string
  age: number
  gender: 'L' | 'P'
  phone?: string
  address?: string
  emergency_contact?: string
  emergency_phone?: string
  medical_history?: string
  allergies?: string
  current_medications?: string
}

export default function PatientProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, profile, userRole } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patientData, setPatientData] = useState<any>(null)
  const [profileCompleteness, setProfileCompleteness] = useState(0)

  const form = useForm<PatientProfileData>({
    defaultValues: {
      full_name: '',
      age: 0,
      gender: 'L',
      phone: '',
      address: '',
      emergency_contact: '',
      emergency_phone: '',
      medical_history: '',
      allergies: '',
      current_medications: '',
    },
  })

  // Calculate profile completeness
  const calculateCompleteness = useCallback((data: PatientProfileData) => {
    const fields = [
      'full_name',
      'age',
      'gender',
      'phone',
      'address',
      'emergency_contact',
      'emergency_phone',
    ]
    const completedFields = fields.filter(field => {
      const value = data[field as keyof PatientProfileData]
      return value && value.toString().trim() !== ''
    }).length
    return Math.round((completedFields / fields.length) * 100)
  }, [])

  // Load patient profile data
  const loadPatientProfile = useCallback(async () => {
    if (!user || userRole !== 'pasien') {
      router.push('/login')
      return
    }

    try {
      const supabase = createClient()

      // Check if patient record exists
      const { data: patientRecord, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (patientError && patientError.code !== 'PGRST116') {
        throw patientError
      }

      let profileData: PatientProfileData = {
        full_name: profile?.full_name || '',
        age: 30,
        gender: 'L',
        phone: '',
        address: '',
        emergency_contact: '',
        emergency_phone: '',
        medical_history: '',
        allergies: '',
        current_medications: '',
      }

      if (patientRecord) {
        // Use existing patient record
        profileData = {
          full_name: patientRecord.name || profile?.full_name || '',
          age: patientRecord.age || 30,
          gender: patientRecord.gender || 'L',
          phone: patientRecord.phone || '',
          address: patientRecord.address || '',
          emergency_contact: patientRecord.emergency_contact || '',
          emergency_phone: patientRecord.emergency_phone || '',
          medical_history: patientRecord.medical_history || '',
          allergies: patientRecord.allergies || '',
          current_medications: patientRecord.current_medications || '',
        }
        setPatientData(patientRecord)
      }

      // Set form values
      form.reset(profileData)
      setProfileCompleteness(calculateCompleteness(profileData))
    } finally {
      setIsLoading(false)
    }
  }, [user, profile, userRole, router, form, calculateCompleteness])

  useEffect(() => {
    loadPatientProfile()
  }, [loadPatientProfile])

  // Handle form submission
  const onSubmit = async (data: PatientProfileData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      if (!user) {
        toast({
          title: 'Error',
          description: 'User tidak ditemukan',
          variant: 'destructive'
        })
        return
      }

      const patientDataToUpdate = {
        user_id: user.id,
        name: data.full_name.trim(),
        age: data.age,
        gender: data.gender,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        emergency_contact: data.emergency_contact?.trim() || null,
        emergency_phone: data.emergency_phone?.trim() || null,
        medical_history: data.medical_history?.trim() || null,
        allergies: data.allergies?.trim() || null,
        current_medications: data.current_medications?.trim() || null,
        updated_at: new Date().toISOString(),
      }

      let result
      if (patientData?.id) {
        // Update existing patient record
        result = await supabase
          .from('patients')
          .update(patientDataToUpdate)
          .eq('id', patientData.id)
          .select()
          .single()
      } else {
        // Create new patient record
        result = await supabase
          .from('patients')
          .insert(patientDataToUpdate)
          .select()
          .single()
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      // Update user profile name if changed
      if (data.full_name.trim() !== profile?.full_name) {
        await supabase
          .from('profiles')
          .update({ full_name: data.full_name.trim() })
          .eq('id', user.id)
      }

      setPatientData(result.data)
      setProfileCompleteness(calculateCompleteness(data))

      toast({
        title: 'Berhasil',
        description: 'Profil pasien berhasil diperbarui',
      })

    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle form field changes to update completeness
  const handleFieldChange = () => {
    const currentData = form.getValues()
    setProfileCompleteness(calculateCompleteness(currentData))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil pasien...</p>
        </div>
      </div>
    )
  }

  const getCompletenessColor = () => {
    if (profileCompleteness >= 80) return 'bg-green-500'
    if (profileCompleteness >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getCompletenessText = () => {
    if (profileCompleteness >= 80) return 'Lengkap'
    if (profileCompleteness >= 50) return 'Perlu Dilengkapi'
    return 'Belum Lengkap'
  }

  return (
    <div className="relative min-h-screen mt-16">
      <HeaderNav />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/pasien/dashboard')}
              className="border-sky-300 text-sky-700 hover:bg-sky-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
            <div className="flex-1"></div>
            <Badge className={`${getCompletenessColor()} text-white`}>
              {getCompletenessText()}: {profileCompleteness}%
            </Badge>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-sky-900 mb-2">Profil Pasien</h1>
            <p className="text-sky-600">
              Kelola informasi pribadi dan data medis Anda
            </p>
          </div>
        </motion.div>

        {/* Profile Completeness Alert */}
        {profileCompleteness < 80 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Profil Anda belum lengkap. Lengkapi data profil untuk pengalaman screening yang lebih baik.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardHeader>
              <CardTitle className="flex items-center text-sky-900">
                <User className="mr-2 h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
              <CardDescription className="text-sky-600">
                Data ini akan digunakan untuk screening ESAS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      rules={{ validate: patientProfileSchema.full_name }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-700">Nama Lengkap *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan nama lengkap"
                              className="bg-white/90 border-sky-300 focus:border-blue-500"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                handleFieldChange()
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      rules={{ validate: patientProfileSchema.age }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-700">Usia *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Masukkan usia"
                              className="bg-white/90 border-sky-300 focus:border-blue-500"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseInt(e.target.value) || 0)
                                handleFieldChange()
                              }}
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
                      name="gender"
                      rules={{ validate: patientProfileSchema.gender }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-700">Jenis Kelamin *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              handleFieldChange()
                            }}
                            defaultValue={field.value}
                          >
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
                      name="phone"
                      rules={{ validate: patientProfileSchema.phone }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-700">Nomor Telepon</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan nomor telepon"
                              className="bg-white/90 border-sky-300 focus:border-blue-500"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                handleFieldChange()
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    rules={{ validate: (value: string | undefined) => {
                      if (value && value.trim().length < 5) {
                        return 'Alamat minimal 5 karakter'
                      }
                      return true
                    } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-700">Alamat</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan alamat lengkap"
                            className="bg-white/90 border-sky-300 focus:border-blue-500"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              handleFieldChange()
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Emergency Contact */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-sky-900 mb-4">Kontak Darurat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergency_contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sky-700">Nama Kontak Darurat</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan nama kontak darurat"
                                className="bg-white/90 border-sky-300 focus:border-blue-500"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleFieldChange()
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergency_phone"
                        rules={{ validate: (value: string | undefined) => {
                          if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
                            return 'Nomor telepon tidak valid'
                          }
                          return true
                        } }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sky-700">Telepon Kontak Darurat</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan telepon kontak darurat"
                                className="bg-white/90 border-sky-300 focus:border-blue-500"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleFieldChange()
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-sky-900 mb-4">Informasi Medis</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="medical_history"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sky-700">Riwayat Penyakit</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Sebutkan penyakit yang pernah diderita"
                                className="bg-white/90 border-sky-300 focus:border-blue-500"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleFieldChange()
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sky-700">Alergi</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Sebutkan jenis alergi (obat, makanan, dll)"
                                className="bg-white/90 border-sky-300 focus:border-blue-500"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleFieldChange()
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="current_medications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sky-700">Obat Saat Ini</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Sebutkan obat yang sedang dikonsumsi"
                                className="bg-white/90 border-sky-300 focus:border-blue-500"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleFieldChange()
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/pasien/dashboard')}
                      className="border-sky-300 text-sky-700 hover:bg-sky-50"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Profil
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}