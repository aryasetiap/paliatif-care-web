'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Save, User } from 'lucide-react'
import {
  createPatient,
  updatePatient,
  type Patient,
  type PatientInsert,
  type PatientUpdate,
} from '@/lib/patient-management-index'
import { createClient } from '@/lib/supabase'

const patientFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama pasien minimal 3 karakter')
    .max(100, 'Nama pasien maksimal 100 karakter'),
  age: z
    .number()
    .min(0, 'Usia tidak boleh kurang dari 0')
    .max(150, 'Usia tidak boleh lebih dari 150 tahun'),
  gender: z.enum(['L', 'P'], {
    required_error: 'Pilih jenis kelamin',
  }),
  facility_name: z
    .string()
    .max(100, 'Nama fasilitas maksimal 100 karakter')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().or(z.literal('')),
})

type PatientFormValues = z.infer<typeof patientFormSchema>

interface PatientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient
  onSuccess?: (patient: Patient) => void
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: PatientFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!patient
  const { toast } = useToast()

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: patient?.name || '',
      age: patient?.age || '' as any,
      gender: (patient?.gender as 'L' | 'P' | undefined) || undefined,
      facility_name: patient?.facility_name || '',
      notes: '',
    },
  })

  const onSubmit = async (values: PatientFormValues) => {
    try {
      setLoading(true)

      let savedPatient: Patient

      if (isEdit && patient) {
        // Update existing patient
        const updateData: PatientUpdate = {
          name: values.name,
          age: values.age,
          gender: values.gender,
          facility_name: values.facility_name || null,
        }

        savedPatient = await updatePatient(patient.id, updateData)

        toast({
          title: 'Berhasil',
          description: 'Data pasien berhasil diperbarui',
        })
      } else {
        // Create new patient
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast({
            title: 'Error',
            description: 'User tidak ditemukan',
            variant: 'destructive',
          })
          return
        }

        const patientData: PatientInsert = {
          user_id: user.id,
          name: values.name,
          age: values.age,
          gender: values.gender,
          facility_name: values.facility_name || null,
        }

        savedPatient = await createPatient(patientData)

        toast({
          title: 'Berhasil',
          description: 'Pasien baru berhasil ditambahkan',
        })
      }

      // Reset form and close dialog
      form.reset()
      onOpenChange(false)

      // Call success callback
      onSuccess?.(savedPatient)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan data pasien'

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      form.reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-md border-sky-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sky-900">
            <User className="h-5 w-5" />
            {isEdit ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui informasi data pasien yang sudah ada.'
              : 'Tambahkan pasien baru untuk melakukan skrining ESAS.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nama Lengkap Pasien</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama lengkap pasien"
                        {...field}
                        className="bg-white/90 border-sky-300 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usia</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Usia"
                        min="0"
                        max="150"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? 0 : parseInt(value) || 0)
                        }}
                        className="bg-white/90 border-sky-300 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
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
            </div>

            {/* Patient Preview */}
            {form.watch('name') && form.watch('age') && form.watch('gender') && (
              <div className="p-4 bg-sky-50/50 rounded-lg border border-sky-200">
                <p className="text-sm font-medium text-sky-900 mb-2">Preview Pasien:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {form
                      .watch('name')
                      .split(' ')
                      .map((word) => word.charAt(0).toUpperCase())
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-sky-900">{form.watch('name')}</p>
                    <p className="text-sm text-sky-600">
                      {form.watch('age')} tahun •{' '}
                      {form.watch('gender') === 'L' ? 'Laki-laki' : 'Perempuan'}
                      {form.watch('facility_name') && ` • ${form.watch('facility_name')}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? 'Perbarui Data' : 'Tambah Pasien'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface QuickAddPatientProps {
  onPatientCreated?: (patient: Patient) => void
}

export function QuickAddPatient({ onPatientCreated }: QuickAddPatientProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
        <User className="h-8 w-8 text-sky-600" />
      </div>
      <h3 className="text-lg font-semibold text-sky-900 mb-2">Tambah Pasien Baru</h3>
      <p className="text-sky-600 mb-4 text-sm">Tambahkan pasien baru untuk memulai skrining ESAS</p>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
      >
        <User className="mr-2 h-4 w-4" />
        Tambah Pasien
      </Button>

      <PatientFormDialog open={open} onOpenChange={setOpen} onSuccess={onPatientCreated} />
    </div>
  )
}
