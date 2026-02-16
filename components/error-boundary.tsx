'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home, RefreshCw, Copy, Send } from 'lucide-react';
import { logError, categorizeError, captureErrorContext } from '@/lib/error-logger';
import { ErrorType, getUserFriendlyMessage } from '@/lib/error-types';
import { toast } from 'sonner';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  redirectUrl?: string;
  showStack?: boolean;
}

export default function ErrorBoundary({
  error,
  reset,
  redirectUrl = '/app/home',
  showStack = false,
}: ErrorBoundaryProps) {
  const router = useRouter();
  const isDev = process.env.NODE_ENV === 'development';
  const [errorCount, setErrorCount] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const categorizedError = categorizeError(error);

  useEffect(() => {
    // Log error when boundary catches it
    const context = captureErrorContext();
    logError(categorizedError, {
      digest: error.digest,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    });

    // Track error count
    setErrorCount((prev) => prev + 1);

    // Auto-retry for transient errors (max 3 times)
    if (shouldAutoRetry(categorizedError) && errorCount < 3) {
      const timeout = Math.min(1000 * Math.pow(2, errorCount), 8000);
      const timer = setTimeout(() => {
        reset();
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [error, categorizedError, errorCount, reset]);

  const shouldAutoRetry = (error: { type: ErrorType; recoverable?: boolean }): boolean => {
    return error.recoverable === true;
  };

  const handleCopyError = async () => {
    const errorDetails = JSON.stringify({
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      type: categorizedError.type,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }, null, 2);

    try {
      await navigator.clipboard.writeText(errorDetails);
      toast.success('Error details copied to clipboard');
    } catch (e) {
      toast.error('Failed to copy error details');
    }
  };

  const handleReportIssue = async () => {
    setIsReporting(true);
    try {
      const context = captureErrorContext();
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            digest: error.digest,
            type: categorizedError.type,
          },
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...context,
          },
        }),
      });

      if (response.ok) {
        toast.success('Error report sent successfully');
      } else {
        toast.error('Failed to send error report');
      }
    } catch (e) {
      toast.error('Failed to send error report');
    } finally {
      setIsReporting(false);
    }
  };

  const getErrorTitle = (type: ErrorType) => {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorType.AUTHORIZATION:
        return 'Permission Denied';
      case ErrorType.NETWORK:
        return 'Network Error';
      case ErrorType.VALIDATION:
        return 'Validation Error';
      case ErrorType.DATABASE:
        return 'Database Error';
      case ErrorType.RATE_LIMIT:
        return 'Rate Limit Exceeded';
      case ErrorType.NOT_FOUND:
        return 'Not Found';
      case ErrorType.SERVER:
        return 'Server Error';
      case ErrorType.EXTERNAL_SERVICE:
        return 'Service Unavailable';
      default:
        return 'Something went wrong';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle>{getErrorTitle(categorizedError.type)}</CardTitle>
          </div>
          <CardDescription>
            {getUserFriendlyMessage(categorizedError.type)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorCount > 1 && errorCount < 3 && shouldAutoRetry(categorizedError) && (
            <Alert>
              <AlertDescription>
                Retrying automatically... (Attempt {errorCount + 1} of 3)
              </AlertDescription>
            </Alert>
          )}

          {isDev && (showStack || true) && (
            <Alert variant="destructive">
              <AlertTitle className="flex items-center justify-between">
                Error Details (Development Only)
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyError}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div className="text-sm font-mono">
                  <p className="font-semibold">{error.message}</p>
                  {error.digest && (
                    <p className="text-xs mt-2 opacity-70">Digest: {error.digest}</p>
                  )}
                  {error.stack && (
                    <pre className="mt-2 text-xs overflow-auto max-h-40 bg-black/10 p-2 rounded">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              If this problem persists, please contact support with the error details above.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button onClick={() => reset()} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => router.push(redirectUrl)} variant="outline" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button
            onClick={handleReportIssue}
            variant="secondary"
            disabled={isReporting}
          >
            <Send className="h-4 w-4 mr-2" />
            Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
