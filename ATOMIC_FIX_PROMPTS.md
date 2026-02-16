# 🔧 ATOMIC FIX PROMPTS - EaseMail Terminal
**Complete dependency-mapped implementation prompts**
**Date**: 2026-02-15

Each prompt below includes:
- Complete atomic dependency map
- Build order (dependencies first, then feature)
- Verification steps
- Edge case handling

---

## FIX #1: Add Next.js Error Boundaries (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
ERROR BOUNDARY SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: shadcn/ui Alert component — ✅ EXISTS (verify at components/ui/alert.tsx)
│   ├── ATOM: shadcn/ui Button component — ✅ EXISTS (verify at components/ui/button.tsx)
│   ├── ATOM: shadcn/ui Card component — ✅ EXISTS (verify at components/ui/card.tsx)
│   ├── ATOM: Next.js useRouter hook — ✅ BUILT-IN
│   ├── ATOM: Error logging utility — ⚠️ CREATE lib/error-logger.ts
│   └── ATOM: Error types enum — ⚠️ CREATE lib/error-types.ts
├── CORE ATOMS (build in order):
│   ├── ATOM: Base ErrorBoundary component — CREATE components/error-boundary.tsx
│   ├── ATOM: Global error page — CREATE app/error.tsx
│   ├── ATOM: Auth error page — CREATE app/(auth)/error.tsx
│   ├── ATOM: App error page — CREATE app/(app)/error.tsx
│   └── ATOM: Admin error page — CREATE app/(app)/app/admin/error.tsx
├── EDGE CASES (handle these):
│   ├── EDGE: Development vs production error display
│   ├── EDGE: Error boundary reset failures
│   ├── EDGE: Nested error boundaries
│   └── EDGE: Client vs server errors
└── VALIDATION:
    ├── TEST: Trigger error in each route group
    ├── TEST: Verify reset functionality
    └── TEST: Verify error logging
```

### IMPLEMENTATION PROMPT:

```
STEP 1: BUILD DEPENDENCIES FIRST

1.1 Verify existing UI components:
- Check components/ui/alert.tsx exists
- Check components/ui/button.tsx exists
- Check components/ui/card.tsx exists
- If any are missing, install from shadcn/ui:
  npx shadcn-ui@latest add alert
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add card

1.2 Create lib/error-types.ts:
```typescript
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  stack?: string;
  digest?: string;
}

export function categorizeError(error: Error): AppError {
  // Categorize based on error message/type
  if (error.message.includes('auth') || error.message.includes('unauthorized')) {
    return { type: ErrorType.AUTHENTICATION, message: error.message, stack: error.stack };
  }
  if (error.message.includes('forbidden') || error.message.includes('permission')) {
    return { type: ErrorType.AUTHORIZATION, message: error.message, stack: error.stack };
  }
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return { type: ErrorType.NETWORK, message: error.message, stack: error.stack };
  }
  return { type: ErrorType.UNKNOWN, message: error.message, stack: error.stack };
}
```

1.3 Create lib/error-logger.ts:
```typescript
import { AppError, ErrorType } from './error-types';

export function logError(error: AppError, context?: Record<string, any>) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Logger]', {
      type: error.type,
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  // In production, send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with Sentry or error tracking service
    // Example: Sentry.captureException(error, { extra: context });
  }

  // Store in localStorage for debugging (optional)
  try {
    const errorLog = JSON.parse(localStorage.getItem('error_log') || '[]');
    errorLog.push({
      timestamp: new Date().toISOString(),
      error,
      context,
    });
    // Keep last 10 errors
    localStorage.setItem('error_log', JSON.stringify(errorLog.slice(-10)));
  } catch (e) {
    // Ignore localStorage errors
  }
}

export function clearErrorLog() {
  try {
    localStorage.removeItem('error_log');
  } catch (e) {
    // Ignore
  }
}
```

STEP 2: BUILD BASE ERROR BOUNDARY COMPONENT

2.1 Create components/error-boundary.tsx:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { logError, categorizeError } from '@/lib/error-logger';
import { ErrorType } from '@/lib/error-types';

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
  const categorizedError = categorizeError(error);

  useEffect(() => {
    // Log error when boundary catches it
    logError(categorizedError, {
      digest: error.digest,
      url: window.location.href,
      userAgent: navigator.userAgent,
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
```

STEP 3: BUILD ERROR PAGES FOR EACH ROUTE GROUP

3.1 Create app/error.tsx (Global Error Boundary):
```typescript
'use client';

import ErrorBoundary from '@/components/error-boundary';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorBoundary
          error={error}
          reset={reset}
          redirectUrl="/app/home"
          showStack={true}
        />
      </body>
    </html>
  );
}
```

3.2 Create app/(auth)/error.tsx (Auth Error Boundary):
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { logError, categorizeError } from '@/lib/error-logger';

export default function AuthError({
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
      context: 'authentication',
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>
            We encountered a problem with your authentication.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isDev && (
            <Alert variant="destructive">
              <AlertTitle>Development Error</AlertTitle>
              <AlertDescription className="text-xs font-mono mt-2">
                {error.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button onClick={() => router.push('/login')} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

3.3 Create app/(app)/error.tsx (Main App Error Boundary):
```typescript
'use client';

import ErrorBoundary from '@/components/error-boundary';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      redirectUrl="/app/home"
      showStack={false}
    />
  );
}
```

3.4 Create app/(app)/app/admin/error.tsx (Admin Error Boundary):
```typescript
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
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
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
```

STEP 4: VALIDATION & TESTING

4.1 Test each error boundary:
- Navigate to each route group
- Trigger an error (add "throw new Error('test')" temporarily)
- Verify error boundary catches and displays correctly
- Verify reset button works
- Verify navigation button works

4.2 Test error logging:
- Open browser console
- Trigger errors in development
- Verify errors are logged to console
- Check localStorage for error_log

4.3 Test edge cases:
- Test nested errors (error in error boundary)
- Test client vs server component errors
- Test different error types (auth, network, etc.)

STEP 5: CLEANUP & VERIFICATION

5.1 Remove any test error throws
5.2 Verify all files are created:
   - lib/error-types.ts ✓
   - lib/error-logger.ts ✓
   - components/error-boundary.tsx ✓
   - app/error.tsx ✓
   - app/(auth)/error.tsx ✓
   - app/(app)/error.tsx ✓
   - app/(app)/app/admin/error.tsx ✓

5.3 Test production build:
   npm run build
   - Verify no errors
   - Verify error pages are included in build

DONE: All atoms built, all dependencies satisfied, error boundaries fully implemented.
```

---

## FIX #2: Add Next.js Loading States (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
LOADING STATE SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: shadcn/ui Skeleton component — ⚠️ CREATE components/ui/skeleton.tsx
│   ├── ATOM: Tailwind animate-pulse — ✅ BUILT-IN
│   └── ATOM: Layout dimensions (sidebar, header heights) — ✅ EXISTS (verify in layouts)
├── CORE ATOMS (build in order):
│   ├── ATOM: Base Skeleton component — CREATE components/ui/skeleton.tsx
│   ├── ATOM: Global loading page — CREATE app/loading.tsx
│   ├── ATOM: Main app loading — CREATE app/(app)/loading.tsx
│   ├── ATOM: Inbox loading skeleton — CREATE app/(app)/app/inbox/loading.tsx
│   ├── ATOM: Calendar loading skeleton — CREATE app/(app)/app/calendar/loading.tsx
│   ├── ATOM: Admin loading skeleton — CREATE app/(app)/app/admin/loading.tsx
│   └── ATOM: Settings loading skeleton — CREATE app/(app)/app/settings/loading.tsx
├── EDGE CASES (handle these):
│   ├── EDGE: Instant navigation (no flash of loading)
│   ├── EDGE: Slow connections (loading persists)
│   └── EDGE: Nested route loading states
└── VALIDATION:
    ├── TEST: Navigate between routes
    ├── TEST: Slow 3G simulation
    └── TEST: Verify no layout shift
```

### IMPLEMENTATION PROMPT:

```
STEP 1: BUILD DEPENDENCIES FIRST

1.1 Create components/ui/skeleton.tsx (shadcn/ui Skeleton):
```typescript
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

1.2 Verify layout files exist and note dimensions:
- Check app/(app)/layout.tsx for sidebar width
- Check components/layout/app-sidebar.tsx for sidebar structure
- Check components/layout/app-header.tsx for header height
- Note: We'll match these dimensions in loading skeletons

STEP 2: BUILD GLOBAL LOADING PAGE

2.1 Create app/loading.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Logo skeleton */}
        <Skeleton className="h-12 w-48 rounded-lg" />
        {/* Loading text */}
        <Skeleton className="h-4 w-32 rounded" />
        {/* Spinner area */}
        <div className="mt-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    </div>
  )
}
```

STEP 3: BUILD MAIN APP LOADING SKELETON

3.1 Create app/(app)/loading.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

export default function AppLoading() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-64 border-r bg-muted/40 flex-col">
        {/* Logo area */}
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Navigation items */}
        <div className="flex-1 p-4 space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>

        {/* User area */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <div className="h-16 border-b bg-background px-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        {/* Page content skeleton */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
```

STEP 4: BUILD INBOX LOADING SKELETON

4.1 Create app/(app)/app/inbox/loading.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

export default function InboxLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Folder sidebar */}
      <div className="hidden lg:flex w-48 border-r bg-muted/40 flex-col p-4 space-y-2">
        {['Inbox', 'Starred', 'Sent', 'Drafts', 'Archive', 'Trash'].map((folder) => (
          <Skeleton key={folder} className="h-9 w-full rounded-md" />
        ))}
      </div>

      {/* Email list */}
      <div className="flex-1 border-r">
        {/* Search bar */}
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Email items */}
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />

                <div className="flex-1 space-y-2">
                  {/* Sender name and time */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>

                  {/* Subject */}
                  <Skeleton className="h-4 w-3/4" />

                  {/* Preview */}
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email preview pane */}
      <div className="hidden xl:flex w-[600px] flex-col">
        {/* Header */}
        <div className="p-6 border-b space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}
```

STEP 5: BUILD CALENDAR LOADING SKELETON

5.1 Create app/(app)/app/calendar/loading.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* View selector */}
      <div className="flex gap-2">
        {['Day', 'Week', 'Month', 'Agenda'].map((view) => (
          <Skeleton key={view} className="h-9 w-20" />
        ))}
      </div>

      {/* Calendar grid */}
      <div className="border rounded-lg">
        {/* Week header */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-4 border-r last:border-r-0">
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        {/* Calendar days */}
        {[1, 2, 3, 4, 5].map((week) => (
          <div key={week} className="grid grid-cols-7 border-b last:border-b-0">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="min-h-32 p-2 border-r last:border-r-0 space-y-1">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-16 w-full rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Event list sidebar */}
      <div className="mt-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

STEP 6: BUILD ADMIN LOADING SKELETON

6.1 Create app/(app)/app/admin/loading.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        {/* Table header */}
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

STEP 7: BUILD SETTINGS LOADING SKELETON

7.1 Create app/(app)/app/settings/loading.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="flex gap-6 p-6">
      {/* Settings sidebar */}
      <div className="hidden md:block w-64 space-y-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>

      {/* Settings content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Form sections */}
        <div className="space-y-6">
          {[1, 2, 3].map((section) => (
            <div key={section} className="p-6 border rounded-lg space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-4">
                {[1, 2, 3].map((field) => (
                  <div key={field} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
```

STEP 8: VALIDATION & TESTING

8.1 Test loading states:
- Navigate between routes and verify loading skeleton appears
- Use Chrome DevTools Network tab → Slow 3G to see loading longer
- Verify no layout shift (CLS) when content loads
- Check that skeleton dimensions match actual content

8.2 Test on different screen sizes:
- Mobile (375px): Verify responsive loading states
- Tablet (768px): Verify sidebar visibility
- Desktop (1440px): Verify full layout

8.3 Verify Next.js generates loading UI:
- npm run build
- Check build output for loading states
- Test in production mode

STEP 9: CLEANUP & VERIFICATION

9.1 Verify all files created:
   - components/ui/skeleton.tsx ✓
   - app/loading.tsx ✓
   - app/(app)/loading.tsx ✓
   - app/(app)/app/inbox/loading.tsx ✓
   - app/(app)/app/calendar/loading.tsx ✓
   - app/(app)/app/admin/loading.tsx ✓
   - app/(app)/app/settings/loading.tsx ✓

9.2 Test loading states in production build:
   npm run build && npm start
   - Navigate between routes
   - Verify loading appears during navigation

DONE: All atoms built, all dependencies satisfied, loading states fully implemented.
```

---

## FIX #3: Add Skeleton Components to All List Pages (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
LIST PAGE SKELETON SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: components/ui/skeleton.tsx — ✅ EXISTS (from FIX #2)
│   └── ATOM: Actual list components — ✅ EXISTS (verify dimensions)
├── CORE ATOMS (build in order):
│   ├── ATOM: EmailListSkeleton — CREATE in inbox page
│   ├── ATOM: CalendarEventSkeleton — CREATE in calendar page
│   ├── ATOM: ContactCardSkeleton — CREATE in contacts page
│   ├── ATOM: UserTableSkeleton — CREATE in admin users page
│   ├── ATOM: OrganizationCardSkeleton — CREATE in admin orgs page
│   ├── ATOM: AttachmentGridSkeleton — CREATE in attachments page
│   └── ATOM: SMSConversationSkeleton — CREATE in SMS page
├── INTEGRATION (update pages):
│   ├── UPDATE: app/(app)/app/inbox/page.tsx
│   ├── UPDATE: app/(app)/app/calendar/page.tsx
│   ├── UPDATE: app/(app)/app/contacts/page.tsx
│   ├── UPDATE: app/(app)/app/admin/users/page.tsx
│   ├── UPDATE: app/(app)/app/admin/organizations/page.tsx
│   ├── UPDATE: app/(app)/app/attachments/page.tsx
│   └── UPDATE: app/(app)/app/sms/page.tsx
├── EDGE CASES (handle these):
│   ├── EDGE: No loading state (already loaded)
│   ├── EDGE: Pagination loading (show skeleton for new items)
│   └── EDGE: Infinite scroll loading
└── VALIDATION:
    ├── TEST: Trigger loading state on each page
    ├── TEST: Verify skeleton matches actual content
    └── TEST: No layout shift when content appears
```

### IMPLEMENTATION PROMPT:

```
STEP 1: VERIFY DEPENDENCIES

1.1 Verify components/ui/skeleton.tsx exists (created in FIX #2)
   - If not, create it using shadcn/ui skeleton component

1.2 Read actual list components to match dimensions:
   - Read app/(app)/app/inbox/page.tsx to see email item structure
   - Read app/(app)/app/calendar/page.tsx to see event card structure
   - Read app/(app)/app/contacts/page.tsx to see contact card structure
   - Note dimensions, spacing, and layout

STEP 2: CREATE REUSABLE SKELETON COMPONENTS

2.1 Create components/skeletons/email-list-skeleton.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

interface EmailListSkeletonProps {
  count?: number;
}

export function EmailListSkeleton({ count = 10 }: EmailListSkeletonProps) {
  return (
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 space-y-2">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />

            <div className="flex-1 space-y-2">
              {/* Sender name and time */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Subject */}
              <Skeleton className="h-4 w-3/4" />

              {/* Preview */}
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

2.2 Create components/skeletons/calendar-event-skeleton.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

interface CalendarEventSkeletonProps {
  count?: number;
}

export function CalendarEventSkeleton({ count = 5 }: CalendarEventSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

2.3 Create components/skeletons/contact-card-skeleton.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

interface ContactCardSkeletonProps {
  count?: number;
}

export function ContactCardSkeleton({ count = 8 }: ContactCardSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

2.4 Create components/skeletons/user-table-skeleton.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

interface UserTableSkeletonProps {
  rows?: number;
}

export function UserTableSkeleton({ rows = 8 }: UserTableSkeletonProps) {
  return (
    <div className="border rounded-lg">
      {/* Table header */}
      <div className="p-4 border-b bg-muted/50">
        <div className="grid grid-cols-5 gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-9 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

2.5 Create components/skeletons/organization-card-skeleton.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

interface OrganizationCardSkeletonProps {
  count?: number;
}

export function OrganizationCardSkeleton({ count = 6 }: OrganizationCardSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

2.6 Create components/skeletons/attachment-grid-skeleton.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

interface AttachmentGridSkeletonProps {
  count?: number;
}

export function AttachmentGridSkeleton({ count = 12 }: AttachmentGridSkeletonProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <Skeleton className="h-24 w-full rounded" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}
```

2.7 Create components/skeletons/sms-conversation-skeleton.tsx:
```typescript
import { Skeleton } from "@/components/ui/skeleton"

interface SMSConversationSkeletonProps {
  count?: number;
}

export function SMSConversationSkeleton({ count = 8 }: SMSConversationSkeletonProps) {
  return (
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

STEP 3: INTEGRATE SKELETONS INTO PAGES

3.1 Update app/(app)/app/inbox/page.tsx:
```typescript
// Add import at top
import { EmailListSkeleton } from '@/components/skeletons/email-list-skeleton';

// In the component, update the rendering logic:
{loading ? (
  <EmailListSkeleton count={10} />
) : messages.length === 0 ? (
  // Empty state (will add in FIX #8)
  <div>No messages</div>
) : (
  // Existing message list rendering
  messages.map(message => (
    // ... existing code
  ))
)}
```

3.2 Update app/(app)/app/calendar/page.tsx:
```typescript
// Add import at top
import { CalendarEventSkeleton } from '@/components/skeletons/calendar-event-skeleton';

// In the component:
{loading ? (
  <CalendarEventSkeleton count={5} />
) : events.length === 0 ? (
  // Empty state
  <div>No events</div>
) : (
  // Existing events rendering
  events.map(event => (
    // ... existing code
  ))
)}
```

3.3 Update app/(app)/app/contacts/page.tsx:
```typescript
// Add import at top
import { ContactCardSkeleton } from '@/components/skeletons/contact-card-skeleton';

// In the component:
{loading ? (
  <ContactCardSkeleton count={8} />
) : contacts.length === 0 ? (
  // Empty state
  <div>No contacts</div>
) : (
  // Existing contacts rendering
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {contacts.map(contact => (
      // ... existing code
    ))}
  </div>
)}
```

3.4 Update app/(app)/app/admin/users/page.tsx:
```typescript
// Add import at top
import { UserTableSkeleton } from '@/components/skeletons/user-table-skeleton';

// In the component:
{loading ? (
  <UserTableSkeleton rows={8} />
) : users.length === 0 ? (
  // Empty state
  <div>No users</div>
) : (
  // Existing users table rendering
  // ... existing code
)}
```

3.5 Update app/(app)/app/admin/organizations/page.tsx:
```typescript
// Add import at top
import { OrganizationCardSkeleton } from '@/components/skeletons/organization-card-skeleton';

// In the component:
{loadingOrgs ? (
  <OrganizationCardSkeleton count={6} />
) : organizations.length === 0 ? (
  // Empty state
  <div>No organizations</div>
) : (
  // Existing organizations grid rendering
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {organizations.map(org => (
      // ... existing code
    ))}
  </div>
)}
```

3.6 Update app/(app)/app/attachments/page.tsx:
```typescript
// Add import at top
import { AttachmentGridSkeleton } from '@/components/skeletons/attachment-grid-skeleton';

// In the component:
{loading ? (
  <AttachmentGridSkeleton count={12} />
) : attachments.length === 0 ? (
  // Empty state
  <div>No attachments</div>
) : (
  // Existing attachments grid rendering
  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
    {attachments.map(attachment => (
      // ... existing code
    ))}
  </div>
)}
```

3.7 Update app/(app)/app/sms/page.tsx:
```typescript
// Add import at top
import { SMSConversationSkeleton } from '@/components/skeletons/sms-conversation-skeleton';

// In the component:
{loading ? (
  <SMSConversationSkeleton count={8} />
) : conversations.length === 0 ? (
  // Empty state
  <div>No conversations</div>
) : (
  // Existing conversations rendering
  conversations.map(conversation => (
    // ... existing code
  ))
)}
```

STEP 4: HANDLE PAGINATION/INFINITE SCROLL LOADING

4.1 For pages with pagination (like inbox), add loading skeleton for "load more":
```typescript
// At the bottom of the list, when loading more:
{loadingMore && <EmailListSkeleton count={5} />}
```

4.2 Update inbox page for infinite scroll loading:
```typescript
// In app/(app)/app/inbox/page.tsx, add to the end of the message list:
{loadingMore && (
  <div className="border-t">
    <EmailListSkeleton count={3} />
  </div>
)}
```

STEP 5: VALIDATION & TESTING

5.1 Test each page:
- Navigate to inbox → verify EmailListSkeleton appears
- Navigate to calendar → verify CalendarEventSkeleton appears
- Navigate to contacts → verify ContactCardSkeleton appears
- Navigate to admin/users → verify UserTableSkeleton appears
- Navigate to admin/organizations → verify OrganizationCardSkeleton appears
- Navigate to attachments → verify AttachmentGridSkeleton appears
- Navigate to SMS → verify SMSConversationSkeleton appears

5.2 Test loading→content transition:
- Verify no layout shift (skeleton dimensions match content)
- Verify smooth fade-in of content
- Use Chrome DevTools Performance tab to check for jank

5.3 Test pagination loading:
- Scroll to bottom of inbox
- Click "Load More" (if applicable)
- Verify skeleton appears for new items

STEP 6: CLEANUP & VERIFICATION

6.1 Verify all skeleton components created:
   - components/skeletons/email-list-skeleton.tsx ✓
   - components/skeletons/calendar-event-skeleton.tsx ✓
   - components/skeletons/contact-card-skeleton.tsx ✓
   - components/skeletons/user-table-skeleton.tsx ✓
   - components/skeletons/organization-card-skeleton.tsx ✓
   - components/skeletons/attachment-grid-skeleton.tsx ✓
   - components/skeletons/sms-conversation-skeleton.tsx ✓

6.2 Verify all pages updated:
   - app/(app)/app/inbox/page.tsx ✓
   - app/(app)/app/calendar/page.tsx ✓
   - app/(app)/app/contacts/page.tsx ✓
   - app/(app)/app/admin/users/page.tsx ✓
   - app/(app)/app/admin/organizations/page.tsx ✓
   - app/(app)/app/attachments/page.tsx ✓
   - app/(app)/app/sms/page.tsx ✓

6.3 Test production build:
   npm run build
   - Verify no errors
   - Test skeleton → content transitions

DONE: All atoms built, all dependencies satisfied, skeleton components fully integrated.
```

---

## FIX #4: Add Rate Limiting to Auth Endpoints (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
RATE LIMITING SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: Redis client (Upstash) — ✅ EXISTS (verify lib/redis/)
│   ├── ATOM: Request IP extraction — ⚠️ CREATE lib/get-ip.ts
│   ├── ATOM: Time window parser — ⚠️ CREATE lib/parse-window.ts
│   └── ATOM: Error responses — ✅ EXISTS (lib/api-error.ts)
├── CORE ATOMS (build in order):
│   ├── ATOM: Rate limit core logic — UPDATE lib/rate-limit.ts
│   ├── ATOM: Rate limit middleware — CREATE lib/middleware/rate-limit.ts
│   └── ATOM: Account lockout system — CREATE lib/account-lockout.ts
├── INTEGRATION (apply to endpoints):
│   ├── UPDATE: Login endpoint (app/api/auth/*)
│   ├── UPDATE: Signup endpoint
│   ├── UPDATE: Password reset endpoint
│   ├── UPDATE: 2FA verify endpoint
│   └── UPDATE: Admin endpoints
├── EDGE CASES (handle these):
│   ├── EDGE: Redis connection failure (fallback)
│   ├── EDGE: Distributed requests (same user, different IPs)
│   ├── EDGE: Rate limit bypass attempts
│   └── EDGE: Account lockout false positives
└── VALIDATION:
    ├── TEST: Trigger rate limit on login
    ├── TEST: Verify lockout after N attempts
    └── TEST: Verify Redis stores limits correctly
```

### IMPLEMENTATION PROMPT:

```
STEP 1: BUILD DEPENDENCIES FIRST

1.1 Verify Redis client exists:
- Check if lib/redis/ directory exists
- Verify Redis connection is configured
- If not, create lib/redis/client.ts:

```typescript
import { Redis } from '@upstash/redis';

if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
  throw new Error('Redis configuration missing: REDIS_URL and REDIS_TOKEN required');
}

export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Test connection
export async function testRedisConnection() {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('[Redis] Connection failed:', error);
    return false;
  }
}
```

1.2 Create lib/get-ip.ts (extract client IP from request):
```typescript
import { NextRequest } from 'next/server';

export function getClientIp(request: NextRequest): string {
  // Try various headers for IP (proxies, load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to a default (not ideal, but prevents crashes)
  return request.ip || 'unknown';
}

export function getIdentifier(request: NextRequest, email?: string): string {
  const ip = getClientIp(request);

  // If email provided, combine IP and email for more granular limiting
  if (email) {
    return `${ip}:${email}`;
  }

  return ip;
}
```

1.3 Create lib/parse-window.ts (parse time window strings like "15m", "1h"):
```typescript
export function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid window format: ${window}. Use format like "15m", "1h", "1d"`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value; // seconds
    case 'm':
      return value * 60; // minutes to seconds
    case 'h':
      return value * 60 * 60; // hours to seconds
    case 'd':
      return value * 60 * 60 * 24; // days to seconds
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
}
```

STEP 2: BUILD RATE LIMIT CORE LOGIC

2.1 Update or create lib/rate-limit.ts:
```typescript
import { redis } from './redis/client';
import { parseWindow } from './parse-window';

export interface RateLimitConfig {
  limit: number;        // Max requests
  window: string;       // Time window (e.g., "15m", "1h")
  prefix?: string;      // Redis key prefix
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;        // Timestamp when limit resets
  retryAfter?: number;  // Seconds until can retry (if blocked)
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, window, prefix = 'ratelimit' } = config;
  const windowSeconds = parseWindow(window);
  const key = `${prefix}:${identifier}`;

  try {
    // Get current count
    const count = await redis.get<number>(key);
    const now = Math.floor(Date.now() / 1000);

    if (count === null) {
      // First request in this window
      await redis.set(key, 1, { ex: windowSeconds });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowSeconds,
      };
    }

    if (count >= limit) {
      // Rate limit exceeded
      const ttl = await redis.ttl(key);

      return {
        success: false,
        limit,
        remaining: 0,
        reset: now + (ttl > 0 ? ttl : windowSeconds),
        retryAfter: ttl > 0 ? ttl : windowSeconds,
      };
    }

    // Increment count
    await redis.incr(key);
    const ttl = await redis.ttl(key);

    return {
      success: true,
      limit,
      remaining: limit - count - 1,
      reset: now + (ttl > 0 ? ttl : windowSeconds),
    };

  } catch (error) {
    // Redis failure - fail open (allow request) but log error
    console.error('[RateLimit] Redis error:', error);

    return {
      success: true, // Fail open
      limit,
      remaining: limit,
      reset: Math.floor(Date.now() / 1000) + windowSeconds,
    };
  }
}

// Multi-tier rate limiting (check multiple limits)
export async function multiRateLimit(
  identifiers: { id: string; config: RateLimitConfig }[]
): Promise<RateLimitResult> {
  for (const { id, config } of identifiers) {
    const result = await rateLimit(id, config);
    if (!result.success) {
      return result; // Return first limit that's exceeded
    }
  }

  // All limits passed
  return {
    success: true,
    limit: identifiers[0]?.config.limit || 0,
    remaining: identifiers[0]?.config.limit || 0,
    reset: Math.floor(Date.now() / 1000),
  };
}
```

STEP 3: BUILD ACCOUNT LOCKOUT SYSTEM

3.1 Create lib/account-lockout.ts:
```typescript
import { redis } from './redis/client';

export interface LockoutConfig {
  maxAttempts: number;
  lockoutDuration: string; // e.g., "30m", "1h"
}

export interface LockoutStatus {
  locked: boolean;
  attempts: number;
  lockedUntil?: number;
  remaining: number;
}

export async function checkLockout(
  email: string,
  config: LockoutConfig = { maxAttempts: 10, lockoutDuration: '30m' }
): Promise<LockoutStatus> {
  const key = `lockout:${email}`;
  const lockKey = `lockout:locked:${email}`;

  try {
    // Check if account is locked
    const lockedUntil = await redis.get<number>(lockKey);
    if (lockedUntil && lockedUntil > Date.now()) {
      return {
        locked: true,
        attempts: config.maxAttempts,
        lockedUntil,
        remaining: 0,
      };
    }

    // Get current attempt count
    const attempts = (await redis.get<number>(key)) || 0;

    return {
      locked: false,
      attempts,
      remaining: Math.max(0, config.maxAttempts - attempts),
    };

  } catch (error) {
    console.error('[Lockout] Redis error:', error);
    // Fail open
    return {
      locked: false,
      attempts: 0,
      remaining: config.maxAttempts,
    };
  }
}

export async function recordFailedAttempt(
  email: string,
  config: LockoutConfig = { maxAttempts: 10, lockoutDuration: '30m' }
): Promise<LockoutStatus> {
  const key = `lockout:${email}`;
  const lockKey = `lockout:locked:${email}`;

  try {
    // Increment attempt count
    const attempts = await redis.incr(key);

    // Set expiry if first attempt
    if (attempts === 1) {
      await redis.expire(key, 3600); // 1 hour window
    }

    // Check if lockout threshold reached
    if (attempts >= config.maxAttempts) {
      const lockoutSeconds = parseInt(config.lockoutDuration) * 60;
      const lockedUntil = Date.now() + (lockoutSeconds * 1000);

      // Lock the account
      await redis.set(lockKey, lockedUntil, { ex: lockoutSeconds });

      return {
        locked: true,
        attempts,
        lockedUntil,
        remaining: 0,
      };
    }

    return {
      locked: false,
      attempts,
      remaining: config.maxAttempts - attempts,
    };

  } catch (error) {
    console.error('[Lockout] Failed to record attempt:', error);
    return {
      locked: false,
      attempts: 0,
      remaining: config.maxAttempts,
    };
  }
}

export async function clearFailedAttempts(email: string): Promise<void> {
  const key = `lockout:${email}`;
  const lockKey = `lockout:locked:${email}`;

  try {
    await redis.del(key);
    await redis.del(lockKey);
  } catch (error) {
    console.error('[Lockout] Failed to clear attempts:', error);
  }
}
```

STEP 4: APPLY RATE LIMITING TO AUTH ENDPOINTS

4.1 Find and update login endpoint (likely in app/api/auth/ or using Supabase Auth):

If using custom login endpoint, update it:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, multiRateLimit } from '@/lib/rate-limit';
import { getClientIp, getIdentifier } from '@/lib/get-ip';
import { checkLockout, recordFailedAttempt, clearFailedAttempts } from '@/lib/account-lockout';
import { ApiErrors } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  // STEP 1: Check account lockout first
  const lockoutStatus = await checkLockout(email);
  if (lockoutStatus.locked) {
    const minutesRemaining = Math.ceil(
      ((lockoutStatus.lockedUntil || 0) - Date.now()) / 1000 / 60
    );

    return NextResponse.json(
      {
        error: `Account locked due to too many failed attempts. Try again in ${minutesRemaining} minutes.`,
      },
      { status: 429 }
    );
  }

  // STEP 2: Apply rate limiting (both IP and email)
  const ip = getClientIp(request);
  const limitResult = await multiRateLimit([
    // IP-based limit (5 attempts per 15 min)
    {
      id: `login:ip:${ip}`,
      config: { limit: 5, window: '15m', prefix: 'auth' },
    },
    // Email-based limit (3 attempts per 15 min)
    {
      id: `login:email:${email}`,
      config: { limit: 3, window: '15m', prefix: 'auth' },
    },
  ]);

  if (!limitResult.success) {
    return NextResponse.json(
      {
        error: `Too many login attempts. Try again in ${Math.ceil((limitResult.retryAfter || 0) / 60)} minutes.`,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limitResult.limit.toString(),
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
          'X-RateLimit-Reset': limitResult.reset.toString(),
          'Retry-After': (limitResult.retryAfter || 0).toString(),
        },
      }
    );
  }

  // STEP 3: Attempt login (your existing logic)
  try {
    // Your login logic here (Supabase auth, etc.)
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    // If login SUCCESSFUL:
    // Clear failed attempts on successful login
    await clearFailedAttempts(email);

    return NextResponse.json({ success: true });

  } catch (error) {
    // If login FAILED:
    // Record failed attempt (may trigger lockout)
    const newLockoutStatus = await recordFailedAttempt(email);

    if (newLockoutStatus.locked) {
      return NextResponse.json(
        {
          error: 'Too many failed login attempts. Your account has been locked for 30 minutes.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Invalid credentials',
        attemptsRemaining: newLockoutStatus.remaining,
      },
      { status: 401 }
    );
  }
}
```

4.2 Update password reset endpoint:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;
  const ip = getClientIp(request);

  // Rate limit: 3 password reset requests per hour per IP
  const ipLimit = await rateLimit(`reset:ip:${ip}`, {
    limit: 3,
    window: '1h',
    prefix: 'auth',
  });

  if (!ipLimit.success) {
    return NextResponse.json(
      { error: 'Too many password reset requests. Please try again later.' },
      { status: 429 }
    );
  }

  // Rate limit: 1 password reset per hour per email
  const emailLimit = await rateLimit(`reset:email:${email}`, {
    limit: 1,
    window: '1h',
    prefix: 'auth',
  });

  if (!emailLimit.success) {
    return NextResponse.json(
      { error: 'A password reset email was already sent. Please check your inbox.' },
      { status: 429 }
    );
  }

  // Your existing password reset logic here
  // ...

  return NextResponse.json({ success: true });
}
```

4.3 Update 2FA verification endpoint (app/api/auth/2fa/verify/route.ts):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 5 2FA attempts per 15 minutes per user
  const limitResult = await rateLimit(`2fa:${user.id}`, {
    limit: 5,
    window: '15m',
    prefix: 'auth',
  });

  if (!limitResult.success) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please try again in a few minutes.' },
      { status: 429 }
    );
  }

  // Your existing 2FA verification logic here
  // ...

  return NextResponse.json({ success: true });
}
```

4.4 Update signup endpoint:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;
  const ip = getClientIp(request);

  // Rate limit: 3 signups per hour per IP
  const limitResult = await rateLimit(`signup:${ip}`, {
    limit: 3,
    window: '1h',
    prefix: 'auth',
  });

  if (!limitResult.success) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Your existing signup logic here
  // ...

  return NextResponse.json({ success: true });
}
```

4.5 Add rate limiting to admin endpoints (app/api/admin/**/route.ts):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 100 admin requests per minute per user
  const limitResult = await rateLimit(`admin:${user.id}`, {
    limit: 100,
    window: '1m',
    prefix: 'api',
  });

  if (!limitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please slow down.' },
      { status: 429 }
    );
  }

  // Your existing admin logic here
  // ...

  return NextResponse.json({ data: 'success' });
}
```

STEP 5: VALIDATION & TESTING

5.1 Test rate limiting:
- Make 6 login requests rapidly → should block after 5th
- Make 4 password reset requests → should block after 3rd
- Make 6 2FA attempts → should block after 5th

5.2 Test account lockout:
- Make 10 failed login attempts with same email
- Verify account locks for 30 minutes
- Verify error message shows lockout time remaining

5.3 Test Redis:
- Verify keys are created in Redis:
  ```bash
  # Connect to Redis and check keys
  redis-cli KEYS "auth:*"
  redis-cli GET "auth:login:ip:xxx.xxx.xxx.xxx"
  ```

5.4 Test fallback behavior:
- Simulate Redis failure (stop Redis)
- Verify requests still work (fail open)
- Check logs for Redis errors

STEP 6: CLEANUP & VERIFICATION

6.1 Verify all files created:
   - lib/redis/client.ts ✓
   - lib/get-ip.ts ✓
   - lib/parse-window.ts ✓
   - lib/rate-limit.ts ✓
   - lib/account-lockout.ts ✓

6.2 Verify all endpoints updated:
   - Login endpoint ✓
   - Signup endpoint ✓
   - Password reset endpoint ✓
   - 2FA verification endpoint ✓
   - Admin endpoints ✓

6.3 Document rate limits:
- Create RATE_LIMITS.md documenting all limits
- Update API documentation with rate limit headers

DONE: All atoms built, all dependencies satisfied, rate limiting fully implemented.
```

---

## FIX #5: Add CSRF Protection (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
CSRF PROTECTION SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: crypto module — ✅ BUILT-IN (Node.js)
│   ├── ATOM: Cookie utilities — ✅ EXISTS (Next.js)
│   └── ATOM: API error responses — ✅ EXISTS (lib/api-error.ts)
├── CORE ATOMS (build in order):
│   ├── ATOM: CSRF token generator — CREATE lib/csrf.ts
│   ├── ATOM: CSRF middleware — CREATE lib/middleware/csrf.ts
│   └── ATOM: Client-side API wrapper — CREATE lib/api-client.ts
├── INTEGRATION (update all mutation endpoints):
│   ├── UPDATE: All POST API routes
│   ├── UPDATE: All PUT API routes
│   ├── UPDATE: All DELETE API routes
│   └── UPDATE: Client-side fetch calls
├── EDGE CASES (handle these):
│   ├── EDGE: Token rotation on auth changes
│   ├── EDGE: Webhook endpoints (exempt from CSRF)
│   ├── EDGE: Token expiry
│   └── EDGE: Same-origin vs cross-origin requests
└── VALIDATION:
    ├── TEST: Submit form without token → 403
    ├── TEST: Submit form with valid token → success
    └── TEST: Webhook calls work without CSRF
```

### IMPLEMENTATION PROMPT:

```
STEP 1: BUILD CSRF CORE LIBRARY

1.1 Create lib/csrf.ts:
```typescript
import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds

export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function setCsrfCookie(response: NextResponse, token?: string): void {
  const csrfToken = token || generateCsrfToken();

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY,
  });
}

export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

export function getCsrfTokenFromHeader(request: NextRequest): string | null {
  return request.headers.get(CSRF_HEADER_NAME);
}

export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = getCsrfTokenFromRequest(request);
  const headerToken = getCsrfTokenFromHeader(request);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export function isMutationMethod(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
}

export function isWebhookEndpoint(pathname: string): boolean {
  // Exempt webhook endpoints from CSRF
  return pathname.startsWith('/api/webhooks/');
}
```

STEP 2: ADD CSRF TO MIDDLEWARE

2.1 Update lib/supabase/middleware.ts to include CSRF token:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { setCsrfCookie } from '@/lib/csrf';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  // Add CSRF token to all responses
  setCsrfCookie(response);

  return response;
}
```

STEP 3: CREATE CSRF VALIDATION MIDDLEWARE

3.1 Create lib/middleware/csrf.ts:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken, isMutationMethod, isWebhookEndpoint } from '@/lib/csrf';

export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip CSRF check for safe methods
  if (!isMutationMethod(request.method)) {
    return null; // Continue to next middleware
  }

  // Skip CSRF check for webhook endpoints
  if (isWebhookEndpoint(request.nextUrl.pathname)) {
    return null; // Continue to next middleware
  }

  // Validate CSRF token
  if (!validateCsrfToken(request)) {
    return NextResponse.json(
      {
        error: 'Invalid CSRF token. Please refresh the page and try again.',
        code: 'CSRF_VALIDATION_FAILED',
      },
      { status: 403 }
    );
  }

  return null; // CSRF valid, continue
}
```

STEP 4: CREATE CLIENT-SIDE API WRAPPER

4.1 Create lib/api-client.ts:
```typescript
import Cookies from 'js-cookie';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiClient(url: string, options: FetchOptions = {}) {
  const csrfToken = Cookies.get(CSRF_COOKIE_NAME);

  // Add CSRF token to mutation requests
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
    (options.method || 'GET').toUpperCase()
  );

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (isMutation && csrfToken) {
    headers[CSRF_HEADER_NAME] = csrfToken;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: (url: string, options?: FetchOptions) =>
    apiClient(url, { ...options, method: 'GET' }),

  post: (url: string, data?: any, options?: FetchOptions) =>
    apiClient(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (url: string, data?: any, options?: FetchOptions) =>
    apiClient(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (url: string, options?: FetchOptions) =>
    apiClient(url, { ...options, method: 'DELETE' }),
};
```

4.2 Install js-cookie dependency:
```bash
npm install js-cookie
npm install --save-dev @types/js-cookie
```

STEP 5: APPLY CSRF VALIDATION TO ALL API ROUTES

5.1 Create a wrapper for API routes (lib/api-route-wrapper.ts):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken, isMutationMethod, isWebhookEndpoint } from '@/lib/csrf';

type ApiHandler = (request: NextRequest, context?: any) => Promise<NextResponse>;

export function withCsrf(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    // Check CSRF for mutation methods (except webhooks)
    if (
      isMutationMethod(request.method) &&
      !isWebhookEndpoint(request.nextUrl.pathname)
    ) {
      if (!validateCsrfToken(request)) {
        return NextResponse.json(
          {
            error: 'Invalid CSRF token',
            code: 'CSRF_VALIDATION_FAILED',
          },
          { status: 403 }
        );
      }
    }

    // Call the actual handler
    return handler(request, context);
  };
}
```

5.2 Update API routes to use CSRF wrapper:

Example - app/api/admin/users/route.ts:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withCsrf } from '@/lib/api-route-wrapper';

async function handler(request: NextRequest) {
  // Your existing logic here
  return NextResponse.json({ success: true });
}

export const POST = withCsrf(handler);
```

Apply this pattern to ALL mutation API routes:
- app/api/admin/**/route.ts (POST, PUT, DELETE)
- app/api/auth/**/route.ts (POST)
- app/api/organizations/**/route.ts (POST, PUT, DELETE)
- app/api/api-keys/route.ts (POST, DELETE)
- etc.

STEP 6: UPDATE CLIENT-SIDE CODE TO USE API WRAPPER

6.1 Replace all fetch calls with api wrapper:

OLD:
```typescript
const response = await fetch('/api/admin/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

NEW:
```typescript
import { api } from '@/lib/api-client';

const data = await api.post('/api/admin/users', formData);
```

6.2 Update all pages that make API calls:
- app/(app)/app/admin/users/page.tsx
- app/(app)/app/admin/organizations/page.tsx
- app/(app)/app/settings/account/page.tsx
- components/features/email-composer.tsx
- etc.

STEP 7: EXEMPT WEBHOOK ENDPOINTS

7.1 Verify webhook endpoints use signature verification instead:

app/api/webhooks/stripe/route.ts:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    // Verify webhook signature (this replaces CSRF)
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Process webhook event
    // ...

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

Ensure all webhook endpoints (Stripe, PayPal, etc.) verify signatures.

STEP 8: VALIDATION & TESTING

8.1 Test CSRF protection:
- Submit a form WITHOUT using api wrapper → should get 403
- Submit a form WITH api wrapper → should succeed
- Manually remove CSRF header → should get 403
- Modify CSRF token → should get 403

8.2 Test webhook endpoints:
- Send test webhook from Stripe dashboard
- Verify webhook processes without CSRF errors
- Verify invalid signatures are rejected

8.3 Test token rotation:
- Login → get new CSRF token
- Logout → get new CSRF token
- Verify old token no longer works

8.4 Browser testing:
- Test in Chrome, Firefox, Safari
- Verify cookies are set with correct flags
- Check Network tab for CSRF header presence

STEP 9: CLEANUP & VERIFICATION

9.1 Verify all files created:
   - lib/csrf.ts ✓
   - lib/middleware/csrf.ts ✓
   - lib/api-client.ts ✓
   - lib/api-route-wrapper.ts ✓

9.2 Verify all API routes updated:
   - All POST routes wrapped with withCsrf ✓
   - All PUT routes wrapped with withCsrf ✓
   - All DELETE routes wrapped with withCsrf ✓
   - Webhook routes exempt ✓

9.3 Verify all client code updated:
   - All fetch calls replaced with api wrapper ✓
   - CSRF header automatically included ✓

DONE: All atoms built, all dependencies satisfied, CSRF protection fully implemented.
```

---

## FIX #6: Create Custom 404 Page (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
404 PAGE SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: shadcn/ui Card component — ✅ EXISTS
│   ├── ATOM: shadcn/ui Button component — ✅ EXISTS
│   ├── ATOM: Lucide icons — ✅ EXISTS
│   └── ATOM: Next.js Link component — ✅ BUILT-IN
├── CORE ATOMS (build in order):
│   └── ATOM: Custom 404 page — CREATE app/not-found.tsx
├── EDGE CASES (handle these):
│   ├── EDGE: 404 in auth routes
│   ├── EDGE: 404 in app routes
│   └── EDGE: Search functionality on 404
└── VALIDATION:
    ├── TEST: Navigate to invalid URL → see custom 404
    ├── TEST: Test navigation links work
    └── TEST: Verify SEO meta tags
```

### IMPLEMENTATION PROMPT:

```
STEP 1: VERIFY DEPENDENCIES

1.1 Verify UI components exist:
- components/ui/card.tsx ✓
- components/ui/button.tsx ✓
- lucide-react package installed ✓

STEP 2: CREATE CUSTOM 404 PAGE

2.1 Create app/not-found.tsx:
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Home, Search, HelpCircle, Mail, Inbox } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center space-y-4">
          {/* Animated 404 */}
          <div className="flex items-center justify-center">
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-pulse">
              404
            </h1>
          </div>

          <CardTitle className="text-3xl">Page Not Found</CardTitle>
          <CardDescription className="text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search box */}
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search EaseMail
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search for anything..."
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const query = e.currentTarget.value;
                      window.location.href = `/app/inbox?search=${encodeURIComponent(query)}`;
                    }
                  }}
                />
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  const input = document.getElementById('search') as HTMLInputElement;
                  if (input?.value) {
                    window.location.href = `/app/inbox?search=${encodeURIComponent(input.value)}`;
                  }
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Helpful links */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Here are some helpful links instead:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/app/home" className="group">
                <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Dashboard</p>
                      <p className="text-xs text-muted-foreground">Go to home</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/app/inbox" className="group">
                <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Inbox className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Inbox</p>
                      <p className="text-xs text-muted-foreground">Check emails</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/app/help" className="group">
                <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <HelpCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Help Center</p>
                      <p className="text-xs text-muted-foreground">Get support</p>
                    </div>
                  </div>
                </div>
              </Link>

              <a href="mailto:support@easemail.app" className="group">
                <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                      <Mail className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Contact Support</p>
                      <p className="text-xs text-muted-foreground">Email us</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/app/home">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/app/inbox">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Inbox className="h-4 w-4" />
              Go to Inbox
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// SEO metadata
export const metadata = {
  title: 'Page Not Found | EaseMail',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: false,
  },
};
```

STEP 3: ADD METADATA FOR SEO

3.1 The metadata export above handles SEO automatically in Next.js 14

STEP 4: TEST ROUTE-SPECIFIC 404 HANDLING (OPTIONAL)

4.1 Create route-specific not-found pages if needed:

app/(auth)/not-found.tsx (optional):
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AuthNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl">Authentication page not found</p>
        <Link href="/login">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

STEP 5: VALIDATION & TESTING

5.1 Test 404 page:
- Navigate to /invalid-url → see custom 404
- Navigate to /app/invalid-page → see custom 404
- Test all navigation buttons work
- Test search functionality

5.2 Test responsive design:
- Test on mobile (375px width)
- Test on tablet (768px width)
- Test on desktop (1440px width)
- Verify card layout adapts properly

5.3 Test SEO:
- View page source → verify noindex meta tag
- Check title tag is set correctly
- Verify robots meta tag

STEP 6: CLEANUP & VERIFICATION

6.1 Verify file created:
   - app/not-found.tsx ✓

6.2 Test in production build:
   npm run build
   npm start
   - Navigate to invalid URL
   - Verify custom 404 appears

DONE: All atoms built, all dependencies satisfied, custom 404 page fully implemented.
```

---

## FIX #7: Add File Upload Validation (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
FILE UPLOAD VALIDATION SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: Zod schema library — ✅ EXISTS
│   ├── ATOM: File type detection — ⚠️ CREATE lib/file-utils.ts
│   ├── ATOM: File size formatter — ⚠️ CREATE lib/format-utils.ts
│   └── ATOM: API error responses — ✅ EXISTS
├── CORE ATOMS (build in order):
│   ├── ATOM: File validation schema — CREATE lib/validations/file.ts
│   ├── ATOM: File sanitization — CREATE lib/sanitize-filename.ts
│   └── ATOM: Server-side validation — UPDATE app/api/attachments/upload/route.ts
├── CLIENT ATOMS:
│   └── ATOM: Client-side validation — UPDATE components/email/attachment-uploader.tsx
├── EDGE CASES (handle these):
│   ├── EDGE: File type spoofing (check magic bytes)
│   ├── EDGE: Malicious filenames
│   ├── EDGE: ZIP bombs / recursive archives
│   └── EDGE: Multiple file uploads exceeding total size
└── VALIDATION:
    ├── TEST: Upload allowed file types → success
    ├── TEST: Upload disallowed types → 400 error
    ├── TEST: Upload oversized file → 400 error
    └── TEST: Upload too many files → 400 error
```

### IMPLEMENTATION PROMPT:

```
STEP 1: BUILD FILE UTILITIES

1.1 Create lib/file-utils.ts:
```typescript
// File type detection using magic bytes
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]],
  'application/x-rar': [[0x52, 0x61, 0x72, 0x21]],
};

export async function detectFileType(file: File | Buffer): Promise<string | null> {
  let bytes: number[];

  if (file instanceof File) {
    const arrayBuffer = await file.slice(0, 12).arrayBuffer();
    bytes = Array.from(new Uint8Array(arrayBuffer));
  } else {
    bytes = Array.from(file.slice(0, 12));
  }

  for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      if (signature.every((byte, index) => bytes[index] === byte)) {
        return mimeType;
      }
    }
  }

  return null;
}

export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  // Text
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_FILES = 10;

export function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType);
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}
```

1.2 Create lib/format-utils.ts:
```typescript
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatFileSizeShort(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
```

1.3 Create lib/sanitize-filename.ts:
```typescript
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  filename = filename.replace(/\.\.\//g, '');
  filename = filename.replace(/\\/g, '');

  // Remove null bytes
  filename = filename.replace(/\0/g, '');

  // Replace dangerous characters
  filename = filename.replace(/[<>:"|?*]/g, '_');

  // Replace whitespace runs with single space
  filename = filename.replace(/\s+/g, ' ');

  // Trim and limit length
  filename = filename.trim().substring(0, 255);

  // Ensure it's not empty
  if (!filename) {
    filename = 'unnamed_file';
  }

  return filename;
}

export function isValidFilename(filename: string): boolean {
  // Check for path traversal
  if (filename.includes('../') || filename.includes('..\\')) {
    return false;
  }

  // Check for null bytes
  if (filename.includes('\0')) {
    return false;
  }

  // Check length
  if (filename.length === 0 || filename.length > 255) {
    return false;
  }

  return true;
}
```

STEP 2: CREATE VALIDATION SCHEMA

2.1 Create lib/validations/file.ts:
```typescript
import { z } from 'zod';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MAX_FILES } from '@/lib/file-utils';

export const fileUploadSchema = z.object({
  files: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
  }))
    .max(MAX_FILES, `Maximum ${MAX_FILES} files allowed`)
    .refine(
      (files) => files.every(f => f.size <= MAX_FILE_SIZE),
      `Each file must be less than 25MB`
    )
    .refine(
      (files) => files.every(f => ALLOWED_FILE_TYPES.includes(f.type)),
      `File type not allowed`
    ),
});
```

STEP 3: UPDATE SERVER-SIDE UPLOAD ENDPOINT

3.1 Update app/api/attachments/upload/route.ts:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  detectFileType,
  isAllowedFileType,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  MAX_FILES,
} from '@/lib/file-utils';
import { sanitizeFilename, isValidFilename } from '@/lib/sanitize-filename';
import { formatFileSize } from '@/lib/format-utils';
import { ApiErrors } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    // VALIDATION 1: Check file count
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed per upload` },
        { status: 400 }
      );
    }

    // VALIDATION 2: Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        {
          error: `Total upload size ${formatFileSize(totalSize)} exceeds maximum ${formatFileSize(MAX_TOTAL_SIZE)}`,
        },
        { status: 400 }
      );
    }

    const uploadedFiles: any[] = [];
    const errors: any[] = [];

    // Process each file
    for (const file of files) {
      try {
        // VALIDATION 3: Check individual file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push({
            filename: file.name,
            error: `File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(MAX_FILE_SIZE)}`,
          });
          continue;
        }

        // VALIDATION 4: Check filename
        if (!isValidFilename(file.name)) {
          errors.push({
            filename: file.name,
            error: 'Invalid filename',
          });
          continue;
        }

        // VALIDATION 5: Sanitize filename
        const sanitizedName = sanitizeFilename(file.name);

        // VALIDATION 6: Check file type (declared MIME type)
        if (!isAllowedFileType(file.type)) {
          errors.push({
            filename: file.name,
            error: `File type '${file.type}' not allowed`,
          });
          continue;
        }

        // VALIDATION 7: Verify actual file type (magic bytes)
        const buffer = Buffer.from(await file.arrayBuffer());
        const detectedType = await detectFileType(buffer);

        if (detectedType && detectedType !== file.type) {
          errors.push({
            filename: file.name,
            error: `File type mismatch: declared as '${file.type}' but detected as '${detectedType}'`,
          });
          continue;
        }

        // VALIDATION 8: Check for empty files
        if (file.size === 0) {
          errors.push({
            filename: file.name,
            error: 'File is empty',
          });
          continue;
        }

        // Upload to Supabase Storage
        const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;
        const { data, error } = await supabase.storage
          .from('attachments')
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          errors.push({
            filename: file.name,
            error: error.message,
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          name: sanitizedName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          path: filePath,
        });

      } catch (error: any) {
        errors.push({
          filename: file.name,
          error: error.message || 'Upload failed',
        });
      }
    }

    // Return results
    if (uploadedFiles.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          error: 'All uploads failed',
          details: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}
```

STEP 4: UPDATE CLIENT-SIDE VALIDATION

4.1 Update components/email/attachment-uploader.tsx:
```typescript
// Add imports
import { isAllowedFileType, MAX_FILE_SIZE, MAX_FILES } from '@/lib/file-utils';
import { formatFileSize } from '@/lib/format-utils';
import { toast } from 'sonner';

// In the file selection handler:
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = Array.from(event.target.files || []);

  // Client-side validation (UX only - server always validates)

  // Check count
  if (selectedFiles.length > MAX_FILES) {
    toast.error(`Maximum ${MAX_FILES} files allowed`);
    return;
  }

  // Check each file
  const validFiles: File[] = [];
  for (const file of selectedFiles) {
    // Check size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name}: File too large (max ${formatFileSize(MAX_FILE_SIZE)})`);
      continue;
    }

    // Check type
    if (!isAllowedFileType(file.type)) {
      toast.error(`${file.name}: File type not allowed`);
      continue;
    }

    // Check for empty
    if (file.size === 0) {
      toast.error(`${file.name}: File is empty`);
      continue;
    }

    validFiles.push(file);
  }

  if (validFiles.length === 0) {
    return;
  }

  // Upload valid files
  uploadFiles(validFiles);
};
```

STEP 5: ADD VIRUS SCANNING (OPTIONAL BUT RECOMMENDED)

5.1 If budget allows, integrate ClamAV or cloud virus scanner:
```typescript
// lib/virus-scan.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function scanFile(filePath: string): Promise<boolean> {
  try {
    // Using ClamAV
    await execAsync(`clamscan --no-summary ${filePath}`);
    return true; // Clean
  } catch (error) {
    return false; // Infected or error
  }
}
```

STEP 6: VALIDATION & TESTING

6.1 Test file type validation:
- Upload .jpg → success
- Upload .exe → error (not allowed)
- Rename .exe to .jpg → error (magic byte detection)

6.2 Test file size validation:
- Upload 1MB file → success
- Upload 30MB file → error (too large)
- Upload 10 files of 3MB each → success
- Upload 11 files → error (too many)

6.3 Test filename sanitization:
- Upload "../../etc/passwd.txt" → sanitized
- Upload "file<>name.pdf" → sanitized
- Upload file with null bytes → sanitized

6.4 Test total size limit:
- Upload 5 files of 15MB each → error (total too large)
- Upload 3 files of 20MB each → success

STEP 7: CLEANUP & VERIFICATION

7.1 Verify all files created:
   - lib/file-utils.ts ✓
   - lib/format-utils.ts ✓
   - lib/sanitize-filename.ts ✓
   - lib/validations/file.ts ✓

7.2 Verify server validation:
   - app/api/attachments/upload/route.ts updated ✓
   - All 8 validation checks implemented ✓
   - Magic byte detection working ✓

7.3 Verify client validation:
   - components/email/attachment-uploader.tsx updated ✓
   - Client-side checks provide UX feedback ✓
   - Server-side still validates (never trust client) ✓

DONE: All atoms built, all dependencies satisfied, file upload validation fully implemented.
```

---

## FIX #8: Add Empty States to All List Pages (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
EMPTY STATE SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: Lucide icons — ✅ EXISTS
│   ├── ATOM: shadcn/ui Button — ✅ EXISTS
│   └── ATOM: shadcn/ui Card — ✅ EXISTS
├── CORE ATOMS (build in order):
│   └── ATOM: Reusable EmptyState component — CREATE components/ui/empty-state.tsx
├── INTEGRATION (add to all list pages):
│   ├── UPDATE: app/(app)/app/inbox/page.tsx
│   ├── UPDATE: app/(app)/app/calendar/page.tsx
│   ├── UPDATE: app/(app)/app/contacts/page.tsx
│   ├── UPDATE: app/(app)/app/sms/page.tsx
│   ├── UPDATE: app/(app)/app/attachments/page.tsx
│   ├── UPDATE: app/(app)/app/admin/users/page.tsx
│   └── UPDATE: app/(app)/app/admin/organizations/page.tsx
├── EDGE CASES:
│   ├── EDGE: Empty due to filters (show different message)
│   ├── EDGE: Empty due to search (show different message)
│   └── EDGE: First-time user (show onboarding CTA)
└── VALIDATION:
    ├── TEST: Delete all items → see empty state
    ├── TEST: Click action button → works
    └── TEST: Responsive on mobile
```

### IMPLEMENTATION PROMPT:

```
STEP 1: CREATE REUSABLE EMPTY STATE COMPONENT

1.1 Create components/ui/empty-state.tsx:
```typescript
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center min-h-[400px]",
      className
    )}>
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  );
}
```

STEP 2: ADD EMPTY STATES TO INBOX

2.1 Update app/(app)/app/inbox/page.tsx:
```typescript
import { EmptyState } from '@/components/ui/empty-state';
import { Inbox, Search, Filter } from 'lucide-react';

// Inside component rendering logic:
{!loading && messages.length === 0 && (
  <>
    {searchQuery ? (
      // Empty due to search
      <EmptyState
        icon={Search}
        title="No emails found"
        description={`No emails match "${searchQuery}". Try a different search term.`}
        action={
          <Button onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        }
      />
    ) : activeFolderFilter && activeFolderFilter !== 'inbox' ? (
      // Empty folder
      <EmptyState
        icon={Inbox}
        title={`No emails in ${activeFolderFilter}`}
        description={`This folder is empty. Emails you ${activeFolderFilter} will appear here.`}
      />
    ) : (
      // No emails at all
      <EmptyState
        icon={Inbox}
        title="No emails yet"
        description="When you receive emails, they'll appear here. Start by composing your first email!"
        action={
          <Button onClick={() => setComposing(true)}>
            Compose Email
          </Button>
        }
      />
    )}
  </>
)}
```

STEP 3: ADD EMPTY STATES TO CALENDAR

3.1 Update app/(app)/app/calendar/page.tsx:
```typescript
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar, Plus } from 'lucide-react';

// Inside component:
{!loading && events.length === 0 && (
  <EmptyState
    icon={Calendar}
    title="No events scheduled"
    description="Your calendar is empty. Create your first event to get started."
    action={
      <Button onClick={() => setShowCreateEvent(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Event
      </Button>
    }
  />
)}
```

STEP 4: ADD EMPTY STATES TO CONTACTS

4.1 Update app/(app)/app/contacts/page.tsx:
```typescript
import { EmptyState } from '@/components/ui/empty-state';
import { Users, UserPlus, Download } from 'lucide-react';

// Inside component:
{!loading && contacts.length === 0 && (
  <EmptyState
    icon={Users}
    title="No contacts yet"
    description="Add contacts manually or sync them from your connected email accounts."
    action={
      <>
        <Button onClick={() => setShowAddContact(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
        <Button variant="outline" onClick={syncContacts}>
          <Download className="h-4 w-4 mr-2" />
          Sync Contacts
        </Button>
      </>
    }
  />
)}
```

STEP 5: ADD EMPTY STATES TO SMS

5.1 Update app/(app)/app/sms/page.tsx:
```typescript
import { EmptyState } from '@/components/ui/empty-state';
import { MessageCircle, Plus } from 'lucide-react';

// Inside component:
{!loading && conversations.length === 0 && (
  <EmptyState
    icon={MessageCircle}
    title="No conversations yet"
    description="Start a new SMS conversation to get started. You can send messages to any phone number."
    action={
      <Button onClick={() => setShowNewMessage(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Message
      </Button>
    }
  />
)}
```

STEP 6: ADD EMPTY STATES TO ATTACHMENTS

6.1 Update app/(app)/app/attachments/page.tsx:
```typescript
import { EmptyState } from '@/components/ui/empty-state';
import { Paperclip, Inbox } from 'lucide-react';

// Inside component:
{!loading && attachments.length === 0 && (
  <EmptyState
    icon={Paperclip}
    title="No attachments yet"
    description="Attachments from your emails will appear here. Send or receive emails with attachments to see them here."
    action={
      <Button onClick={() => router.push('/app/inbox')}>
        <Inbox className="h-4 w-4 mr-2" />
        Go to Inbox
      </Button>
    }
  />
)}
```

STEP 7: ADD EMPTY STATES TO ADMIN PAGES

7.1 Update app/(app)/app/admin/users/page.tsx:
```typescript
import { EmptyState } from '@/components/ui/empty-state';
import { UserPlus, Users } from 'lucide-react';

// Inside component:
{!loading && users.length === 0 && (
  <EmptyState
    icon={Users}
    title="No users yet"
    description="Create your first user to get started with user management."
    action={
      <Button onClick={() => router.push('/app/admin/users/create-individual')}>
        <UserPlus className="h-4 w-4 mr-2" />
        Create User
      </Button>
    }
  />
)}
```

7.2 Update app/(app)/app/admin/organizations/page.tsx:
```typescript
import { EmptyState } from '@/components/ui/empty-state';
import { Building2, Plus } from 'lucide-react';

// Inside component:
{!loadingOrgs && organizations.length === 0 && (
  <EmptyState
    icon={Building2}
    title="No organizations yet"
    description="Create an organization to manage teams and billing."
    action={
      <Button onClick={() => setShowWizard(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Organization
      </Button>
    }
  />
)}
```

STEP 8: VALIDATION & TESTING

8.1 Test each empty state:
- Inbox: Delete all emails → see empty state
- Calendar: Delete all events → see empty state
- Contacts: Clear all contacts → see empty state
- SMS: Clear conversations → see empty state
- Attachments: Delete all → see empty state
- Admin users: No users → see empty state
- Admin orgs: No organizations → see empty state

8.2 Test action buttons:
- Click each action button
- Verify it performs correct action
- Verify modals/dialogs open

8.3 Test responsive:
- View on mobile (375px)
- Verify icon, text, buttons adapt properly
- Verify readable and accessible

8.4 Test edge cases:
- Empty due to search → shows search-specific message
- Empty due to filter → shows filter-specific message
- Truly empty → shows onboarding message

STEP 9: CLEANUP & VERIFICATION

9.1 Verify component created:
   - components/ui/empty-state.tsx ✓

9.2 Verify all pages updated:
   - Inbox ✓
   - Calendar ✓
   - Contacts ✓
   - SMS ✓
   - Attachments ✓
   - Admin Users ✓
   - Admin Organizations ✓

9.3 Consistency check:
   - All empty states use same component
   - Icons match content type
   - Descriptions are helpful and friendly
   - Actions are clear and available

DONE: All atoms built, all dependencies satisfied, empty states fully implemented.
```

---

## FIX #9: Add Comprehensive Input Validation (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
INPUT VALIDATION SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: Zod library — ✅ EXISTS
│   ├── ATOM: react-hook-form — ✅ EXISTS
│   └── ATOM: @hookform/resolvers — ✅ EXISTS
├── CORE ATOMS (build in order):
│   ├── ATOM: Auth validation schemas — CREATE lib/validations/auth.ts
│   ├── ATOM: Email validation schemas — CREATE lib/validations/email.ts
│   ├── ATOM: Organization validation schemas — CREATE lib/validations/organization.ts
│   ├── ATOM: Billing validation schemas — CREATE lib/validations/billing.ts
│   ├── ATOM: User validation schemas — CREATE lib/validations/user.ts
│   └── ATOM: Common validation utilities — CREATE lib/validations/common.ts
├── SERVER INTEGRATION:
│   ├── UPDATE: All API routes with validation
│   └── ADD: Validation error formatting
├── CLIENT INTEGRATION:
│   ├── UPDATE: All forms with react-hook-form + zod
│   └── ADD: Inline validation errors
├── EDGE CASES:
│   ├── EDGE: Async validation (check email exists)
│   ├── EDGE: Conditional validation (password confirmation)
│   └── EDGE: Custom validation rules
└── VALIDATION:
    ├── TEST: Submit invalid data → see inline errors
    ├── TEST: Submit valid data → success
    └── TEST: Async validation works
```

### IMPLEMENTATION PROMPT:

```
STEP 1: CREATE VALIDATION SCHEMAS

1.1 Create lib/validations/common.ts:
```typescript
import { z } from 'zod';

// Common patterns
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(5, 'Email is too short')
  .max(255, 'Email is too long')
  .toLowerCase();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number (E.164 format required)');

export const urlSchema = z.string()
  .url('Invalid URL')
  .max(2048, 'URL is too long');

export const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(63, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with hyphen');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Sanitization helpers
export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

export function sanitizeHtml(html: string): string {
  // Use DOMPurify on client, or a server-side library
  // This is a placeholder
  return html;
}
```

1.2 Create lib/validations/auth.ts:
```typescript
import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from './common';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema.optional(),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const twoFactorSchema = z.object({
  code: z.string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
```

1.3 Create lib/validations/email.ts:
```typescript
import { z } from 'zod';
import { emailSchema } from './common';

export const composeEmailSchema = z.object({
  to: z.array(emailSchema).min(1, 'At least one recipient required'),
  cc: z.array(emailSchema).optional(),
  bcc: z.array(emailSchema).optional(),
  subject: z.string().max(998, 'Subject is too long'),
  body: z.string(),
  attachments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    url: z.string().url(),
  })).optional(),
});

export const emailFilterSchema = z.object({
  folder: z.enum(['inbox', 'sent', 'trash', 'archive', 'starred', 'snoozed']).optional(),
  unread: z.boolean().optional(),
  hasAttachments: z.boolean().optional(),
  from: emailSchema.optional(),
  to: emailSchema.optional(),
  subject: z.string().optional(),
});

export type ComposeEmailInput = z.infer<typeof composeEmailSchema>;
export type EmailFilterInput = z.infer<typeof emailFilterSchema>;
```

1.4 Create lib/validations/organization.ts:
```typescript
import { z } from 'zod';
import { emailSchema, slugSchema } from './common';

export const createOrganizationSchema = z.object({
  name: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name is too long'),
  slug: slugSchema.optional(),
  domain: z.string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, 'Invalid domain')
    .optional(),
  plan: z.enum(['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE']).default('FREE'),
  seats: z.number()
    .int('Seats must be a whole number')
    .min(1, 'At least 1 seat required')
    .max(10000, 'Maximum 10000 seats'),
  billing_email: emailSchema,
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
```

1.5 Create lib/validations/user.ts:
```typescript
import { z } from 'zod';
import { emailSchema, nameSchema } from './common';

export const updateProfileSchema = z.object({
  name: nameSchema,
  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'es', 'fr', 'de']).optional(),
  timezone: z.string().optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
```

STEP 2: UPDATE API ROUTES WITH VALIDATION

2.1 Update app/api/auth/login/route.ts (or similar):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Your auth logic here...

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

2.2 Apply same pattern to all API routes:
- app/api/auth/signup/route.ts → use signupSchema
- app/api/admin/organizations/create/route.ts → use createOrganizationSchema
- app/api/admin/users/route.ts → use appropriate schema
- etc.

STEP 3: UPDATE CLIENT-SIDE FORMS

3.1 Update login form to use validation:

app/(auth)/login/page.tsx:
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      // Your login logic
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      // Success - redirect
      window.location.href = '/app/home';

    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </Button>
    </form>
  );
}
```

3.2 Apply same pattern to all forms:
- Signup form → use signupSchema
- Create organization form → use createOrganizationSchema
- Profile settings form → use updateProfileSchema
- Email composer → use composeEmailSchema
- etc.

STEP 4: VALIDATION & TESTING

4.1 Test inline validation:
- Type invalid email → see error immediately
- Type short password → see error
- Fix errors → errors disappear

4.2 Test server validation:
- Bypass client validation → server rejects
- Send invalid data via API → 400 response with details

4.3 Test edge cases:
- Password confirmation mismatch → error
- Duplicate email → error
- Invalid organization slug → error

STEP 5: CLEANUP & VERIFICATION

5.1 Verify all schema files created:
   - lib/validations/common.ts ✓
   - lib/validations/auth.ts ✓
   - lib/validations/email.ts ✓
   - lib/validations/organization.ts ✓
   - lib/validations/user.ts ✓

5.2 Verify API routes updated:
   - All routes validate input ✓
   - Return helpful error messages ✓

5.3 Verify forms updated:
   - All forms use react-hook-form + zod ✓
   - Show inline validation errors ✓

DONE: All atoms built, all dependencies satisfied, input validation fully implemented.
```

---

## FIX #10: Add Mobile Responsive Breakpoints (with Atomic Dependencies)

### ATOMIC DEPENDENCY MAP:
```
MOBILE RESPONSIVE SYSTEM
├── DEPENDENCIES (build these first):
│   ├── ATOM: Tailwind breakpoints — ✅ EXISTS (sm:, md:, lg:, xl:)
│   └── ATOM: Mobile navigation — ✅ EXISTS (components/layout/mobile-nav.tsx)
├── CORE ATOMS (update all pages and components):
│   ├── UPDATE: Layout components
│   ├── UPDATE: Page components
│   ├── UPDATE: Feature components
│   └── UPDATE: UI components
├── PATTERNS TO APPLY:
│   ├── PATTERN: Stack columns on mobile (flex-col md:flex-row)
│   ├── PATTERN: Hide/show elements (hidden md:block)
│   ├── PATTERN: Responsive grids (grid-cols-1 md:grid-cols-2)
│   ├── PATTERN: Responsive text (text-2xl md:text-4xl)
│   ├── PATTERN: Responsive padding (p-4 md:p-8)
│   └── PATTERN: Touch targets (min-h-11 md:min-h-10)
├── EDGE CASES:
│   ├── EDGE: Horizontal scroll prevention
│   ├── EDGE: Touch target sizes (44px minimum)
│   └── EDGE: Mobile-specific interactions
└── VALIDATION:
    ├── TEST: View at 375px width
    ├── TEST: View at 768px width
    ├── TEST: No horizontal scroll
    └── TEST: All interactions work on touch
```

### IMPLEMENTATION PROMPT:

```
STEP 1: DEFINE RESPONSIVE PATTERNS

1.1 Document responsive breakpoints (Tailwind defaults):
- sm: 640px (large phone landscape)
- md: 768px (tablet portrait)
- lg: 1024px (tablet landscape / small laptop)
- xl: 1280px (desktop)
- 2xl: 1536px (large desktop)

1.2 Create responsive patterns guide (for reference):

Common patterns:
```typescript
// Layout stacking
<div className="flex flex-col md:flex-row">

// Hide/show elements
<div className="hidden md:block"> // Hide on mobile
<div className="md:hidden"> // Show only on mobile

// Responsive grids
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive text sizes
<h1 className="text-2xl md:text-4xl lg:text-5xl">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
<div className="gap-2 md:gap-4 lg:gap-6">

// Responsive widths
<div className="w-full md:w-auto">
<div className="max-w-full md:max-w-2xl">

// Touch targets (mobile)
<Button className="h-12 md:h-10"> // Larger on mobile

// Full-screen modals on mobile
<Dialog className="sm:max-w-lg">
```

STEP 2: UPDATE LAYOUT COMPONENTS

2.1 Update components/layout/app-sidebar.tsx:
```typescript
// Make sidebar hideable on mobile
<aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
  {/* Sidebar content */}
</aside>
```

2.2 Update components/layout/app-header.tsx:
```typescript
<header className="h-16 border-b bg-background px-4 md:px-6 flex items-center justify-between">
  {/* Mobile menu button */}
  <button className="md:hidden" onClick={toggleMobileMenu}>
    <Menu className="h-6 w-6" />
  </button>

  {/* Header content - responsive */}
  <div className="flex items-center gap-2 md:gap-4">
    {/* ... */}
  </div>
</header>
```

2.3 Update components/layout/mobile-nav.tsx:
```typescript
// Ensure mobile nav is only shown on small screens
<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetContent side="left" className="w-64 md:hidden">
    {/* Mobile navigation items */}
  </SheetContent>
</Sheet>
```

STEP 3: UPDATE INBOX PAGE

3.1 Update app/(app)/app/inbox/page.tsx:
```typescript
<div className="flex h-[calc(100vh-4rem)] w-full flex-col md:flex-row">
  {/* Folder sidebar - hide on mobile */}
  <div className="hidden lg:flex w-48 border-r bg-muted/40 flex-col p-4">
    {/* Folders */}
  </div>

  {/* Email list */}
  <div className="flex-1 border-r md:max-w-md lg:max-w-lg">
    {/* Search - full width on mobile */}
    <div className="p-3 md:p-4 border-b">
      <Input className="w-full" placeholder="Search emails..." />
    </div>

    {/* Email items */}
    <div className="divide-y">
      {messages.map((msg) => (
        <div key={msg.id} className="p-3 md:p-4 hover:bg-accent cursor-pointer">
          <div className="flex items-start gap-3">
            {/* Avatar - smaller on mobile */}
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              {/* ... */}
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Sender and time - responsive */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm md:text-base truncate">
                  {msg.from}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {msg.time}
                </span>
              </div>

              {/* Subject - responsive */}
              <p className="text-sm md:text-base font-medium truncate">
                {msg.subject}
              </p>

              {/* Preview - hide on very small screens */}
              <p className="hidden sm:block text-sm text-muted-foreground truncate">
                {msg.preview}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Preview pane - hide on mobile and tablet */}
  <div className="hidden xl:flex flex-1 flex-col">
    {/* Email preview */}
  </div>
</div>
```

STEP 4: UPDATE CALENDAR PAGE

4.1 Update app/(app)/app/calendar/page.tsx:
```typescript
<div className="p-4 md:p-6 space-y-4 md:space-y-6">
  {/* Header - stack on mobile */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <h1 className="text-2xl md:text-3xl font-bold">Calendar</h1>

    {/* Actions - full width on mobile */}
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <Button className="flex-1 sm:flex-none">
        <Plus className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Create Event</span>
        <span className="sm:hidden">New</span>
      </Button>
    </div>
  </div>

  {/* View selector - horizontal scroll on mobile */}
  <div className="flex gap-2 overflow-x-auto pb-2">
    {['Day', 'Week', 'Month', 'Agenda'].map((view) => (
      <Button
        key={view}
        variant={currentView === view ? 'default' : 'outline'}
        className="shrink-0"
      >
        {view}
      </Button>
    ))}
  </div>

  {/* Calendar grid - switch to list on mobile */}
  <div className="hidden md:block border rounded-lg">
    {/* Desktop calendar grid */}
  </div>

  <div className="md:hidden space-y-2">
    {/* Mobile event list */}
    {events.map((event) => (
      <div key={event.id} className="p-4 border rounded-lg">
        <p className="font-medium">{event.title}</p>
        <p className="text-sm text-muted-foreground">{event.time}</p>
      </div>
    ))}
  </div>
</div>
```

STEP 5: UPDATE ADMIN PAGES

5.1 Update app/(app)/app/admin/users/page.tsx:
```typescript
<div className="p-4 md:p-6 space-y-4 md:space-y-6">
  {/* Header - responsive */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
      <p className="text-sm text-muted-foreground">Manage all users</p>
    </div>

    <Button className="w-full sm:w-auto">
      <UserPlus className="h-4 w-4 mr-2" />
      Create User
    </Button>
  </div>

  {/* Table - convert to cards on mobile */}
  <div className="hidden md:block border rounded-lg">
    {/* Desktop table */}
  </div>

  <div className="md:hidden space-y-3">
    {/* Mobile cards */}
    {users.map((user) => (
      <div key={user.id} className="p-4 border rounded-lg space-y-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <Badge>{user.role}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    ))}
  </div>
</div>
```

STEP 6: UPDATE EMAIL COMPOSER

6.1 Update components/features/email-composer.tsx:
```typescript
<Dialog open={open} onOpenChange={onOpenChange}>
  {/* Full screen on mobile, modal on desktop */}
  <DialogContent className="max-w-full md:max-w-3xl h-screen md:h-auto">
    <DialogHeader className="px-4 md:px-6">
      <DialogTitle className="text-lg md:text-xl">Compose Email</DialogTitle>
    </DialogHeader>

    <div className="flex-1 flex flex-col gap-4 p-4 md:p-6">
      {/* To field */}
      <div className="space-y-2">
        <Label className="text-sm">To</Label>
        <Input
          placeholder="Recipients..."
          className="h-11 md:h-10" // Larger touch target on mobile
        />
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label className="text-sm">Subject</Label>
        <Input
          placeholder="Email subject..."
          className="h-11 md:h-10"
        />
      </div>

      {/* Editor - responsive height */}
      <div className="flex-1 min-h-[300px] md:min-h-[400px]">
        {/* Rich text editor */}
      </div>

      {/* Toolbar - stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
        <Button className="flex-1 sm:flex-none h-11 md:h-10">
          Send
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none h-11 md:h-10">
          Save Draft
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

STEP 7: PREVENT HORIZONTAL SCROLL

7.1 Update app/(app)/layout.tsx:
```typescript
<body className="overflow-x-hidden">
  {children}
</body>
```

7.2 Add to globals.css:
```css
/* Prevent horizontal scroll */
html,
body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Ensure images don't overflow */
img {
  max-width: 100%;
  height: auto;
}

/* Ensure tables are scrollable on mobile */
@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
```

STEP 8: ENSURE TOUCH TARGET SIZES

8.1 Update button components for mobile:
```typescript
// In components/ui/button.tsx variants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-11 md:h-10 px-4 py-2", // Larger on mobile
        sm: "h-10 md:h-9 rounded-md px-3 text-xs",
        lg: "h-12 md:h-11 rounded-md px-8",
        icon: "h-11 w-11 md:h-10 md:w-10", // Larger on mobile
      },
    },
  }
);
```

STEP 9: VALIDATION & TESTING

9.1 Test at key breakpoints:
- 375px (iPhone SE) - mobile
- 768px (iPad portrait) - tablet
- 1024px (iPad landscape) - small desktop
- 1440px - desktop

9.2 Test each page:
- Inbox: Verify list works, preview pane hides on mobile
- Calendar: Verify switches to list view on mobile
- Contacts: Verify grid adapts to columns
- Admin: Verify tables convert to cards on mobile
- Settings: Verify form layout stacks on mobile

9.3 Test interactions:
- All buttons are tappable (44px+ on mobile)
- No horizontal scroll anywhere
- Dropdowns and menus work on mobile
- Forms are usable on mobile keyboard

9.4 Use Chrome DevTools:
- Device toolbar to test breakpoints
- Lighthouse mobile score
- Touch emulation for interactions

STEP 10: CLEANUP & VERIFICATION

10.1 Verify all pages updated:
   - Layout components ✓
   - Inbox page ✓
   - Calendar page ✓
   - Contacts page ✓
   - Admin pages ✓
   - Settings pages ✓
   - Email composer ✓

10.2 Verify patterns applied:
   - Stack on mobile (flex-col md:flex-row) ✓
   - Hide/show elements (hidden md:block) ✓
   - Responsive grids ✓
   - Responsive text sizes ✓
   - Touch targets 44px minimum ✓

10.3 Test production build:
   npm run build
   - Test on real mobile device
   - Test on tablet
   - Verify no regressions

DONE: All atoms built, all dependencies satisfied, mobile responsive design fully implemented.
```

---

## 🎉 ALL 10 ATOMIC FIX PROMPTS COMPLETE!

You now have complete, dependency-mapped implementation guides for:
1. ✅ Error Boundaries
2. ✅ Loading States
3. ✅ Skeleton Components
4. ✅ Rate Limiting
5. ✅ CSRF Protection
6. ✅ Custom 404 Page
7. ✅ File Upload Validation
8. ✅ Empty States
9. ✅ Input Validation
10. ✅ Mobile Responsive

Each prompt includes:
- Complete atomic dependency map
- Build order (dependencies first)
- Full implementation code
- Validation & testing steps
- Edge case handling

**Ready to implement!** Copy any prompt and paste it to Claude Code to begin implementation.
