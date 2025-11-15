'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/stores/authStore'
import { Loader2, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import AuthLayout from '@/components/auth/AuthLayout'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { register: registerUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const watchedPassword = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      // Register dengan Supabase menggunakan authStore
      await registerUser(data.email, data.password, data.fullName)

      toast({
        title: 'Pendaftaran berhasil',
        description: 'Akun Anda telah berhasil dibuat. Silakan login.',
      })

      // Redirect ke login setelah registrasi berhasil
      router.push('/login')
    } catch (error) {
      toast({
        title: 'Pendaftaran gagal',
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: 'Minimal 8 karakter', color: 'text-gray-400' }

    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const strengthLevels = [
      { score: 0, text: 'Sangat lemah', color: 'text-red-500' },
      { score: 1, text: 'Lemah', color: 'text-red-400' },
      { score: 2, text: 'Sedang', color: 'text-yellow-500' },
      { score: 3, text: 'Kuat', color: 'text-blue-500' },
      { score: 4, text: 'Sangat kuat', color: 'text-green-500' },
      { score: 5, text: 'Sangat kuat', color: 'text-green-600' },
    ]

    return strengthLevels[Math.min(score, 5)]
  }

  const passwordStrength = getPasswordStrength(watchedPassword || '')

  return (
    <AuthLayout
      title="Daftar"
      subtitle="Buat akun baru untuk memulai perjalanan kesehatan Anda"
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
            <Label htmlFor="fullName" className="text-sky-800 font-semibold text-sm">
              Nama Lengkap
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              disabled={isLoading}
              {...register('fullName')}
              className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 focus:border-blue-400 focus:ring-blue-400/20 h-10 sm:h-11 ${errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
            />
            {errors.fullName && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs sm:text-sm text-red-500 flex items-center gap-1"
              >
                {errors.fullName.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sky-800 font-semibold text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              disabled={isLoading}
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sky-800 font-semibold text-sm">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                disabled={isLoading}
                {...register('password')}
                className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 focus:border-blue-400 focus:ring-blue-400/20 pr-10 h-10 sm:h-11 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
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
                className="text-xs sm:text-sm text-red-500 flex items-center gap-1"
              >
                {errors.password.message}
              </motion.p>
            )}

            {/* Password Strength Indicator */}
            {watchedPassword && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sky-600">Kekuatan password:</span>
                  <span className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-full rounded-full ${
                        i < passwordStrength.score ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sky-800 font-semibold text-sm">
              Konfirmasi Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password"
                disabled={isLoading}
                {...register('confirmPassword')}
                className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 focus:border-blue-400 focus:ring-blue-400/20 pr-10 h-10 sm:h-11 ${errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
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
                className="text-xs sm:text-sm text-red-500 flex items-center gap-1"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="text-xs text-sky-600 leading-relaxed">
          Dengan mendaftar, Anda menyetujui{' '}
          <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
            Syarat & Ketentuan
          </Link>{' '}
          dan{' '}
          <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
            Kebijakan Privasi
          </Link>
        </div>

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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Daftar
                  <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
          className="text-center"
        >
          <p className="text-xs sm:text-sm text-sky-700">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </AuthLayout>
  )
}
