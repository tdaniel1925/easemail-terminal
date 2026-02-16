# Standard API Route Template

Use this template for all new API routes to ensure consistent error handling, validation, and authentication.

## Full Example

```typescript
/**
 * STANDARD API ROUTE TEMPLATE
 * Use this template for all new API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ApiErrors, handleSupabaseError } from '@/lib/api-error';
import { requireAuth } from '@/lib/middleware/auth';
import { validateRequest } from '@/lib/middleware/validate';
import { withErrorHandler } from '@/lib/middleware/error-handler';

// 1. Define validation schema
const createResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  // ... other fields
});

// 2. GET handler
export const GET = withErrorHandler(async (
  request: NextRequest
) => {
  // Authenticate
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch data
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return handleSupabaseError(error, 'Failed to fetch resources');
    }

    return NextResponse.json({ resources: data || [] });
  } catch (error) {
    console.error('GET /api/resources error:', error);
    return ApiErrors.internalError('Failed to fetch resources');
  }
});

// 3. POST handler
export const POST = withErrorHandler(async (
  request: NextRequest
) => {
  // Authenticate
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  // Validate request body
  const { data: validatedData, error: validationError } = await validateRequest(
    request,
    createResourceSchema
  );
  if (validationError) return validationError;

  try {
    const supabase = await createClient();

    // Create resource
    const { data, error } = await supabase
      .from('resources')
      .insert({
        ...validatedData,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error, 'Failed to create resource');
    }

    return NextResponse.json({ resource: data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/resources error:', error);
    return ApiErrors.internalError('Failed to create resource');
  }
});

// 4. PUT/PATCH handler
export const PATCH = withErrorHandler(async (
  request: NextRequest
) => {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const { data: validatedData, error: validationError } = await validateRequest(
    request,
    createResourceSchema.partial() // Allow partial updates
  );
  if (validationError) return validationError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return ApiErrors.badRequest('Resource ID is required');
    }

    const supabase = await createClient();

    // Update resource
    const { data, error } = await supabase
      .from('resources')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns resource
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error, 'Failed to update resource');
    }

    if (!data) {
      return ApiErrors.notFound('Resource');
    }

    return NextResponse.json({ resource: data });
  } catch (error) {
    console.error('PATCH /api/resources error:', error);
    return ApiErrors.internalError('Failed to update resource');
  }
});

// 5. DELETE handler
export const DELETE = withErrorHandler(async (
  request: NextRequest
) => {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return ApiErrors.badRequest('Resource ID is required');
    }

    const supabase = await createClient();

    // Delete resource
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return handleSupabaseError(error, 'Failed to delete resource');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/resources error:', error);
    return ApiErrors.internalError('Failed to delete resource');
  }
});
```

## Key Patterns

### 1. Always use `withErrorHandler`
Wrap all route handlers with the error handler wrapper:
```typescript
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Your handler code
});
```

### 2. Use middleware for authentication
```typescript
const { user, error: authError } = await requireAuth();
if (authError) return authError;
```

For super admin routes:
```typescript
const { user, error: authError } = await requireSuperAdmin();
if (authError) return authError;
```

### 3. Validate all inputs
```typescript
const { data, error: validationError } = await validateRequest(
  request,
  yourSchema
);
if (validationError) return validationError;
```

### 4. Handle Supabase errors properly
```typescript
if (error) {
  return handleSupabaseError(error, 'User-friendly message');
}
```

### 5. Return appropriate status codes
- `200`: Success (GET, PATCH, DELETE)
- `201`: Created (POST)
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (no auth)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Common Error Responses

```typescript
// Authentication
return ApiErrors.unauthorized('Authentication required');
return ApiErrors.forbidden('Insufficient permissions');

// Validation
return ApiErrors.badRequest('Invalid input');
return ApiErrors.validationError(formattedErrors);

// Resources
return ApiErrors.notFound('Resource');
return ApiErrors.conflict('Resource');

// External Services
return ApiErrors.externalService('Nylas', { error });
return ApiErrors.databaseError('Failed to save data');

// Generic
return ApiErrors.internalError('Something went wrong');
```

## Before/After Example

### Before (Non-compliant)
```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  // ... rest of logic
}
```

### After (Compliant)
```typescript
export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error: validationError } = await validateRequest(
    request,
    createMessageSchema
  );
  if (validationError) return validationError;

  try {
    // ... business logic
    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return ApiErrors.internalError('Failed to create message');
  }
});
```

## Checklist for New Routes

- [ ] Uses `withErrorHandler` wrapper
- [ ] Uses `requireAuth()` or `requireSuperAdmin()` middleware
- [ ] Validates all inputs with Zod schemas
- [ ] Uses `handleSupabaseError()` for database errors
- [ ] Returns appropriate HTTP status codes
- [ ] Has clear, actionable error messages
- [ ] Logs errors with `console.error()`
- [ ] No `any` types (use proper TypeScript types)
- [ ] Handles all edge cases
- [ ] No `console.log()` (use `console.error()` for errors only)
