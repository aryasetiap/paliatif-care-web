'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/stores/authStore'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations'
import { Loader2, Eye, EyeOff, Lock, ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { resetPassword: resetPasswordAction, loading: authLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const watchedPassword = watch('password')

  // Get error parameters from Supabase
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle error parameters only
  useEffect(() => {
    if (error) {
      toast({
        title: 'Link tidak valid',
        description: decodeURIComponent(errorDescription || 'Link reset password tidak valid atau telah kadaluarsa.'),
        variant: 'destructive',
      })
      router.push('/login')
    }
  }, [error, errorDescription, router, toast])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)

    try {
      await resetPasswordAction(data.password)

      setIsSuccess(true)
      toast({
        title: 'Password berhasil diubah',
        description: 'Password Anda telah berhasil diperbarui.',
      })

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      toast({
        title: 'Gagal mengubah password',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        {/* Modern Healthcare Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-green-200 via-emerald-300 to-green-400" />
        <div className="fixed inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
        <div className="fixed inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Healthcare Grid Pattern */}
        <div
          className="fixed inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'slide 20s linear infinite'
          }}
        />

        {/* Success Message */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {/* Header with Logo and Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <div className="relative mb-6">
                <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-full p-4 shadow-xl border border-white/20 mx-auto w-fit">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight leading-tight text-green-900 mb-2">
                Pelita
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-green-600">
                  Care
                </span>
              </h1>
              <p className="text-green-700 text-base">
                Password Berhasil Diubah
              </p>
            </motion.div>

            {/* Success Message Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-3 bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-2xl blur-xl opacity-40"></div>

                {/* Form Content */}
                <div className="relative bg-white/95 backdrop-blur-lg border border-green-300 rounded-2xl p-6 shadow-xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
                  >
                    <p className="text-sm text-green-800 leading-relaxed text-center">
                      Password Anda telah berhasil diperbarui. Anda akan dialihkan ke halaman login dalam beberapa saat.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                    className="w-full space-y-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        asChild
                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-lg hover:shadow-green-500/25"
                      >
                        <Link href="/login">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Kembali ke Login
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Modern Healthcare Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-200 via-sky-300 to-blue-400" />
      <div className="fixed inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Healthcare Grid Pattern */}
      <div
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'slide 20s linear infinite'
        }}
      />

      {/* Reset Password Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Header with Logo and Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <div className="relative mb-6">
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-4 shadow-xl border border-white/20 mx-auto w-fit">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight leading-tight text-sky-900 mb-2">
              Pelita
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Care
              </span>
            </h1>
            <p className="text-sky-700 text-base">
              Reset Password
            </p>
          </motion.div>

          {/* Reset Password Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-2xl blur-xl opacity-40"></div>

              {/* Form Content */}
              <div className="relative bg-white/95 backdrop-blur-lg border border-sky-300 rounded-2xl p-6 shadow-xl">
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sky-800 font-semibold text-sm">Password Baru</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Masukkan password baru"
                          disabled={isLoading || authLoading}
                          {...register('password')}
                          className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 focus:border-blue-400 focus:ring-blue-400/20 pr-10 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-sky-500 hover:text-sky-700" />
                          ) : (
                            <Eye className="h-4 w-4 text-sky-500 hover:text-sky-700" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500 flex items-center gap-1"
                        >
                          {errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sky-800 font-semibold text-sm">Konfirmasi Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Konfirmasi password baru"
                          disabled={isLoading || authLoading}
                          {...register('confirmPassword')}
                          className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 focus:border-blue-400 focus:ring-blue-400/20 pr-10 ${errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-sky-500 hover:text-sky-700" />
                          ) : (
                            <Eye className="h-4 w-4 text-sky-500 hover:text-sky-700" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500 flex items-center gap-1"
                        >
                          {errors.confirmPassword.message}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="space-y-2">
                    <p className="text-xs text-sky-600 font-medium">Kekuatan Password:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-1 flex-1 rounded-full ${watchedPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <div className={`h-1 flex-1 rounded-full ${watchedPassword.match(/[A-Z]/) ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <div className={`h-1 flex-1 rounded-full ${watchedPassword.match(/[a-z]/) ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <div className={`h-1 flex-1 rounded-full ${watchedPassword.match(/[0-9]/) ? 'bg-green-500' : 'bg-gray-200'}`} />
                      </div>
                      <div className="flex justify-between text-xs text-sky-600">
                        <span>8+ karakter</span>
                        <span>Huruf besar</span>
                        <span>Huruf kecil</span>
                        <span>Angka</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Note */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                  >
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Buat password baru yang kuat dan belum pernah digunakan sebelumnya.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                    className="w-full space-y-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
                        disabled={isLoading || authLoading}
                      >
                        {isLoading || authLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mengubah password...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Reset Password
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <div className="text-center text-sm text-sky-700">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                        <Link
                          href="/login"
                          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors inline-flex items-center"
                        >
                          <ArrowLeft className="mr-1 h-3 w-3" />
                          Kembali ke Login
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={
      <div className="relative overflow-hidden min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-200 via-sky-300 to-blue-400" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}