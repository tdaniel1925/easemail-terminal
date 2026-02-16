'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { logError, categorizeError } from '@/lib/error-logger';
import { ErrorType } from '@/lib/error-types';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  redirectUrl?: string;
  showStack?: boolean;
}

export default function ErrorPage({
  error,
  reset,
  redirectUrl = '/app/home',
  showStack = false,
}: ErrorPageProps) {
  const router = useRouter();
  const isDev = process.env.NODE_ENV === 'development';
  const categorizedError = categorizeError(error);

  useEffect(() => {
    // Log error when page catches it
    logError(categorizedError, {
      digest: error.digest,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });
  }, [error, categorizedError]);

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
      case ErrorType.SERVER:
        return 'Server Error';
      default:
        return 'Something went wrong';
    }
  };

  const getErrorDescription = (type: ErrorType) => {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return 'Your session may have expired. Please log in again.';
      case ErrorType.AUTHORIZATION:
        return "You don't have permission to access this resource.";
      case ErrorType.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection.';
      case ErrorType.VALIDATION:
        return 'The data provided is invalid. Please try again.';
      case ErrorType.SERVER:
        return 'Our servers encountered an error. Please try again later.';
      default:
        return 'An unexpected error occurred. Our team has been notified.';
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
            {getErrorDescription(categorizedError.type)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isDev && (showStack || true) && (
            <Alert variant="destructive">
              <AlertTitle>Error Details (Development Only)</AlertTitle>
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

          <div className="text-sm text-muted-foreground">
            <p>If this problem persists, please contact our support team.</p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={() => router.push(redirectUrl)}
            variant="outline"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
