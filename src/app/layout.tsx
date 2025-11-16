import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false
})

export const metadata: Metadata = {
  title: 'Pelita Care - Pemetaan Layanan Paliatif Berbasis ESAS',
  description: 'Pelita Care adalah platform pemetaan layanan paliatif berbasis ESAS untuk edukasi dan skrining 8 penyakit terminal',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans antialiased">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  )
}