'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error?: Error
  reset: () => void
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Terjadi Kesalahan</CardTitle>
          <CardDescription>
            Maaf, telah terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu
            dan akan segera memperbaikinya.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isDevelopment && error && (
            <details className="rounded-lg bg-muted p-4 text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                Detail Error (Development Only)
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 overflow-x-auto text-xs bg-background p-2 rounded">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Apa yang bisa Anda lakukan:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Coba refresh halaman ini</li>
              <li>• Periksa koneksi internet Anda</li>
              <li>• Kembali ke halaman sebelumnya</li>
              <li>• Hubungi tim support jika masalah berlanjut</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Beranda
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="mailto:support@duakodelabs.com">
              <MessageCircle className="mr-2 h-4 w-4" />
              Support
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  return React.useCallback(() => {
    // You can integrate with error reporting services like Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error)
    // }
  }, [])
}

// Component for handling 404 errors
export function NotFoundError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl font-bold text-muted-foreground">
            404
          </div>
          <CardTitle>Halaman Tidak Ditemukan</CardTitle>
          <CardDescription>
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Pastikan URL yang Anda masukkan benar, atau gunakan menu navigasi
              untuk menemukan halaman yang Anda cari.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Component for handling network errors
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-orange-800">Koneksi Error</CardTitle>
        <CardDescription className="text-orange-700">
          Tidak dapat terhubung ke server. Periksa koneksi internet Anda.
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Pastikan Anda terhubung ke internet dan coba lagi.
        </p>
      </CardContent>

      <CardFooter>
        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}