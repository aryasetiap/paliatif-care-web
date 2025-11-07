'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, ArrowLeft, Stethoscope } from 'lucide-react'
import { motion } from 'framer-motion'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

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
    setIsLoading(true)

    try {
      // Simulasi API call - akan diintegrasikan dengan Supabase
      await new Promise(resolve => setTimeout(resolve, 1500))

      setIsSubmitted(true)
      toast({
        title: 'Email terkirim',
        description: 'Instruksi reset password telah dikirim ke email Anda.',
      })
    } catch (error) {
      toast({
        title: 'Gagal mengirim email',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Background Image with Enhanced Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-indigo-900/75 to-purple-900/85" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <Card className="shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="space-y-4 text-center pb-8">
              {/* Icon with Glass Morphism */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                    <Mail className="h-10 w-10 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="space-y-2"
              >
                <CardTitle className="text-3xl font-bold text-white tracking-tight">
                  Pelita
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-200">
                    Care
                  </span>
                </CardTitle>
                <CardDescription className="text-white/80 text-base">
                  Email Terkirim
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-50/10 to-indigo-50/10 p-6 rounded-lg border border-blue-100/30 text-center"
              >
                <p className="text-sm text-blue-200 leading-relaxed">
                  Kami telah mengirimkan link reset password ke alamat email Anda.
                  Silakan periksa inbox dan folder spam Anda.
                </p>
              </motion.div>
            </CardContent>

            <CardFooter className="px-8 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                className="w-full"
              >
                <Button
                  asChild
                  className="w-full h-12 bg-white text-blue-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold rounded-xl"
                >
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Login
                  </Link>
                </Button>
              </motion.div>
            </CardFooter>
          </Card>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
            className="text-center mt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center text-white/80 hover:text-white transition-colors group"
            >
              <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Beranda
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image with Enhanced Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-indigo-900/75 to-purple-900/85" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Forgot Password Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Card className="shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader className="space-y-4 text-center pb-8">
            {/* Icon with Glass Morphism */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                  <Stethoscope className="h-10 w-10 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="space-y-2"
            >
              <CardTitle className="text-3xl font-bold text-white tracking-tight">
                Pelita
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                  Care
                </span>
              </CardTitle>
              <CardDescription className="text-white/80 text-base">
                Lupa Password
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
                <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  disabled={isLoading}
                  {...register('email')}
                  className={`h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20 focus:bg-white/15 transition-all duration-300 ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-300 flex items-center gap-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="bg-amber-50/10 border border-amber-100/30 rounded-lg p-4">
                <p className="text-sm text-amber-200 leading-relaxed">
                  Masukkan email yang terdaftar pada akun Anda. Kami akan mengirimkan link untuk mereset password Anda.
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
                  className="w-full h-12 bg-white text-blue-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim email...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Kirim Instruksi Reset
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-white/80 hover:text-white inline-flex items-center font-medium transition-colors"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Kembali ke Login
                  </Link>
                </div>
              </motion.div>
            </CardFooter>
          </motion.form>
        </Card>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
          className="text-center mt-8"
        >
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Beranda
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}