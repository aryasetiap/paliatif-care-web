'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  AlertTriangle,
  Users,
  Activity,
  ArrowRight,
  Heart,
  ShieldCheck,
} from 'lucide-react'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import educationData from '@/data/edukasi-penyakit-terminal.json'
import { EducationData, Disease, SymptomDisplay } from '@/types/edukasi'
import EducationSearch from '@/components/edukasi/education-search'
import '@/styles/modern-patterns.css'

export default function EducationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [disease, setDisease] = useState<Disease | null>(null)
  const [loading, setLoading] = useState(true)

  const handleSearchResultSelect = (selectedDisease: Disease) => {
    // Navigate to the selected disease detail page
    router.push(`/edukasi/${selectedDisease.slug}`)
  }

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      const { slug } = resolvedParams

      const data = educationData as EducationData
      const foundDisease = data.edukasi_penyakit_terminal.diseases.find((d) => d.slug === slug)
      setDisease(foundDisease || null)
      setLoading(false)
    }

    loadData()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400">
        <div className="text-sky-900 text-xl">Loading...</div>
      </div>
    )
  }

  if (!disease) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-sky-900 mb-4">Edukasi Tidak Ditemukan</h1>
          <Link href="/edukasi">
            <Button>Kembali ke Edukasi</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Helper function untuk format symptoms
  const formatSymptoms = (symptoms: Disease['symptoms']): SymptomDisplay[] => {
    if (Array.isArray(symptoms)) {
      return [{ category: 'Gejala Umum', items: symptoms }]
    }

    if ('tahapan' in symptoms) {
      return symptoms.tahapan.map((tahap) => ({
        category: tahap.tahap,
        items: [tahap.gejala],
      }))
    }

    const result: SymptomDisplay[] = []

    if (symptoms.utama) {
      result.push({ category: 'Gejala Utama', items: symptoms.utama })
    }
    if (symptoms.sisi_kiri) {
      result.push({ category: 'Gejala Sisi Kiri', items: symptoms.sisi_kiri })
    }
    if (symptoms.sisi_kanan) {
      result.push({ category: 'Gejala Sisi Kanan', items: symptoms.sisi_kanan })
    }

    return result
  }

  // Helper function untuk format risk factors
  const formatRiskFactors = (riskFactors: Disease['risk_factors']) => {
    if (!riskFactors) return null

    // Check if it's an array of objects with kategori property
    if (
      Array.isArray(riskFactors) &&
      riskFactors.length > 0 &&
      typeof riskFactors[0] === 'object' &&
      'kategori' in riskFactors[0]
    ) {
      return (riskFactors as Array<{ kategori: string; faktor: string }>).map((factor) => ({
        category: factor.kategori,
        items: [factor.faktor],
      }))
    }

    // Check if it's a simple array of strings
    if (Array.isArray(riskFactors)) {
      return [{ category: 'Faktor Risiko', items: riskFactors as string[] }]
    }

    // Check if it's an object with unchangeable/changeable properties
    if ('unchangeable' in riskFactors) {
      return [
        { category: 'Faktor Risiko Tidak Dapat Diubah', items: riskFactors.unchangeable || [] },
        { category: 'Faktor Risiko Dapat Diubah', items: riskFactors.changeable || [] },
      ]
    }

    return null
  }

  const formattedSymptoms = formatSymptoms(disease.symptoms)
  const formattedRiskFactors = formatRiskFactors(disease.risk_factors)

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

      {/* Floating Medical Icons */}
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
          <Heart className="w-16 h-16 text-sky-400/20" />
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
          <ShieldCheck className="w-20 h-20 text-sky-400/20" />
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
      <HeaderNav />

      {/* Quick Search Section */}
      <section className="relative py-8">
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-sky-900">Cari Penyakit Lain</h3>
              <p className="text-sm text-sky-700">Jelajahi informasi kesehatan lainnya</p>
            </div>
            <EducationSearch
              onResultSelect={handleSearchResultSelect}
              className="w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="relative pt-20 pb-16">
        {/* Background Blur */}
        <div className="absolute inset-0 bg-white/3 backdrop-blur-xl"></div>

        <div className="relative z-10 container mx-auto px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
                <span className="text-sky-900">Edukasi</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
                  {disease.name}
                </span>
              </h2>

              <p className="text-lg md:text-xl text-sky-700 max-w-3xl mx-auto leading-relaxed">
                Informasi lengkap mengenai {disease.name.toLowerCase()} untuk pemahaman yang lebih
                baik dalam perawatan paliatif.
              </p>
            </div>

            {/* Enhanced Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-white/85 backdrop-blur-lg border border-sky-300 rounded-xl p-6 hover:bg-white hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="h-5 w-5 text-blue-400" />
                      <h4 className="font-semibold text-sky-900">Kategori</h4>
                    </div>
                    <p className="text-sky-700 capitalize">{disease.category}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-white/85 backdrop-blur-lg border border-sky-300 rounded-xl p-6 hover:bg-white hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      <h4 className="font-semibold text-sky-900">Total Gejala</h4>
                    </div>
                    <p className="text-sky-700">
                      {formattedSymptoms.reduce((sum, group) => sum + group.items.length, 0)} gejala
                      teridentifikasi
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-white/85 backdrop-blur-lg border border-sky-300 rounded-xl p-6 hover:bg-white hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      <h4 className="font-semibold text-sky-900">Faktor Risiko</h4>
                    </div>
                    <p className="text-sky-700">
                      {formattedRiskFactors
                        ? `${formattedRiskFactors.reduce((sum, group) => sum + group.items.length, 0)} faktor risiko`
                        : 'Berbagai faktor risiko'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Key Information Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="relative mb-12"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg"></div>
              <div className="relative bg-white/95 backdrop-blur-lg border border-sky-300 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-sky-900 mb-6">Informasi Penting</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sky-800 font-semibold mb-3">Penyebab Utama</h4>
                    <div className="space-y-2">
                      {disease.causes.slice(0, 3).map((cause, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sky-700 text-sm">{cause}</p>
                        </div>
                      ))}
                      {disease.causes.length > 3 && (
                        <p className="text-sky-500 text-sm italic">
                          Dan {disease.causes.length - 3} penyebab lainnya...
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sky-800 font-semibold mb-3">Gejala Perhatian</h4>
                    <div className="space-y-2">
                      {formattedSymptoms[0]?.items.slice(0, 3).map((symptom, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sky-700 text-sm">{symptom}</p>
                        </div>
                      ))}
                      {formattedSymptoms[0]?.items.length > 3 && (
                        <p className="text-sky-500 text-sm italic">
                          Dan {formattedSymptoms[0].items.length - 3} gejala lainnya...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Symptoms Section */}
      <section id="symptoms" className="relative pt-20 pb-20">
        {/* Background Blur */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            {/* Section Header */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative bg-white/80 backdrop-blur-md border border-sky-300 rounded-full p-3">
                    <AlertTriangle className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
              </motion.div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
                <span className="text-sky-900">Gejala &amp; Tanda</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
                  {disease.name}
                </span>
              </h2>

              <p className="text-lg md:text-xl text-sky-700 max-w-3xl mx-auto leading-relaxed">
                Pahami berbagai gejala dan tanda yang muncul pada {disease.name.toLowerCase()}
                untuk deteksi dini dan penanganan yang tepat.
              </p>
            </div>

            {/* Symptoms Cards */}
            <div className="space-y-6">
              {formattedSymptoms.map((symptomGroup, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="relative">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>

                    {/* Card Content */}
                    <div className="relative bg-white/95 backdrop-blur-lg border border-sky-300 rounded-2xl p-6 hover:bg-white hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-500">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur-lg opacity-40"></div>
                          <div className="relative bg-white/80 backdrop-blur-md border border-sky-300 rounded-xl p-2">
                            <AlertTriangle className="h-6 w-6 text-orange-400" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-sky-900">{symptomGroup.category}</h3>
                      </div>

                      {/* Symptoms List */}
                      <div className="grid gap-3">
                        {symptomGroup.items.map((symptom, symptomIndex) => (
                          <div key={symptomIndex} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <p className="text-sky-700 leading-relaxed">{symptom}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Causes Section */}
      <section id="causes" className="relative pt-32 pb-20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-red-500/15 to-pink-500/15 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/15 to-red-500/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            {/* Section Header */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative bg-white/80 backdrop-blur-md border border-sky-300 rounded-full p-3">
                    <ShieldCheck className="h-8 w-8 text-red-400" />
                  </div>
                </div>
              </motion.div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
                <span className="text-sky-900">Penyebab</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-orange-400">
                  Utama
                </span>
              </h2>
            </div>

            {/* Causes Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>

                {/* Card Content */}
                <div className="relative bg-white/95 backdrop-blur-lg border border-sky-300 rounded-2xl p-8">
                  <div className="grid gap-4">
                    {disease.causes.map((cause, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <p className="text-sky-700 leading-relaxed">{cause}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Risk Factors Section */}
      {formattedRiskFactors && formattedRiskFactors.length > 0 && (
        <section id="risk-factors" className="relative pt-32 pb-20">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-blue-500/15 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              {/* Section Header */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                    <div className="relative bg-white/80 backdrop-blur-md border border-sky-300 rounded-full p-3">
                      <Users className="h-8 w-8 text-purple-400" />
                    </div>
                  </div>
                </motion.div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
                  <span className="text-sky-900">Faktor</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                    Risiko
                  </span>
                </h2>
              </div>

              {/* Risk Factors Cards */}
              <div className="space-y-6">
                {formattedRiskFactors.map((riskGroup, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="relative">
                      {/* Background Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>

                      {/* Card Content */}
                      <div className="relative bg-white/95 backdrop-blur-lg border border-sky-300 rounded-2xl p-6 hover:bg-white hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-500">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur-lg opacity-40"></div>
                            <div className="relative bg-white/80 backdrop-blur-md border border-sky-300 rounded-xl p-2">
                              <Users className="h-6 w-6 text-purple-400" />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-sky-900">{riskGroup.category}</h3>
                        </div>

                        {/* Risk Factors List */}
                        <div className="grid gap-3">
                          {riskGroup.items.map((factor, factorIndex) => (
                            <div key={factorIndex} className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <p className="text-sky-700 leading-relaxed">{factor}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* References Section */}
      {disease.references && disease.references.length > 0 && (
        <section id="references" className="relative pt-32 pb-20">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/15 to-green-500/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              {/* Section Header */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                    <div className="relative bg-white/80 backdrop-blur-md border border-sky-300 rounded-full p-3">
                      <BookOpen className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                </motion.div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
                  <span className="text-sky-900">Referensi</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                    Ilmiah
                  </span>
                </h2>
              </div>

              {/* References Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>

                  {/* Card Content */}
                  <div className="relative bg-white/95 backdrop-blur-lg border border-sky-300 rounded-2xl p-8">
                    <div className="space-y-3">
                      {disease.references.map((reference, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <p className="text-sky-700 leading-relaxed text-sm">{reference}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20"></div>

              {/* Card Content */}
              <div className="relative bg-white/95 backdrop-blur-md border border-sky-300 rounded-3xl p-8 md:p-12">
                {/* Icon */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex justify-center mb-8"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-white/90 backdrop-blur-md border border-sky-300 rounded-full p-4">
                      <Heart className="h-12 w-12 text-red-500" />
                    </div>
                  </div>
                </motion.div>

                <h2 className="text-3xl font-bold text-sky-900 mb-4">Pelajari Lebih Lanjut</h2>
                <p className="text-sky-700 mb-8 max-w-2xl mx-auto">
                  Terus tingkatkan pengetahuan Anda tentang perawatan paliatif untuk memberikan yang
                  terbaik bagi pasien penyakit terminal.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-base font-semibold group border-0 overflow-hidden"
                    asChild
                  >
                    <Link href="/edukasi">
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>Edukasi Lainnya</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    className="relative bg-sky-800/20 backdrop-blur-md border border-sky-600/30 text-white hover:bg-sky-800/30 shadow-lg hover:shadow-sky-800/20 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-base font-semibold group"
                    asChild
                  >
                    <Link href="/">
                      <div className="relative flex items-center">
                        Kembali ke Beranda
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </Link>
                  </Button>
                </div>
              </div>
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
