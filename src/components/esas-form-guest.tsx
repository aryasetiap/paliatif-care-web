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

import { esasScreeningFormSchema, type ESAScreeningFormData } from '@/lib/validations'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { ESASQuestionComponent, ESAS_QUESTIONS } from './esas-form-variants'

interface ESASGuestFormProps {
  onSubmit?: (data: ESAScreeningFormData) => Promise<{ screeningId: string; guestId: string }>
  onCancel?: () => void
}

function ESASGuestForm({ onSubmit, onCancel }: ESASGuestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()

  const form = useForm<ESAScreeningFormData>({
    resolver: zodResolver(esasScreeningFormSchema),
    defaultValues: {
      patient_info: {
        patient_name: '',
        patient_age: 0,
        patient_gender: 'L',
        facility_name: '', // Will be empty for guest
        screening_type: 'initial', // Default to initial screening
        contact_info: '', // Not used in guest mode but kept for compatibility
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
    if (!onSubmit) {
      return
    }

    try {
      setIsSubmitting(true)

      // Validate required fields for guest mode
      if (!data.patient_info.patient_name?.trim() || data.patient_info.patient_age <= 0) {
        toast({
          title: 'Validasi Error',
          description: 'Nama dan usia wajib diisi untuk screening',
          variant: 'destructive',
        })
        return
      }

      const result = await onSubmit(data)

      if (result) {
        toast({
          title: 'Berhasil',
          description: 'Screening ESAS berhasil disimpan. Anda akan diarahkan ke hasil.',
        })
      }
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
      className="max-w-4xl mx-auto p-6 mt-16"
    >
      {/* Header untuk Guest - Similar to Pasien Form */}
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-4 py-2 mb-4"
        >
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-medium">Mode Tamu - Evaluasi Mandiri</span>
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          ESAS Screening
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Evaluasi gejala Anda tanpa perlu login. Hasil akan ditampilkan secara instan.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            // Trigger validation and submission
            form.handleSubmit(handleSubmit)(e)
          }}
          className="space-y-6"
        >
          {/* Patient Info Section - Simplified for Guest */}
          <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-sky-200">
            <CardHeader>
              <CardTitle className="text-xl text-sky-900">Informasi Dasar</CardTitle>
              <CardDescription>Data yang diperlukan untuk evaluasi gejala</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="patient_info.patient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-700">Nama Lengkap *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama lengkap"
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
                        placeholder="Masukkan usia"
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
                  error={
                    form.formState.errors.questions &&
                    typeof form.formState.errors.questions[
                      question.number as keyof typeof form.formState.errors.questions
                    ] === 'object' &&
                    form.formState.errors.questions[
                      question.number as keyof typeof form.formState.errors.questions
                    ] !== null &&
                    'message' in
                      (form.formState.errors.questions[
                        question.number as keyof typeof form.formState.errors.questions
                      ] as object)
                      ? (
                          form.formState.errors.questions[
                            question.number as keyof typeof form.formState.errors.questions
                          ] as { message?: string }
                        ).message
                      : undefined
                  }
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
              type="button"
              disabled={isSubmitting}
              className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={async () => {
                if (isSubmitting) {
                  return
                }

                try {
                  // Manually trigger form validation
                  const currentValues = form.getValues()

                  // Basic validation
                  if (!currentValues.patient_info?.patient_name?.trim()) {
                    toast({
                      title: 'Validasi Error',
                      description: 'Nama lengkap harus diisi',
                      variant: 'destructive',
                    })
                    return
                  }

                  if (
                    !currentValues.patient_info?.patient_age ||
                    currentValues.patient_info.patient_age <= 0
                  ) {
                    toast({
                      title: 'Validasi Error',
                      description: 'Usia harus diisi dengan benar',
                      variant: 'destructive',
                    })
                    return
                  }

                  // Trigger submission manually
                  await handleSubmit(currentValues as any)
                } catch (error) {
                  toast({
                    title: 'Error',
                    description:
                      error instanceof Error ? error.message : 'Gagal memproses screening',
                    variant: 'destructive',
                  })
                }
              }}
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
