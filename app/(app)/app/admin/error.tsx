'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home, Shield } from 'lucide-react';
import { useEffect } from 'react';
import { logError, categorizeError } from '@/lib/error-logger';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    logError(categorizeError(error), {
      context: 'admin',
      digest: error.digest,
      critical: true,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-900">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-destructive" />
            <CardTitle>Admin Panel Error</CardTitle>
          </div>
          <CardDescription>
            An error occurred in the admin panel. This has been logged for review.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isDev && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Development Error</AlertTitle>
              <AlertDescription className="text-xs font-mono mt-2">
                {error.message}
                {error.stack && (
                  <pre className="mt-2 text-xs overflow-auto max-h-40 bg-black/10 p-2 rounded">
                    {error.stack}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button onClick={() => router.push('/app/admin')} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Admin Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
