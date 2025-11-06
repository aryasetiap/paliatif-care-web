import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Palliative Care Education & Screening',
  description: 'Website Edukasi & Skrining Paliatif Berbasis Keperawatan',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans antialiased">{children}</div>
      </body>
    </html>
  )
}
