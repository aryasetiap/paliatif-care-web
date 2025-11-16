'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/stores/authStore'
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import AuthLayout from '@/components/auth/AuthLayout'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login, userRole } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const getRoleBasedRedirect = (role: string | null) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard'
      case 'perawat':
        return '/dashboard'
      case 'pasien':
        return '/pasien/dashboard'
      default:
        return '/dashboard' // fallback
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // Login dengan Supabase menggunakan authStore
      await login(data.email, data.password)

      toast({
        title: 'Login berhasil',
        description: `Selamat datang kembali${userRole ? ` sebagai ${userRole}` : ''}!`,
      })

      // Redirect ke dashboard berdasarkan role setelah login berhasil
      const redirectPath = getRoleBasedRedirect(userRole)
      router.push(redirectPath)
    } catch (error) {
      toast({
        title: 'Login gagal',
        description: error instanceof Error ? error.message : 'Email atau password salah',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Masuk ke akun Anda untuk melanjutkan"
      showBackButton={false}
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
                placeholder="Masukkan password"
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
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-sky-300 rounded"
            />
            <Label htmlFor="remember" className="text-xs sm:text-sm text-sky-700">
              Ingat saya
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Lupa password?
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
                  Masuk...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
          className="text-center"
        >
          <p className="text-xs sm:text-sm text-sky-700">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </AuthLayout>
  )
}
