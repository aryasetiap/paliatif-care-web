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
import { Loader2, Eye, EyeOff, UserPlus, Stethoscope } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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

  const onSubmit = async () => {
    setIsLoading(true)

    try {
      // Simulasi API call - akan diintegrasikan dengan Supabase
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulasi registrasi berhasil
      toast({
        title: 'Registrasi berhasil',
        description: 'Akun Anda telah dibuat. Silakan login.',
      })

      // Redirect ke login setelah registrasi berhasil
      router.push('/login')
    } catch {
      toast({
        title: 'Registrasi gagal',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' }

    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z\d]/.test(password)) score++

    const levels = [
      { text: 'Sangat Lemah', color: 'bg-red-500' },
      { text: 'Lemah', color: 'bg-orange-500' },
      { text: 'Sedang', color: 'bg-yellow-500' },
      { text: 'Kuat', color: 'bg-blue-500' },
      { text: 'Sangat Kuat', color: 'bg-green-500' },
    ]

    return { score, ...levels[score] }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Modern Animated Background - Same as Homepage */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent" />
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Animated Grid Pattern */}
      <div
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'slide 20s linear infinite'
        }}
      />

      {/* Floating Medical Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-10 opacity-10"
        >
          <Stethoscope className="w-16 h-16 text-white/20" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-40 left-20 opacity-10"
        >
          <UserPlus className="w-20 h-20 text-white/20" />
        </motion.div>
      </div>

      {/* Register Form */}
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
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight leading-tight text-white mb-2">
              Pelita
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Care
              </span>
            </h1>
            <p className="text-white/70 text-base">
              Pemetaan Layanan Paliatif Berbasis ESAS
            </p>
          </motion.div>

          {/* Register Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-30"></div>

              {/* Form Content */}
              <div className="relative bg-white/10 border border-white/10 rounded-2xl p-6">
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white/90 font-semibold text-sm">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        disabled={isLoading}
                        {...register('fullName')}
                        className={`bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-blue-400/20 ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                      />
                      {errors.fullName && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-400 flex items-center gap-1"
                        >
                          {errors.fullName.message}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/90 font-semibold text-sm">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        disabled={isLoading}
                        {...register('email')}
                        className={`bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-blue-400/20 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-400 flex items-center gap-1"
                        >
                          {errors.email.message}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white/90 font-semibold text-sm">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Minimal 6 karakter"
                          disabled={isLoading}
                          {...register('password')}
                          className={`bg-white/10 border border-white/20 text-white placeholder-white/50 pr-12 focus:border-blue-400 focus:ring-blue-400/20 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                        />
                        <motion.button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors"
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
                          className="text-sm text-red-400 flex items-center gap-1"
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
                            <span className="text-xs text-white/70 font-semibold">Kekuatan Password:</span>
                            <motion.span
                              key={passwordStrength.text}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`text-xs font-semibold ${
                                passwordStrength.score <= 1 ? 'text-red-400' :
                                passwordStrength.score === 2 ? 'text-yellow-400' :
                                passwordStrength.score === 3 ? 'text-blue-400' : 'text-green-400'
                              }`}
                            >
                              {passwordStrength.text}
                            </motion.span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                                passwordStrength.score <= 1 ? 'from-red-500 to-red-400' :
                                passwordStrength.score === 2 ? 'from-orange-500 to-orange-400' :
                                passwordStrength.score === 3 ? 'from-blue-500 to-blue-400' : 'from-green-500 to-green-400'
                              }`}
                              style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white/90 font-semibold text-sm">Konfirmasi Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Ulangi password"
                          disabled={isLoading}
                          {...register('confirmPassword')}
                          className={`bg-white/10 border border-white/20 text-white placeholder-white/50 pr-12 focus:border-blue-400 focus:ring-blue-400/20 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                        />
                        <motion.button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors"
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
                          className="text-sm text-red-400 flex items-center gap-1"
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
                    className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4"
                  >
                    <p className="text-xs text-blue-200 leading-relaxed">
                      Dengan mendaftar, Anda setuju dengan syarat dan ketentuan yang berlaku untuk penggunaan sistem Pelita Care.
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

                    <div className="text-center text-sm text-white/70">
                      Sudah punya akun?{' '}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                        <Link
                          href="/login"
                          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
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