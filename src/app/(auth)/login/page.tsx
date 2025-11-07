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
    } catch {
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
    <div className="min-h-screen subtle-gradient-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 modern-gradient"></div>
      </div>

      {/* Floating Elements for Modern Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl"
        />
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="enhanced-card p-1 micro-interaction">
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
                <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  disabled={isLoading}
                  {...register('email')}
                  className={`modern-input ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
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
                <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    disabled={isLoading}
                    {...register('password')}
                    className={`modern-input pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
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
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
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
                  className="w-full h-12 modern-button healthcare-gradient hover:from-primary/90 hover:to-primary-light/90 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl"
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
              </motion.div>

                <div className="flex flex-col space-y-4 text-center">
                  <div className="text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                      <Link
                        href="/register"
                        className="text-primary hover:text-primary/80 font-semibold transition-colors text-gradient-primary"
                      >
                        Daftar sekarang
                      </Link>
                    </motion.div>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-gray-500 hover:text-primary transition-colors"
                    >
                      Lupa password?
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </CardFooter>
          </motion.form>
        </Card>
      </motion.div>
    </div>
  )
}