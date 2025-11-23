import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/auth-provider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'Sihat - Pemetaan Layanan Paliatif Berbasis ESAS',
  description:
    'Sihat adalah platform pemetaan layanan paliatif berbasis ESAS untuk edukasi dan skrining 8 penyakit terminal',
  icons: {
    icon: [
      { url: '/assets/favicon_io/favicon.ico' },
      { url: '/assets/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/favicon_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'manifest', url: '/assets/favicon_io/site.webmanifest' },
      { rel: 'apple-touch-icon', url: '/assets/favicon_io/apple-touch-icon.png' },
      { rel: 'shortcut icon', url: '/assets/favicon_io/favicon.ico' },
    ],
  },
  manifest: '/assets/favicon_io/site.webmanifest',
  openGraph: {
    title: 'Sihat - Pemetaan Layanan Paliatif Berbasis ESAS',
    description: 'Platform pemetaan layanan paliatif berbasis ESAS untuk edukasi dan skrining',
    type: 'website',
    locale: 'id_ID',
    url: 'https://sihat.vercel.app',
    siteName: 'Sihat',
    images: [
      {
        url: '/assets/favicon_io/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'Sihat Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sihat - Pemetaan Layanan Paliatif Berbasis ESAS',
    description: 'Platform pemetaan layanan paliatif berbasis ESAS untuk edukasi dan skrining',
    images: ['/assets/favicon_io/android-chrome-512x512.png'],
  },
  metadataBase: new URL('https://sihat.vercel.app'),
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
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </div>
      </body>
    </html>
  )
}
