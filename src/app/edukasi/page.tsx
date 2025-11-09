'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Activity,
  Users,
  BookOpen,
  ArrowRight,
  Stethoscope,
  Heart,
  ShieldCheck,
} from 'lucide-react'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import educationData from '@/data/edukasi-penyakit-terminal.json'
import { EducationData } from '@/types/edukasi'
import '@/styles/modern-patterns.css'

export default function EducationPage() {
  const leftSectionRef = useRef(null)
  const leftSectionInView = useInView(leftSectionRef, { once: true, amount: 0.3 })

  const data = educationData as EducationData
  const diseases = data.edukasi_penyakit_terminal.diseases

  const stats = [
    { label: 'Tenaga Medis', value: '1000+', icon: Users },
    { label: 'Penyakit', value: diseases.length, icon: Stethoscope },
    { label: 'Kategori', value: new Set(diseases.map(d => d.category)).size, icon: Activity },
    { label: 'Materi', value: '24/7', icon: BookOpen },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Modern Animated Background with Multiple Layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent" />
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

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-8">
          <div className="text-center max-w-4xl mx-auto min-h-[calc(100vh-200px)] flex flex-col justify-center pb-24">
            {/* Modern Healthcare Badge */}
            <motion.div
              ref={leftSectionRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={leftSectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-white/90">Edukasi Kesehatan</span>
                </div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="space-y-6 mb-10"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <span className="text-white">Edukasi</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Penyakit Terminal
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
                Pelajari tentang 8 penyakit terminal dan cara perawatan paliatif yang tepat.
                Dapatkan informasi lengkap mengenai gejala, penyebab, faktor risiko, dan penanganannya.
              </p>
            </motion.div>

            {/* Call to Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={leftSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-base font-semibold group border-0 overflow-hidden"
                asChild
              >
                <Link href="#diseases">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Lihat Materi Edukasi</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-20">
        {/* Background Blur */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={leftSectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1, ease: 'easeOut' }}
                  className="text-center"
                >
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <Icon className="h-6 w-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-white/70">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Diseases Grid Section */}
      <section id="diseases" className="relative py-20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          {/* Section Header */}
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
                  <BookOpen className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 tracking-tight leading-tight">
              <span className="text-white">Materi</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Edukasi
              </span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Pelajari tentang berbagai penyakit terminal dan pemahaman mendalam mengenai gejala,
              penyebab, serta cara perawatan paliatif yang tepat.
            </p>
          </motion.div>

          {/* Diseases Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {diseases.map((disease, index) => (
              <motion.div
                key={disease.id}
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
                  <Link href={`/edukasi/${disease.slug}`}>
                    <div className="relative h-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer">
                      {/* Disease Name */}
                      <h3 className="text-xl font-bold text-white mb-3 text-center group-hover:text-blue-300 transition-colors duration-300">
                        {disease.name}
                      </h3>

                      {/* Description */}
                      <p className="text-white/70 leading-relaxed mb-4 text-sm line-clamp-3">
                        {typeof disease.definition === 'string'
                          ? disease.definition
                          : disease.definition.hiv
                        }
                      </p>

                      {/* Symptoms Count */}
                      <div className="flex items-center justify-center text-xs text-white/60 mb-4">
                        <span>
                          {Array.isArray(disease.symptoms)
                            ? `${disease.symptoms.length} gejala`
                            : 'Berbagai gejala'
                          }
                        </span>
                      </div>

                      {/* Button */}
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-5 py-2.5 font-medium border-0 w-full"
                        >
                          Pelajari
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional About Section */}
      <section className="relative py-20 overflow-hidden">
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
                <span className="text-white">Tentang</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Edukasi Kami
                </span>
              </h2>
              <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Materi edukasi komprehensif untuk mendukung pengguna dalam memberikan
                perawatan paliatif terbaik kepada pasien penyakit terminal.
              </p>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Pahami Penyakit Terminal
                  </h3>
                  <p className="text-white/70 leading-relaxed mb-6">
                    Pengetahuan yang tepat merupakan kunci dalam memberikan perawatan terbaik
                    bagi pasien dengan penyakit terminal. Materi edukasi kami dirancang untuk
                    memberikan pemahaman mendalam mengenai berbagai aspek penyakit.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Gejala & Tanda</h4>
                      <p className="text-white/70 text-sm">Pahami gejala awal hingga lanjutan untuk deteksi dini</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Penyebab & Risiko</h4>
                      <p className="text-white/70 text-sm">Identifikasi faktor penyebab dan risiko yang dapat dikendalikan</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Perawatan Paliatif</h4>
                      <p className="text-white/70 text-sm">Pelajari pendekatan holistik untuk kualitas hidup lebih baik</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="order-first lg:order-last"
              >
                <div className="relative max-w-md mx-auto">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20"></div>

                  {/* Card Content */}
                  <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 text-center">
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
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Card Title */}
                    <h3 className="text-xl font-bold text-white mb-4">Materi Terpercaya</h3>

                    {/* Key Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70 text-sm">Penyakit</span>
                        <span className="text-white font-semibold">{diseases.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70 text-sm">Kategori</span>
                        <span className="text-white font-semibold">{new Set(diseases.map(d => d.category)).size}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-white/70 text-sm">Akses</span>
                        <span className="text-white font-semibold">24/7</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 font-semibold"
                      asChild
                    >
                      <Link href="/">
                        Kembali ke Beranda
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
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