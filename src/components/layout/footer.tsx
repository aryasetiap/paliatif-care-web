'use client'

import Link from 'next/link'
import {
  Mail,
  MapPin,
  Heart,
  Users,
  BookOpen,
  Stethoscope,
  Instagram
} from 'lucide-react'
import { motion } from 'framer-motion'

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

export function Footer() {

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

      <div className="relative container mx-auto px-6 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-8"
          >
            {/* Logo and Brand */}
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-60 scale-110"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 border border-white/20 shadow-2xl">
                  <Stethoscope className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">Pelita</h3>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-bold text-lg">
                  Care
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/80 leading-relaxed text-[15px] max-w-sm font-light">
              Platform digital terdepan untuk perawatan paliatif berbasis ESAS, mendukung tenaga medis dalam memberikan perawatan berkualitas tinggi dan berkelanjutan.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 pt-2">
              <h5 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Hubungi Kami</h5>

              <div className="flex items-start space-x-4 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/20 group-hover:border-blue-400/40 transition-all duration-300">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm mb-1">Email</div>
                  <a href="mailto:info@peliacare.id" className="text-white/60 hover:text-blue-400 transition-colors duration-200 text-sm">
                    info@peliacare.id
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-400/20 group-hover:border-pink-400/40 transition-all duration-300">
                  <Instagram className="h-5 w-5 text-pink-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm mb-1">Instagram</div>
                  <a href="https://instagram.com/peliacare.id" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-pink-400 transition-colors duration-200 text-sm">
                    @peliacare.id
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/20 group-hover:border-purple-400/40 transition-all duration-300">
                  <MapPin className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm mb-1">Lokasi</div>
                  <div className="text-white/60 text-sm">Lampung, Indonesia</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Services Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                <h4 className="text-xl font-bold text-white tracking-tight">Layanan Kami</h4>
              </div>
              <p className="text-white/60 text-sm">Solusi komprehensif untuk kebutuhan perawatan paliatif Anda</p>
            </div>

            <ul className="space-y-6">
              {footerSections.layanan.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link
                    href={item.href}
                    className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/20">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold mb-1 group-hover:text-blue-300 transition-colors duration-200">
                          {item.name}
                        </div>
                        <div className="text-white/50 text-sm leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Statistics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                <h4 className="text-xl font-bold text-white tracking-tight">Dampak Kami</h4>
              </div>
              <p className="text-white/60 text-sm">Angka nyata yang mencerminkan kepercayaan dan dampak positif</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">1000+</div>
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-400/20">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <div className="text-white/80 font-medium">Tenaga Medis</div>
                <div className="text-white/50 text-sm mt-1">Profesional terlatih dan bersertifikat</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">5000+</div>
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-400/20">
                    <Heart className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <div className="text-white/80 font-medium">Pasien Terlayani</div>
                <div className="text-white/50 text-sm mt-1">Menerima perawatan paliatif berkualitas</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}