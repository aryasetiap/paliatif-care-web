'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, FileText, BookOpen, ArrowRight, Stethoscope, Heart, ShieldCheck } from 'lucide-react'
import HeaderNav from '@/components/ui/header-nav'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Home() {
  const leftSectionRef = useRef(null)
  const rightSectionRef = useRef(null)
  const leftSectionInView = useInView(leftSectionRef, { once: true, amount: 0.3 })
  const rightSectionInView = useInView(rightSectionRef, { once: true, amount: 0.3 })

  const features = [
    {
      icon: BookOpen,
      title: 'Edukasi',
      description: 'Materi edukasi 8 penyakit terminal untuk pengetahuan perawat.',
      href: '/edukasi',
      color: 'text-primary',
      bgColor: 'bg-primary-cream/60',
    },
    {
      icon: FileText,
      title: 'Skrining',
      description: 'Form skrining interaktif untuk assessmen kebutuhan paliatif pasien.',
      href: '/screening/new',
      color: 'text-primary',
      bgColor: 'bg-primary-cream/60',
    },
    {
      icon: Heart,
      title: 'Hasil',
      description: 'Analisis hasil skrining dengan rekomendasi intervensi.',
      href: '/dashboard',
      color: 'text-primary',
      bgColor: 'bg-primary-cream/60',
    },
    {
      icon: Users,
      title: 'Pasien',
      description: 'Manajemen data pasien dan riwayat skrining.',
      href: '/pasien',
      color: 'text-primary',
      bgColor: 'bg-primary-cream/60',
    },
  ]

  const stats = [
    { label: 'Penyakit Terminal', value: '8', icon: Stethoscope },
    { label: 'Form Skrining', value: '50+', icon: FileText },
    { label: 'Tenaga Medis', value: '1000+', icon: Users },
    { label: 'Pasien Terlayani', value: '5000+', icon: Heart },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden healthcare-gradient">
      {/* Healthcare Background Pattern - Applied to entire homepage */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Healthcare-Themed Floating Shapes - Applied to entire homepage */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-cream/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary-light/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-primary-cream/30 rounded-full blur-3xl"></div>

      {/* Hero Section with Healthcare Theme */}
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
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-gray-900 lg:text-left text-center"
            >
              {/* Professional Healthcare Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={leftSectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="flex mb-8 lg:justify-start justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 healthcare-gradient rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-white shadow-xl border border-primary/20 rounded-3xl p-6">
                    <Heart className="h-12 w-12 text-primary" />
                  </div>
                </div>
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-6 mb-12">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight"
                >
                  Pelita
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white">
                    Care
                  </span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-white/90">
                    Pemetaan Layanan Paliatif Berbasis ESAS
                  </h2>
                  <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Membantu tenaga medis memberikan perawatan paliatif terbaik
                    untuk pasien penyakit terminal melalui edukasi dan skrining terstandar.
                  </p>
                </motion.div>
              </div>

              {/* Call to Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-6 items-center lg:items-start justify-center lg:justify-start"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-light hover:from-primary/90 hover:to-primary-light/90 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold w-full sm:w-auto group border-0"
                  asChild
                >
                  <Link href="/screening/new">
                    <Activity className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    Mulai Screening
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-light hover:from-primary/90 hover:to-primary-light/90 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold w-full sm:w-auto group border-0"
                  asChild
                >
                  <Link href="/edukasi">
                    <BookOpen className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Lihat Edukasi
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div
              ref={rightSectionRef}
              initial={{ opacity: 0, x: 50 }}
              animate={rightSectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="relative flex justify-center items-center mt-12 lg:mt-0"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
                animate={rightSectionInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: 30 }}
                transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                className="relative"
              >
                {/* Image Container */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={rightSectionInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                  className="relative rounded-3xl overflow-hidden shadow-2xl group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Medical Team"
                    className="w-full max-w-sm md:max-w-md lg:max-w-lg rounded-3xl object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent rounded-3xl group-hover:from-primary/90 transition-all duration-500"></div>
                </motion.div>

                {/* Floating Stats Cards */}
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: 20, y: -20 }}
                  animate={rightSectionInView ? { opacity: 1, scale: 1, x: 0, y: 0 } : { opacity: 0, scale: 0, x: 20, y: -20 }}
                  transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
                  className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 bg-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-white mb-1">8</div>
                    <div className="text-xs lg:text-sm text-white/80">Penyakit Terminal</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0, x: -20, y: 20 }}
                  animate={rightSectionInView ? { opacity: 1, scale: 1, x: 0, y: 0 } : { opacity: 0, scale: 0, x: -20, y: 20 }}
                  transition={{ duration: 0.6, delay: 1.3, ease: "easeOut" }}
                  className="absolute -bottom-2 -left-2 lg:-bottom-4 lg:-left-4 bg-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-white mb-1">24/7</div>
                    <div className="text-xs lg:text-sm text-white/80">Support</div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Trust Indicators - Below Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
            className="mt-8 lg:mt-12 mb-16 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={leftSectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 1.6 + index * 0.1, ease: "easeOut" }}
                  className="text-center"
                >
                  <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-white/30 hover:shadow-xl transition-all duration-300 group">
                    <Icon className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Decorative Elements - Removed gradient overlay */}
      </section>

      {/* Features Section with Healthcare Theme */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <div className="bg-white/90 backdrop-blur-sm healthcare-gradient rounded-2xl p-3 shadow-lg border border-white/30">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Fitur <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white">Unggulan</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Solusi lengkap untuk kebutuhan edukasi dan skrining paliatif
              dalam satu platform terintegrasi yang modern dan mudah digunakan.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border border-white/30">
                  {/* Gradient Border */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>

                  <CardHeader className="text-center pb-6 relative">
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bgColor} mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-primary/20 healthcare-gradient`}>
                      <Icon className={`h-8 w-8 text-white`} />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-center pb-8 relative">
                    <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-primary-light hover:from-primary/90 hover:to-primary-light/90 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
                      asChild
                    >
                      <Link href={feature.href}>
                        Pelajari lebih lanjut
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with Healthcare Theme */}
      <section id="about" className="relative py-32 overflow-hidden mt-0">

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <Card className="max-w-5xl mx-auto bg-gradient-to-br from-white/95 to-primary-cream/30 backdrop-blur-sm shadow-2xl border border-white/30 rounded-3xl">
            <CardContent className="p-12 md:p-16 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 healthcare-gradient rounded-2xl blur-xl opacity-30"></div>
                  <div className="relative bg-white shadow-xl border border-primary/20 rounded-2xl p-4">
                    <ShieldCheck className="h-12 w-12 text-primary" />
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-6 mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                  Siap Meningkatkan Kualitas
                  <span className="block text-transparent bg-clip-text healthcare-gradient">
                    Perawatan Paliatif?
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Bergabunglah dengan ribuan tenaga medis yang telah menggunakan
                  PelitaCare untuk memberikan perawatan terbaik bagi pasien mereka.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gradient-to-r hover:from-primary hover:to-primary-light hover:text-white hover:border-transparent shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-10 py-4 text-lg font-bold border-2 border-primary/30"
                  asChild
                >
                  <Link href="/register">
                    Daftar Sekarang
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-light hover:from-primary/90 hover:to-primary-light/90 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-10 py-4 text-lg font-bold border-0"
                  asChild
                >
                  <Link href="/login">
                    Masuk ke Akun
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                  <div className="text-gray-600">Tenaga Medis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">5000+</div>
                  <div className="text-gray-600">Pasien Terlayani</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">98%</div>
                  <div className="text-gray-600">Kepuasan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
