'use client'

import Link from 'next/link'
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Activity,
  ShieldCheck,
  FileText,
  Users,
  BookOpen,
  Stethoscope
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const footerSections = {
  layanan: [
    {
      name: 'Edukasi Paliatif',
      href: '/edukasi',
      description: 'Panduan lengkap perawatan paliatif'
    },
    {
      name: 'Skrining ESAS',
      href: '/screening/new',
      description: 'Asesmen symptom pasien'
    },
    {
      name: 'Dashboard Medis',
      href: '/dashboard',
      description: 'Kelola pasien dan data'
    },
  ],
  perusahaan: [
    {
      name: 'Tentang PelitaCare',
      href: '/about',
      description: 'Misi dan visi kami'
    },
    {
      name: 'Hubungi Kami',
      href: '/contact',
      description: 'Kontak dan lokasi'
    },
  ],
  informasi: [
    {
      name: 'Panduan Penggunaan',
      href: '/guide',
      description: 'Cara menggunakan platform'
    },
    {
      name: 'Kebijakan Privasi',
      href: '/privacy',
      description: 'Perlindungan data Anda'
    },
    {
      name: 'Syarat & Ketentuan',
      href: '/terms',
      description: 'Aturan penggunaan'
    },
  ],
}

const certifications = [
  {
    icon: ShieldCheck,
    label: 'ISO 27001',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10'
  },
  {
    icon: FileText,
    label: 'HIPAA Compliant',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10'
  },
  {
    icon: Users,
    label: 'Kemenkes Terdaftar',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10'
  },
]

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="relative bg-slate-900 border-t border-white/10">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent" />

      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section - 2 columns on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-3 border border-white/20">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Pelita</h3>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">
                  Care
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/70 leading-relaxed max-w-md">
              Platform digital inovatif untuk perawatan paliatif berbasis ESAS yang membantu tenaga medis memberikan perawatan terbaik dan berkesinambungan bagi pasien penyakit terminal.
            </p>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">1000+</div>
                <div className="text-xs text-white/60 mt-1">Tenaga Medis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">5000+</div>
                <div className="text-xs text-white/60 mt-1">Pasien Terlayani</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">98%</div>
                <div className="text-xs text-white/60 mt-1">Kepuasan</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${certifications[0].bgColor}`}>
                  <Mail className={`h-4 w-4 ${certifications[0].color}`} />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Email</div>
                  <div className="text-white/60 text-sm">info@peliacare.id</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${certifications[1].bgColor}`}>
                  <Phone className={`h-4 w-4 ${certifications[1].color}`} />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Telepon</div>
                  <div className="text-white/60 text-sm">+62 21 5555 1234</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${certifications[2].bgColor}`}>
                  <MapPin className={`h-4 w-4 ${certifications[2].color}`} />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Lokasi</div>
                  <div className="text-white/60 text-sm">Jakarta, Indonesia</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Layanan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h4 className="text-lg font-semibold text-white flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
              Layanan Kami
            </h4>
            <ul className="space-y-4">
              {footerSections.layanan.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={item.href}
                    className="block group"
                  >
                    <div className="text-white/90 font-medium group-hover:text-blue-400 transition-colors duration-200">
                      {item.name}
                    </div>
                    <div className="text-white/50 text-sm mt-1">
                      {item.description}
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Perusahaan & Informasi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Perusahaan */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Perusahaan</h4>
              <ul className="space-y-3">
                {footerSections.perusahaan.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={item.href}
                      className="block group"
                    >
                      <div className="text-white/90 font-medium group-hover:text-blue-400 transition-colors duration-200">
                        {item.name}
                      </div>
                      <div className="text-white/50 text-sm mt-1">
                        {item.description}
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Informasi */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Informasi</h4>
              <ul className="space-y-3">
                {footerSections.informasi.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={item.href}
                      className="block group"
                    >
                      <div className="text-white/90 font-medium group-hover:text-blue-400 transition-colors duration-200">
                        {item.name}
                      </div>
                      <div className="text-white/50 text-sm mt-1">
                        {item.description}
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10"
        >
          {/* Certifications */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${cert.bgColor} border border-white/10`}
              >
                <cert.icon className={`h-4 w-4 ${cert.color}`} />
                <span className={`text-sm font-medium ${cert.color}`}>
                  {cert.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Copyright and Love */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
              <span>© {currentYear || new Date().getFullYear()} PelitaCare</span>
              <span>•</span>
              <span className="flex items-center">
                Dibuat dengan
                <Heart className="h-3 w-3 mx-1 text-red-400" fill="currentColor" />
                untuk perawat Indonesia
              </span>
            </div>

            {/* Quick CTA */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105"
              >
                Mulai Gratis
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                Masuk
              </Link>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-8 text-center">
            <div className="inline-block bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 max-w-2xl">
              <div className="flex items-start space-x-2">
                <ShieldCheck className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-blue-200 font-medium mb-1">Disclaimer Medis</p>
                  <p className="text-xs text-blue-100/80 leading-relaxed">
                    Platform ini merupakan alat bantu edukasi dan skrining awal. Hasil screening tidak menggantikan diagnosis medis profesional.
                    Untuk keadaan darurat medis, segera hubungi layanan gawat darurat terdekat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}