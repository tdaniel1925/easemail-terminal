'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error boundary caught error', error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/app/home';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>

          <div className="flex gap-3">
            <Button onClick={this.handleReset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={this.handleReload} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button onClick={this.handleGoHome} variant="secondary">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 p-4 bg-muted rounded-lg max-w-2xl w-full">
              <summary className="cursor-pointer font-semibold text-sm mb-2">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <strong className="text-xs">Error:</strong>
                  <pre className="mt-1 text-xs overflow-auto bg-background p-2 rounded">
                    {this.state.error.message}
                  </pre>
                </div>
                {this.state.error.stack && (
                  <div>
                    <strong className="text-xs">Stack Trace:</strong>
                    <pre className="mt-1 text-xs overflow-auto bg-background p-2 rounded max-h-40">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                {this.state.errorInfo && (
                  <div>
                    <strong className="text-xs">Component Stack:</strong>
                    <pre className="mt-1 text-xs overflow-auto bg-background p-2 rounded max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Compact error fallback for smaller components
 */
export function CompactErrorFallback({ error, reset }: { error?: string; reset?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-destructive/20 rounded-lg bg-destructive/5">
      <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
      <p className="text-sm text-destructive text-center mb-3">
        {error || 'Failed to load this component'}
      </p>
      {reset && (
        <Button size="sm" variant="outline" onClick={reset}>
          <RefreshCw className="mr-2 h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  );
}
