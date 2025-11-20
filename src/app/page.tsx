'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Activity,
  FileText,
  BookOpen,
  ArrowRight,
  Stethoscope,
  Heart,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useRouter } from 'next/navigation'
import '@/styles/modern-patterns.css'

export default function Home() {
  const leftSectionRef = useRef(null)
  const rightSectionRef = useRef(null)
  const leftSectionInView = useInView(leftSectionRef, { once: true, amount: 0.3 })
  const rightSectionInView = useInView(rightSectionRef, { once: true, amount: 0.3 })
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  // Handle screening click
  const handleScreeningClick = () => {
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      router.push('/screening/new')
    }
  }

  const features = [
    {
      icon: FileText,
      title: 'Skrining',
      description: 'Kenali kebutuhan fisik, emosional, dan sosial Anda secara holistik.',
      href: '/screening/new',
      color: 'text-primary',
      bgColor: 'bg-primary-cream/60',
    },
    {
      icon: Heart,
      title: 'Hasil',
      description: 'Analisis hasil skrining dengan rekomendasi intervensi yang terpercaya.',
      href: '/dashboard',
      color: 'text-primary',
      bgColor: 'bg-primary-cream/60',
    },
    {
      icon: Sparkles,
      title: 'Terapi',
      description: 'Pilihan terapi komplementer untuk meningkatkan kualitas hidup anda.',
      href: '/terapi',
      color: 'text-primary',
      bgColor: 'bg-primary-cream/60',
    },
    {
      icon: BookOpen,
      title: 'Edukasi',
      description: 'Materi edukasi 8 penyakit terminal untuk pengetahuan anda.',
      href: '/edukasi',
      color: 'text-primary',
      bgColor: 'bg-primary-cream/60',
    },
  ]

  const stats = [
    { label: 'Pasien Terlayani', value: '5000+', icon: Heart },
    { label: 'Terapi Pilihan', value: '20+', icon: Activity },
    { label: 'Penyakit Terminal', value: '8', icon: Stethoscope },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Modern Animated Background with Multiple Layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400" />
      <div className="fixed inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Floating Medical Icons - Modern Healthcare Theme */}
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
          className="absolute top-20 left-10 opacity-10"
        >
          <Heart className="w-16 h-16 text-white/20" />
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
          className="absolute top-40 right-20 opacity-10"
        >
          <Stethoscope className="w-20 h-20 text-white/20" />
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
          className="absolute bottom-40 left-20 opacity-10"
        >
          <ShieldCheck className="w-16 h-16 text-white/20" />
        </motion.div>
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
          animation: 'slide 20s linear infinite',
        }}
      />

      {/* Hero Section with Modern Healthcare Theme */}
      <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-24 lg:pt-32">
        {/* Navigation */}
        <HeaderNav />

        {/* Hero Content - Left Text, Right Image */}
        <div className="relative z-10 container mx-auto px-4 pt-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-140px)] lg:min-h-[calc(100vh-160px)] pb-24">
            {/* Left Side - Text Content */}
            <motion.div
              ref={leftSectionRef}
              initial={{ opacity: 0, x: -50 }}
              animate={leftSectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-sky-900 lg:text-left text-center gpu-accelerated"
            >
              {/* Modern Healthcare Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={leftSectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="flex mb-8 lg:justify-start justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-white/80 backdrop-blur-md border border-blue-200 rounded-full px-6 py-3 flex items-center space-x-2 shadow-lg">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-sky-800">Healthcare Excellence</span>
                  </div>
                </div>
              </motion.div>

              {/* Main Heading - Professional & Balanced Typography */}
              <div className="space-y-6 mb-10">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Sihat
                  </span>
                </motion.h1>{' '}
                {/* Remaining Stats Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  <p className="text-lg md:text-xl text-sky-700 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    SIHAT adalah Skrining Informasi Holistik Asuhan Paliatif Terpadu dengan
                    pendekatan holistik yang bertujuan untuk meningkatkan kenyamanan serta
                    ketenangan pasien dan keluarga dengan cara mengurangi ketidaknyamanan pasien
                    melalui pengkajian yang tepat, seperti penatalaksanaan nyeri, manajemen gejala,
                    dan dukungan psikososial maupun spiritual.
                  </p>
                </motion.div>
              </div>

              {/* Professional Call to Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-4 items-center lg:items-start justify-center lg:justify-start"
              >
                {isAuthenticated ? (
                  <>
                    <Button
                      size="lg"
                      className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-base font-semibold w-full sm:w-auto group border-0 overflow-hidden"
                      onClick={handleScreeningClick}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <Activity className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Mulai Screening</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </Button>

                    <Button
                      size="lg"
                      className="relative bg-sky-800/20 backdrop-blur-md border border-sky-600/30 text-white hover:bg-sky-800/30 shadow-lg hover:shadow-sky-800/20 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-base font-semibold w-full sm:w-auto group"
                      asChild
                    >
                      <Link href="/dashboard">
                        <div className="relative flex items-center">
                          <User className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                          <span>Dashboard</span>
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-base font-semibold w-full sm:w-auto group border-0 overflow-hidden"
                      onClick={handleScreeningClick}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <Activity className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Mulai Screening</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </Button>

                    <Button
                      size="lg"
                      className="relative bg-sky-800/20 backdrop-blur-md border border-sky-600/30 text-white hover:bg-sky-800/30 shadow-lg hover:shadow-sky-800/20 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-base font-semibold w-full sm:w-auto group"
                      asChild
                    >
                      <Link href="/register">
                        <div className="relative flex items-center">
                          <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                          <span>Daftar Sekarang</span>
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </Link>
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Right Side - Modern Image Gallery */}
            <motion.div
              ref={rightSectionRef}
              initial={{ opacity: 0, x: 50 }}
              animate={rightSectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
              className="relative flex justify-center items-center mt-12 lg:mt-0"
            >
              <div className="relative w-full max-w-md lg:max-w-lg">
                {/* Main Image - Professional Healthcare Photo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    rightSectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
                  }
                  transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                  className="relative"
                >
                  <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-sky-800/10 backdrop-blur-md border border-sky-600/20 rounded-2xl p-1.5">
                    <Image
                      src="/assets/hero-image.jpg"
                      alt="Healthcare Professional with Patient"
                      width={600}
                      height={450}
                      className="w-full rounded-xl object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements - Removed gradient overlay */}
      </section>

      {/* Professional Features Section */}
      <section id="features" className="relative py-20">
        {/* Background Blur */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>

        <div className="relative z-10 container mx-auto px-4">
          {/* Professional Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>

            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 tracking-tight leading-tight">
              <span className="text-sky-900">Fitur</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Unggulan
              </span>
            </h2>
            <p className="text-lg md:text-xl text-sky-700 max-w-3xl mx-auto leading-relaxed">
              Platform terintegrasi dengan teknologi terkini untuk mendukung pengguna memberikan
              perawatan paliatif terbaik dan berstandar internasional.
            </p>
          </motion.div>

          {/* Professional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="relative h-full">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>

                    {/* Card Content */}
                    <div className="relative h-full bg-white/95 backdrop-blur-lg border border-sky-300 rounded-2xl p-6 hover:bg-white hover:shadow-xl hover:shadow-sky-500/20 transition-all duration-500 hover:scale-105">
                      {/* Icon Container */}
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 mx-auto shadow-lg border-2 border-white"
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-sky-900 mb-3 text-center group-hover:text-blue-600 transition-colors duration-300">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sky-700 leading-relaxed mb-6 text-center">
                        {feature.description}
                      </p>

                      {/* Button */}
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-5 py-2.5 font-medium border-0"
                          onClick={() => {
                            if (feature.title === 'Skrining') {
                              handleScreeningClick()
                            } else {
                              router.push(feature.href)
                            }
                          }}
                        >
                          <span>Mulai</span>
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Professional Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
          className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mt-8 lg:mt-10 mb-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={leftSectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 1.6 + index * 0.1, ease: 'easeOut' }}
                className="text-center"
              >
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-white/85 backdrop-blur-lg border border-sky-300 rounded-xl p-3 sm:p-4 hover:bg-white hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-lg sm:text-xl font-bold text-sky-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-sky-700">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Professional About Section */}
      <section id="about" className="relative py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
                <span className="text-sky-900">Tentang</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  Sihat
                </span>
              </h2>
              <p className="text-lg md:text-xl text-sky-700 max-w-3xl mx-auto leading-relaxed">
                Platform inovatif yang mengubah cara perawatan paliatif disampaikan di Indonesia,
                menggabungkan teknologi modern dengan sentuhan kemanusiaan.
              </p>
            </div>

            {/* About Content - Left Card, Right Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Professional Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="relative max-w-md mx-auto lg:mx-0">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20"></div>

                  {/* Card Content */}
                  <div className="relative bg-white/95 backdrop-blur-md border border-sky-300 rounded-2xl p-6 md:p-8 text-center shadow-lg">
                    {/* Icon with Animation */}
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="flex justify-center mb-6"
                    >
                      <div className="relative">
                        <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-3 shadow-xl border border-white/20">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Card Title */}
                    <h3 className="text-xl font-bold text-sky-900 mb-4">Transformasi Digital</h3>

                    {/* Key Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-sky-200">
                        <span className="text-sky-600 text-sm">Pasien Terlayani</span>
                        <span className="text-sky-900 font-semibold">5000+</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-sky-200">
                        <span className="text-sky-600 text-sm">Terapi Pilihan</span>
                        <span className="text-sky-900 font-semibold">20+</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sky-600 text-sm">Penyakit Terminal</span>
                        <span className="text-sky-900 font-semibold">8</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 font-semibold"
                      onClick={() => {
                        if (isAuthenticated) {
                          router.push('/screening/new')
                        } else {
                          router.push('/register')
                        }
                      }}
                    >
                      {isAuthenticated ? 'Mulai Screening' : 'Mulai Sekarang'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Right: Detailed Description */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="order-1 lg:order-2 space-y-6"
              >
                <div className="space-y-6">
                  {/* Main Description */}
                  <div>
                    <h3 className="text-2xl font-bold text-sky-900 mb-4">
                      Revolusi Perawatan Paliatif Indonesia
                    </h3>
                    <p className="text-sky-700 leading-relaxed">
                      SIHAT adalah Skrining Informasi Holistik Asuhan Paliatif Terpadu dengan
                      pendekatan holistik yang bertujuan untuk meningkatkan kenyamanan serta
                      ketenangan pasien dan keluarga dengan cara mengurangi ketidaknyamanan pasien
                      melalui pengkajian yang tepat, seperti penatalaksanaan nyeri, manajemen
                      gejala, dan dukungan psikososial maupun spiritual.
                    </p>
                  </div>

                  {/* Mission Statement */}
                  <div className="bg-sky-100 border border-sky-200 rounded-xl p-4">
                    <h4 className="text-sky-800 font-semibold mb-2">Misi Kami</h4>
                    <p className="text-sky-700 text-sm leading-relaxed">
                      Memberikan akses perawatan paliatif berkualitas tinggi kepada semua pasien
                      yang membutuhkan, dengan dukungan teknologi yang memudahkan pengguna
                      memberikan perawatan terbaik dan berkesinambungan.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Spacer before footer */}
      <div className="h-16"></div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
