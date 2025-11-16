'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'

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

import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2Icon, UserIcon, InfoIcon, ArrowRightIcon } from 'lucide-react'

// Validation schemas
const registrationSchema = {
  email: {
    required: 'Email wajib diisi',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Format email tidak valid'
    }
  },
  password: {
    required: 'Password wajib diisi',
    minLength: {
      value: 6,
      message: 'Password minimal 6 karakter'
    }
  },
  confirmPassword: {
    required: 'Konfirmasi password wajib diisi'
  },
  fullName: {
    required: 'Nama lengkap wajib diisi',
    minLength: {
      value: 2,
      message: 'Nama minimal 2 karakter'
    }
  },
  role: {
    required: 'Role wajib dipilih'
  }
}

interface GuestRegistrationFlowProps {
  guestIdentifier?: string
  screeningData?: any
  onComplete?: (userId: string) => void
}

interface RegistrationFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  role: 'pasien' | 'perawat' // Admin registration should be handled separately
}

export default function GuestRegistrationFlow({
  guestIdentifier,
  screeningData,
  onComplete
}: GuestRegistrationFlowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLinkingData, setIsLinkingData] = useState(false)
  const [registrationStep, setRegistrationStep] = useState<'form' | 'success'>('form')
  const [createdUserId, setCreatedUserId] = useState<string | null>(null)
  const [linkedScreenings, setLinkedScreenings] = useState<number>(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const form = useForm<RegistrationFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: screeningData?.patient_info?.patient_name || '',
      role: 'pasien' // Default to pasien for guest conversion
    },
    mode: 'onChange'
  })

  // Get guest identifier from URL or props
  useEffect(() => {
    const urlGuestId = searchParams.get('guest_id')
    if (urlGuestId && !guestIdentifier) {
      // In real implementation, you'd fetch guest data using this ID
    }
  }, [searchParams, guestIdentifier])

  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    return password === confirmPassword || 'Password tidak cocok'
  }

  const linkGuestScreeningToUser = async (userId: string) => {
    if (!guestIdentifier) {
      // No guest identifier provided, skipping data linking
      return 0
    }

    setIsLinkingData(true)
    try {
      const supabase = createClient()

      // Find guest screenings
      const { data: guestScreenings, error: fetchError } = await supabase
        .from('screenings')
        .select('id, esas_data')
        .eq('guest_identifier', guestIdentifier)
        .eq('is_guest', true)

      if (fetchError) {
        // Error fetching guest screenings
        return 0
      }

      if (!guestScreenings || guestScreenings.length === 0) {
        // No guest screenings found for this identifier
        return 0
      }

      // Create patient record if not exists
      let patientId: string | null = null
      if (screeningData?.patient_info) {
        const patientData = {
          user_id: userId,
          name: screeningData.patient_info.patient_name,
          age: screeningData.patient_info.patient_age,
          gender: screeningData.patient_info.patient_gender,
          facility_name: screeningData.patient_info.facility_name || null
        }

        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert(patientData)
          .select()
          .single()

        if (!patientError && newPatient) {
          patientId = newPatient.id
        }
      }

      // Update screenings to link to user
      let linkedCount = 0
      for (const screening of guestScreenings) {
        const updateData: any = {
          user_id: userId,
          is_guest: false,
          guest_identifier: null
        }

        if (patientId) {
          updateData.patient_id = patientId
        }

        const { error: updateError } = await supabase
          .from('screenings')
          .update(updateData)
          .eq('id', screening.id)

        if (!updateError) {
          linkedCount++
        }
      }

      return linkedCount

    } catch {
      // Error linking guest data
      return 0
    } finally {
      setIsLinkingData(false)
    }
  }

  const onSubmit = async (data: RegistrationFormData) => {
    // Validate password match
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', { message: 'Password tidak cocok' })
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      // 1. Register user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error('Email sudah terdaftar. Silakan login dengan email tersebut.')
        }
        throw new Error(signUpError.message)
      }

      if (!authData.user) {
        throw new Error('Gagal membuat akun. Silakan coba lagi.')
      }

      const userId = authData.user.id

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: data.fullName,
          role: data.role
        })

      if (profileError) {
        throw new Error('Gagal membuat profil pengguna.')
      }

      setCreatedUserId(userId)

      // 3. Link guest screening data if available
      const linkedCount = await linkGuestScreeningToUser(userId)
      setLinkedScreenings(linkedCount)

      // 4. Show success state
      setRegistrationStep('success')

      // 5. Auto-login user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (signInError) {
        // Auto-login failed
      }

      toast({
        title: "Registrasi Berhasil!",
        description: `Akun Anda telah dibuat${linkedCount > 0 ? ` dan ${linkedCount} data screening telah ditautkan` : ''}`,
      })

      if (onComplete) {
        onComplete(userId)
      }

    } catch (error) {
      // Registration error
      toast({
        title: "Registrasi Gagal",
        description: error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteRegistration = () => {
    if (createdUserId) {
      // Redirect based on role
      const role = form.getValues('role')
      if (role === 'pasien') {
        router.push('/pasien/dashboard')
      } else if (role === 'perawat') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <AnimatePresence mode="wait">
        {registrationStep === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-4 py-2 mb-4"
              >
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 font-medium">Buat Akun</span>
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Daftar dan Simpan Data Anda
              </h1>
              <p className="text-gray-600">
                Buat akun untuk menyimpan hasil screening dan mengakses fitur lengkap
              </p>
            </div>

            {/* Guest Data Info */}
            {guestIdentifier && (
              <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <InfoIcon className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="w-4 h-4 text-green-500" />
                    <span>
                      Data screening Anda sebagai tamu akan otomatis ditautkan ke akun ini
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Registration Form */}
            <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">Formulir Pendaftaran</CardTitle>
                <CardDescription>
                  Lengkapi data diri Anda untuk membuat akun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        rules={registrationSchema.fullName}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">Nama Lengkap *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan nama lengkap"
                                {...field}
                                disabled={isSubmitting}
                                className="bg-white/90 border-blue-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        rules={registrationSchema.email}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                {...field}
                                disabled={isSubmitting}
                                className="bg-white/90 border-blue-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="role"
                      rules={registrationSchema.role}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700">Daftar Sebagai *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/90 border-blue-300">
                                <SelectValue placeholder="Pilih role Anda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pasien">Pasien</SelectItem>
                              <SelectItem value="perawat">Perawat</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        rules={registrationSchema.password}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">Password *</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Minimal 6 karakter"
                                {...field}
                                disabled={isSubmitting}
                                className="bg-white/90 border-blue-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        rules={{
                          ...registrationSchema.confirmPassword,
                          validate: (value) =>
                            validatePasswordMatch(form.getValues('password'), value)
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">Konfirmasi Password *</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Masukkan ulang password"
                                {...field}
                                disabled={isSubmitting}
                                className="bg-white/90 border-blue-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Data Linking Status */}
                    {isLinkingData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 text-yellow-700">
                          <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                          <span className="text-sm">Menautkan data screening Anda...</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting || isLinkingData}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Mendaftarkan...
                        </>
                      ) : (
                        <>
                          Buat Akun
                          <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {/* Login Link */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <button
                          type="button"
                          onClick={() => router.push('/login')}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Login di sini
                        </button>
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mb-6"
              >
                <CheckCircle2Icon className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-green-800 mb-4">
                Registrasi Berhasil!
              </h1>
              <div className="space-y-4 text-gray-600">
                <p>
                  Akun Anda telah berhasil dibuat.
                  {linkedScreenings > 0 && (
                    <span className="font-medium text-green-600">
                      {' '}{linkedScreenings} data screening telah ditautkan ke akun Anda.
                    </span>
                  )}
                </p>

                <div className="flex justify-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Email terverifikasi
                  </Badge>
                  {linkedScreenings > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      ✓ Data screening ditautkan
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    ✓ Akses fitur lengkap
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleCompleteRegistration}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Lanjut ke Dashboard
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/screening/new')}
                className="w-full"
              >
                Lakukan Screening Baru
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}