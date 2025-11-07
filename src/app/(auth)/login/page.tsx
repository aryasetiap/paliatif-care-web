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
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Eye, EyeOff, Stethoscope } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // Simulasi API call - akan diintegrasikan dengan Supabase
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulasi validasi kredensial
      if (data.email === 'nurse@example.com' && data.password === 'Password123') {
        toast({
          title: 'Login berhasil',
          description: 'Selamat datang kembali!',
        })

        // Redirect ke dashboard setelah login berhasil
        router.push('/dashboard')
      } else {
        toast({
          title: 'Login gagal',
          description: 'Email atau password salah. Silakan coba lagi.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal melakukan login. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-cream via-blue-50/30 to-sky-50/20 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236280BA' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-primary/20 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-6 text-center pb-8 pt-8">
            {/* Professional Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex justify-center"
            >
              <div className="h-16 w-16 healthcare-gradient rounded-2xl flex items-center justify-center shadow-lg">
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
                <span className="block text-transparent bg-clip-text healthcare-gradient">
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
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  disabled={isLoading}
                  {...register('email')}
                  className={`h-12 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
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
                    placeholder="Masukkan password"
                    disabled={isLoading}
                    {...register('password')}
                    className={`h-12 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 pr-12 transition-all duration-200 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
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
                  className="w-full h-12 healthcare-gradient hover:from-primary/90 hover:to-primary-light/90 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sedang login...
                    </>
                  ) : (
                    <>
                      Login
                    </>
                  )}
                </Button>

                <div className="flex flex-col space-y-3 text-center">
                  <div className="text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link
                      href="/register"
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Daftar sekarang
                    </Link>
                  </div>

                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    Lupa password?
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