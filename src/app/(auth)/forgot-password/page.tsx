'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

  const onSubmit = async () => {
    setIsLoading(true)

    try {
      // Simulasi API call - akan diintegrasikan dengan Supabase
      await new Promise(resolve => setTimeout(resolve, 1500))

      setIsSubmitted(true)
      toast({
        title: 'Email terkirim',
        description: 'Instruksi reset password telah dikirim ke email Anda.',
      })
    } catch {
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
      <div className="relative overflow-hidden min-h-screen">
        {/* Modern Animated Background - Same as Login/Register */}
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
            className="absolute top-20 left-10 opacity-10"
          >
            <Mail className="w-16 h-16 text-white/20" />
          </motion.div>
        </div>

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
                  <Mail className="h-8 w-8 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight leading-tight text-white mb-2">
                Pelita
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-400">
                  Care
                </span>
              </h1>
              <p className="text-white/70 text-base">
                Email Terkirim
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
                <div className="absolute -inset-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-30"></div>

                {/* Form Content */}
                <div className="relative bg-white/10 border border-white/10 rounded-2xl p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                    className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 mb-6"
                  >
                    <p className="text-sm text-green-200 leading-relaxed text-center">
                      Kami telah mengirimkan link reset password ke alamat email Anda.
                      Silakan periksa inbox dan folder spam Anda.
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
      {/* Modern Animated Background - Same as Login/Register */}
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
          className="absolute top-20 left-10 opacity-10"
        >
          <Mail className="w-16 h-16 text-white/20" />
        </motion.div>
      </div>

      {/* Forgot Password Form */}
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
              Lupa Password
            </p>
          </motion.div>

          {/* Forgot Password Form Card */}
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
                  </div>

                  {/* Info Note */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4"
                  >
                    <p className="text-xs text-blue-200 leading-relaxed">
                      Masukkan email yang terdaftar pada akun Anda. Kami akan mengirimkan link untuk mereset password Anda.
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
                            Mengirim email...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Kirim Instruksi Reset
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <div className="text-center text-sm text-white/70">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                        <Link
                          href="/login"
                          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors inline-flex items-center"
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