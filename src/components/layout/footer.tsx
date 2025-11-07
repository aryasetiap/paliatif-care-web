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
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg">PelitaCare</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Platform edukasi dan skrining paliatif berbasis keperawatan yang
              membantu tenaga medis memberikan perawatan terbaik untuk pasien
              penyakit terminal.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@duakodelabs.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Produk</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Perusahaan</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h3 className="font-semibold mb-4">Sumber & Legal</h3>
            <div className="space-y-3 text-sm">
              <ul className="space-y-3">
                {footerLinks.resources.slice(0, 2).map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Separator className="my-3" />
              <ul className="space-y-3">
                {footerLinks.legal.slice(0, 2).map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <Separator className="my-8" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Copyright */}
          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground md:items-center md:flex-row">
            <p className="flex items-center gap-1">
              © {currentYear} PelitaCare oleh DuaKode Labs.
            </p>
            <span className="hidden md:inline">•</span>
            <p className="flex items-center gap-1">
              Dibuat dengan <Heart className="h-3 w-3 text-red-500" /> untuk perawat Indonesia.
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>ISO 27001</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-4 w-4 text-primary" />
              <span>Kemenkes Terdaftar</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={item.name}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
          <p className="mb-2">
            <strong>Disclaimer:</strong> Platform ini merupakan alat bantu edukasi dan skrining awal.
            Hasil screening tidak menggantikan diagnosis medis profesional dari dokter spesialis.
          </p>
          <p>
            Untuk keadaan darurat medis, segera hubungi layanan gawat darurat terdekat atau rumah sakit.
          </p>
        </div>
      </div>
    </footer>
  )
}