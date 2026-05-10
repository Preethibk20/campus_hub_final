import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  private handleRefresh = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-danger" />
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary mb-3">
              Something went wrong
            </h1>
            
            <p className="text-text-secondary mb-6">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left overflow-auto max-h-40">
                <p className="text-sm font-medium text-red-800 mb-1">Error details:</p>
                <p className="text-xs text-red-600 font-mono">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-red-600 font-mono mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={this.handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </Button>
              
              <Link to="/">
                <Button variant="secondary" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
