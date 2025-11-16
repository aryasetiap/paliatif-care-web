'use client'

import { useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'

import { esasScreeningFormSchema, type ESAScreeningFormData } from '@/lib/validations'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { ESASQuestionComponent, ESAS_QUESTIONS } from './esas-form-variants'
import { InfoIcon, ShieldIcon, UserIcon } from 'lucide-react'

interface ESASGuestFormProps {
  onSubmit?: (data: ESAScreeningFormData) => Promise<{ screeningId: string; guestId: string }>
  onCancel?: () => void
}

function ESASGuestForm({ onSubmit, onCancel }: ESASGuestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  const { toast } = useToast()

  const form = useForm<ESAScreeningFormData>({
    resolver: zodResolver(esasScreeningFormSchema),
    defaultValues: {
      patient_info: {
        patient_name: '',
        patient_age: 0,
        patient_gender: 'L',
        facility_name: '',
        screening_type: 'initial',
        contact_info: '', // Required for guest mode
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

      // Validate contact info for guest mode
      if (!data.patient_info.contact_info?.trim()) {
        toast({
          title: "Validasi Error",
          description: "Informasi kontak wajib diisi untuk screening tamu",
          variant: "destructive",
        })
        return
      }

      await onSubmit(data)

      toast({
        title: "Berhasil",
        description: "Screening ESAS berhasil disimpan. Simpan ID untuk melihat hasil.",
      })

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

  const getHighestScore = () => {
    const questions = form.getValues('questions')
    const scores = Object.values(questions).filter(score => score > 0)
    return scores.length > 0 ? Math.max(...scores) : 0
  }

  const getRiskLevel = () => {
    const highestScore = getHighestScore()
    if (highestScore === 0) return 'Tidak ada keluhan'
    if (highestScore <= 3) return 'Ringan'
    if (highestScore <= 6) return 'Sedang'
    return 'Berat'
  }

  const getRiskColor = () => {
    const highestScore = getHighestScore()
    if (highestScore === 0) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (highestScore <= 3) return 'bg-green-100 text-green-800 border-green-300'
    if (highestScore <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header untuk Guest */}
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-full px-4 py-2 mb-4"
        >
          <UserIcon className="w-4 h-4 text-purple-600" />
          <span className="text-purple-700 font-medium">Mode Tamu - ESAS Screening</span>
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Evaluasi Gejala Mandiri
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Lakukan evaluasi gejala Anda tanpa perlu login. Hasil akan tersedia secara instan dan dapat Anda simpan.
        </p>
      </div>

      {/* Guest Information Alert */}
      {showDisclaimer && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <ShieldIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex justify-between items-start">
                <div>
                  <strong>Informasi Penting:</strong>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• Screening ini bersifat anonim dan tidak memerlukan akun</li>
                    <li>• Hasil akan ditampilkan secara instan setelah selesai</li>
                    <li>• Simpan ID yang diberikan untuk melihat hasil kembali</li>
                    <li>• Data hanya untuk evaluasi dan bukan diagnosis medis</li>
                  </ul>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDisclaimer(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Patient Info Section */}
          <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-xl text-purple-900">Informasi Pasien</CardTitle>
              <CardDescription>
                Data yang diperlukan untuk evaluasi gejola dan hasil screening
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient_info.patient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-700">Nama Lengkap *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama lengkap"
                        {...field}
                        className="bg-white/90 border-purple-300"
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
                    <FormLabel className="text-purple-700">Usia *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan usia"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-white/90 border-purple-300"
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
                    <FormLabel className="text-purple-700">Jenis Kelamin *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/90 border-purple-300">
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
                name="patient_info.contact_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-700">
                      Informasi Kontak (Email/No. HP) *
                      <span className="text-xs text-purple-500 ml-1">Wajib untuk akses hasil</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email atau nomor handphone"
                        {...field}
                        className="bg-white/90 border-purple-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patient_info.facility_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-700">Fasilitas Kesehatan (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rumah sakit, klinik, atau dokter yang menangani"
                        {...field}
                        className="bg-white/90 border-purple-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patient_info.screening_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-700">Tipe Screening *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/90 border-purple-300">
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

          {/* Live Risk Indicator */}
          <Card className={`border-2 ${getRiskColor()}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <InfoIcon className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Status Risiko Saat Ini</div>
                    <div className="text-sm opacity-80">Berdasarkan gejala yang Anda pilih</div>
                  </div>
                </div>
                <Badge className={`${getRiskColor()} text-lg px-4 py-2`}>
                  {getRiskLevel()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* ESAS Questions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">Pertanyaan ESAS</h2>
            <div className="grid gap-6">
              {/* @ts-expect-error TypeScript error with question indexing - fix later */}
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

          {/* Final Reminder */}
          <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <InfoIcon className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Catatan Penting:</strong> Screening ESAS adalah alat evaluasi gejala dan bukan
              pengganti diagnosis medis profesional. Jika Anda mengalami gejala berat atau
              kondisi darurat, segera hubungi fasilitas kesehatan terdekat.
            </AlertDescription>
          </Alert>

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
              className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Memproses Screening...
                </>
              ) : (
                'Lihat Hasil Screening'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}

export { ESASGuestForm }