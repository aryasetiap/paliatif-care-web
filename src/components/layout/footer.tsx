'use client'

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import {
  Github,
  Mail,
  Phone,
  MapPin,
  Heart,
  Activity,
  FileText,
  ShieldCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const footerLinks = {
  product: [
    { name: 'Fitur', href: '/features' },
    { name: 'Harga', href: '/pricing' },
    { name: 'Integrasi', href: '/integrations' },
    { name: 'Changelog', href: '/changelog' },
  ],
  company: [
    { name: 'Tentang Kami', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Karir', href: '/careers' },
    { name: 'Kontak', href: '/contact' },
  ],
  resources: [
    { name: 'Dokumentasi', href: '/docs' },
    { name: 'Panduan', href: '/guide' },
    { name: 'Bantuan', href: '/help' },
    { name: 'API', href: '/api' },
  ],
  legal: [
    { name: 'Kebijakan Privasi', href: '/privacy' },
    { name: 'Syarat & Ketentuan', href: '/terms' },
    { name: 'Kebijakan Cookies', href: '/cookies' },
    { name: 'Kepatuhan HIPAA', href: '/hipaa' },
  ],
}

const socialLinks = [
  { name: 'GitHub', href: '#', icon: Github },
  { name: 'Email', href: 'mailto:info@duakodelabs.com', icon: Mail },
]

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="relative border-t bg-gradient-to-b from-background to-primary-cream/30">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236280BA' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative container px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 mb-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl healthcare-gradient text-white shadow-lg">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-bold text-2xl text-gradient-primary">PelitaCare</span>
            </motion.div>

            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              Platform edukasi dan skrining paliatif berbasis keperawatan yang
              membantu tenaga medis memberikan perawatan terbaik untuk pasien
              penyakit terminal.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-muted-foreground">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>info@duakodelabs.com</span>
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span>+62 812-3456-7890</span>
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span>Jakarta, Indonesia</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold mb-6 text-lg">Produk</h3>
            <ul className="space-y-4 text-sm">
              {footerLinks.product.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="block"
                  >
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-300 mr-0 group-hover:mr-2 rounded-full"></span>
                      {item.name}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold mb-6 text-lg">Perusahaan</h3>
            <ul className="space-y-4 text-sm">
              {footerLinks.company.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="block"
                  >
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-300 mr-0 group-hover:mr-2 rounded-full"></span>
                      {item.name}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources & Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold mb-6 text-lg">Sumber & Legal</h3>
            <div className="space-y-6 text-sm">
              <ul className="space-y-4">
                {footerLinks.resources.slice(0, 2).map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="block"
                    >
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-300 mr-0 group-hover:mr-2 rounded-full"></span>
                        {item.name}
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
              <Separator className="my-6 bg-primary/10" />
              <ul className="space-y-4">
                {footerLinks.legal.slice(0, 2).map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="block"
                    >
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-300 mr-0 group-hover:mr-2 rounded-full"></span>
                        {item.name}
                      </Link>
                    </motion.div>
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
        >
          <Separator className="my-12 bg-primary/10" />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Copyright */}
            <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground md:items-center md:flex-row">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                viewport={{ once: true }}
                className="flex items-center gap-1"
              >
                © {currentYear || new Date().getFullYear()} PelitaCare oleh DuaKode Labs.
              </motion.p>
              <span className="hidden md:inline">•</span>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                viewport={{ once: true }}
                className="flex items-center gap-1"
              >
                <span>Dibuat dengan </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-flex"
                >
                  <Heart className="h-3 w-3 text-red-500" />
                </motion.div>
                <span> untuk perawat Indonesia.</span>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              viewport={{ once: true }}
              className="flex items-center gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center space-x-2 text-xs text-muted-foreground p-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>ISO 27001</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center space-x-2 text-xs text-muted-foreground p-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span>HIPAA Compliant</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center space-x-2 text-xs text-muted-foreground p-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <Activity className="h-4 w-4 text-primary" />
                <span>Kemenkes Terdaftar</span>
              </motion.div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-4"
            >
              {socialLinks.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-primary transition-colors block"
                        aria-label={item.name}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </motion.div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            viewport={{ once: true }}
            className="mt-12 rounded-xl bg-gradient-to-r from-primary/5 to-primary-cream/30 p-6 text-xs text-muted-foreground border border-primary/10 backdrop-blur-sm"
          >
            <div className="space-y-2">
              <p className="mb-3">
                <strong className="text-primary">Disclaimer:</strong> Platform ini merupakan alat bantu edukasi dan skrining awal.
                Hasil screening tidak menggantikan diagnosis medis profesional dari dokter spesialis.
              </p>
              <p>
                Untuk keadaan darurat medis, segera hubungi layanan gawat darurat terdekat atau rumah sakit.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}