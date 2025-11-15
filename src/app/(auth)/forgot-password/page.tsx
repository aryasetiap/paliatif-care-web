'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/stores/authStore'
import { Loader2, Mail, ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import AuthLayout from '@/components/auth/AuthLayout'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  const { forgotPassword, loading: authLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email)

      setIsSubmitted(true)
      toast({
        title: 'Email terkirim',
        description: 'Instruksi reset password telah dikirim ke email Anda.',
      })
    } catch (error) {
      toast({
        title: 'Gagal mengirim email',
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      })
    }
  }

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Email Terkirim"
        subtitle="Periksa inbox Anda untuk instruksi selanjutnya"
        showBackButton={true}
        backHref="/login"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          className="text-center space-y-4 sm:space-y-6"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-full p-3 sm:p-4 shadow-xl border border-white/20">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4"
          >
            <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
              Kami telah mengirimkan link reset password ke alamat email Anda. Silakan periksa inbox
              dan folder spam Anda.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
            className="space-y-3"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-lg hover:shadow-green-500/25 text-sm sm:text-base"
              >
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Kembali ke Login
                </Link>
              </Button>
            </motion.div>

            <p className="text-xs sm:text-sm text-sky-600">
              Tidak menerima email?{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Coba lagi
              </button>
            </p>
          </motion.div>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Lupa Password"
      subtitle="Masukkan email Anda untuk menerima instruksi reset password"
      showBackButton={true}
      backHref="/login"
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-5"
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sky-800 font-semibold text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              disabled={authLoading}
              {...register('email')}
              className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 focus:border-blue-400 focus:ring-blue-400/20 h-10 sm:h-11 ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs sm:text-sm text-red-500 flex items-center gap-1"
              >
                {errors.email.message}
              </motion.p>
            )}
          </div>
        </div>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4"
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Masukkan email yang terdaftar pada akun Anda. Kami akan mengirimkan link untuk mereset
              password Anda. Link tersebut berlaku selama 1 jam.
            </p>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
          className="w-full"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 text-sm sm:text-base"
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Mengirim email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Kirim Instruksi Reset
                  <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
          className="text-center"
        >
          <Link
            href="/login"
            className="text-xs sm:text-sm text-sky-700 hover:text-sky-900 font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Kembali ke Login
          </Link>
        </motion.div>
      </motion.form>
    </AuthLayout>
  )
}
