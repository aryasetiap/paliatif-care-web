'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

  const onSubmit = async (data: RegisterFormData) => {
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
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-primary-cream via-blue-50/30 to-sky-50/20 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236280BA' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Register Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-6 text-center pb-8 pt-8">
            {/* Professional Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex justify-center"
            >
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="space-y-2"
            >
              <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
                Pelita
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Care
                </span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Pemetaan Layanan Paliatif Berbasis ESAS
              </CardDescription>
            </motion.div>
          </CardHeader>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 font-medium">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  disabled={isLoading}
                  {...register('fullName')}
                  className={`h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  disabled={isLoading}
                  {...register('email')}
                  className={`h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    disabled={isLoading}
                    {...register('password')}
                    className={`h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 pr-12 transition-all duration-200 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    {errors.password.message}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Kekuatan Password:</span>
                      <span className="text-xs text-gray-500">{passwordStrength.text}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    disabled={isLoading}
                    {...register('confirmPassword')}
                    className={`h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 pr-12 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-700 leading-relaxed">
                  Dengan mendaftar, Anda setuju dengan syarat dan ketentuan yang berlaku untuk penggunaan sistem Pelita Care.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                className="w-full space-y-4"
              >
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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

                <div className="text-center text-sm text-gray-600">
                  Sudah punya akun?{' '}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Login sekarang
                  </Link>
                </div>
              </motion.div>
            </CardFooter>
          </motion.form>
        </Card>
      </motion.div>
    </div>
  )
}