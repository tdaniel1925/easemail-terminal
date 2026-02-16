import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';
import { ApiErrors } from '@/lib/api-error';

/**
 * Validates request body against Zod schema
 * Returns typed data on success, error response on failure
 */
export async function validateRequest<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<{ data: z.infer<T>; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return {
        data: null,
        error: ApiErrors.validationError(formattedErrors),
      };
    }
    return {
      data: null,
      error: ApiErrors.badRequest('Invalid request body'),
    };
  }
}

/**
 * Validates query parameters against Zod schema
 */
export function validateQueryParams<T extends ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { data: z.infer<T>; error: null } | { data: null; error: NextResponse } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const validatedData = schema.parse(params);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return {
        data: null,
        error: ApiErrors.validationError(formattedErrors),
      };
    }
    return {
      data: null,
      error: ApiErrors.badRequest('Invalid query parameters'),
    };
  }
}

/**
 * Extracts and validates path parameters
 */
export function validatePathParams<T extends ZodSchema>(
  params: Record<string, string>,
  schema: T
): { data: z.infer<T>; error: null } | { data: null; error: NextResponse } {
  try {
    const validatedData = schema.parse(params);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: ApiErrors.badRequest('Invalid path parameters'),
      };
    }
    return {
      data: null,
      error: ApiErrors.badRequest('Invalid request'),
    };
  }
}
