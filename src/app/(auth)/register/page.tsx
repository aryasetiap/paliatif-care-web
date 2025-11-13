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
import { Loader2, Eye, EyeOff, UserPlus, Stethoscope, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

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

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      // Registrasi dengan Supabase menggunakan authStore
      await registerUser(data.email, data.password, data.fullName)

      toast({
        title: 'Registrasi berhasil',
        description: 'Akun Anda telah dibuat. Silakan login.',
      })

      // Redirect ke dashboard setelah registrasi berhasil
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Registrasi gagal',
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '', requirements: [] }

    let score = 0
    const requirements = [
      { test: password.length >= 8, desc: 'Min 8 karakter' },
      { test: /[a-z]/.test(password), desc: 'Huruf kecil' },
      { test: /[A-Z]/.test(password), desc: 'Huruf besar' },
      { test: /\d/.test(password), desc: 'Angka' },
      { test: /[^a-zA-Z\d]/.test(password), desc: 'Simbol' },
    ]

    requirements.forEach((req) => {
      if (req.test) score++
    })

    const levels = [
      { text: 'Sangat Lemah', color: 'bg-red-500' },
      { text: 'Lemah', color: 'bg-orange-500' },
      { text: 'Sedang', color: 'bg-yellow-500' },
      { text: 'Kuat', color: 'bg-blue-500' },
      { text: 'Sangat Kuat', color: 'bg-green-500' },
    ]

    return { score, ...levels[score], requirements }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Modern Healthcare Background - Same as Homepage */}
      <div className="fixed inset-0 bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400" />
      <div className="fixed inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Floating Medical Icons - Healthcare Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 right-10 opacity-20"
        >
          <Stethoscope className="w-16 h-16 text-blue-600/30" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute bottom-40 left-20 opacity-20"
        >
          <UserPlus className="w-20 h-20 text-blue-600/30" />
        </motion.div>
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
          className="absolute top-1/3 right-1/4 opacity-20"
        >
          <Heart className="w-16 h-16 text-blue-600/30" />
        </motion.div>
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
          animation: 'slide 20s linear infinite',
        }}
      />

      {/* Register Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Header with Logo and Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-center mb-8"
          >
            <div className="relative mb-6">
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-4 shadow-xl border border-white/20 mx-auto w-fit">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight leading-tight text-sky-900 mb-2">
              Pelita
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Care
              </span>
            </h1>
            <p className="text-sky-700 text-base">Pemetaan Layanan Paliatif Berbasis ESAS</p>
          </motion.div>

          {/* Register Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-2xl blur-xl opacity-40"></div>

              {/* Form Content */}
              <div className="relative bg-white/95 backdrop-blur-lg border border-sky-300 rounded-2xl p-6 shadow-xl">
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sky-800 font-semibold text-sm">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        disabled={isLoading}
                        {...register('fullName')}
                        className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 focus:border-blue-400 focus:ring-blue-400/20 ${errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                      />
                      {errors.fullName && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500 flex items-center gap-1"
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
                        className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 focus:border-blue-400 focus:ring-blue-400/20 ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500 flex items-center gap-1"
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
                          placeholder="Minimal 8 karakter dengan huruf besar, kecil, angka, dan simbol"
                          disabled={isLoading}
                          {...register('password')}
                          className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 pr-12 focus:border-blue-400 focus:ring-blue-400/20 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                        />
                        <motion.button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-sky-500 hover:text-sky-700 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </motion.button>
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

                      {/* Enhanced Password Strength Indicator */}
                      {password && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-sky-600 font-semibold">
                              Kekuatan Password:
                            </span>
                            <motion.span
                              key={passwordStrength.text}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`text-xs font-semibold ${
                                passwordStrength.score <= 2
                                  ? 'text-red-500'
                                  : passwordStrength.score === 3
                                    ? 'text-yellow-600'
                                    : passwordStrength.score === 4
                                      ? 'text-blue-600'
                                      : 'text-green-600'
                              }`}
                            >
                              {passwordStrength.text}
                            </motion.span>
                          </div>
                          <div className="h-2 bg-sky-200 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                                passwordStrength.score <= 2
                                  ? 'from-red-500 to-red-400'
                                  : passwordStrength.score === 3
                                    ? 'from-orange-500 to-orange-400'
                                    : passwordStrength.score === 4
                                      ? 'from-blue-500 to-blue-400'
                                      : 'from-green-500 to-green-400'
                              }`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>

                          {/* Password Requirements */}
                          <div className="space-y-1">
                            {passwordStrength.requirements.map((req: any, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`text-xs flex items-center gap-1 ${
                                  req.test ? 'text-green-600' : 'text-gray-400'
                                }`}
                              >
                                <span
                                  className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                    req.test
                                      ? 'bg-green-100 text-green-600'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}
                                >
                                  {req.test ? '✓' : '○'}
                                </span>
                                {req.desc}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sky-800 font-semibold text-sm"
                      >
                        Konfirmasi Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Ulangi password"
                          disabled={isLoading}
                          {...register('confirmPassword')}
                          className={`bg-white/80 border-sky-200 text-sky-900 placeholder-sky-500 pr-12 focus:border-blue-400 focus:ring-blue-400/20 ${errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                        />
                        <motion.button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-sky-500 hover:text-sky-700 transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </motion.button>
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

                  {/* Terms Note */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                  >
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Dengan mendaftar, Anda setuju dengan syarat dan ketentuan yang berlaku untuk
                      penggunaan sistem Pelita Care.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
                    className="w-full space-y-4"
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sedang mendaftar...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Daftar
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <div className="text-center text-sm text-sky-700">
                      Sudah punya akun?{' '}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block"
                      >
                        <Link
                          href="/login"
                          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                          Login sekarang
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
