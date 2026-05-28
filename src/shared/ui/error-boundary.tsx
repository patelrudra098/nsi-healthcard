'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional fallback — defaults to the built-in error card */
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Generic error boundary for feature containers.
 * Catches unhandled render errors and shows a recovery UI.
 * Never exposes raw error messages or stack traces to users.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Log to console in dev only — never show to user
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[40vh] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-md)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--error-soft)]">
              <AlertTriangle className="h-6 w-6 text-[var(--error)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--primary-hover)]"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
