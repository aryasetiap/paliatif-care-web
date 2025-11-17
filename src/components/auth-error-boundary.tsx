'use client'

import React, { Component, ReactNode } from 'react'
import { useSessionCleanup } from '@/lib/sessionCleanup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    })
  }

  componentDidUpdate(_prevProps: Props) {
    // Reset error boundary when location changes (user navigates away)
    if (window.location.href !== window.location.href) {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <AuthErrorFallback error={this.state.error} onReset={this.handleReset} />
    }

    return this.props.children
  }
}

// Fallback component for auth errors
const AuthErrorFallback: React.FC<{
  error?: Error
  onReset: () => void
}> = ({ error, onReset }) => {
  const { handleExpiredSession } = useSessionCleanup()

  const handleClearSession = async () => {
    await handleExpiredSession()
    onReset()
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
          <CardDescription>There was a problem with your authentication session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                {error.message || 'An unexpected authentication error occurred'}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={handleClearSession} className="w-full" variant="default">
              Clear Session & Login
            </Button>

            <Button onClick={handleReload} className="w-full" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Your session may have expired</p>
            <p>• Your account may have been deleted</p>
            <p>• There might be a network connectivity issue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook wrapper for easier usage
export const useAuthErrorBoundary = () => {
  return {
    handleAuthError: (error: Error) => {
      // Force clear session and redirect to login
      if (typeof window !== 'undefined') {
        window.location.href =
          '/login?sessionExpired=true&error=' + encodeURIComponent(error.message)
      }
    },
  }
}

export default AuthErrorBoundary
