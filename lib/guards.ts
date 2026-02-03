/**
 * Type guards and assertion functions for safe type checking
 */

// Type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isArray<T = any>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Assertion functions (throw errors if conditions not met)
export function assertExists<T>(
  value: T | null | undefined,
  message: string = 'Value must exist'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

export function assertArray<T>(
  value: unknown,
  message: string = 'Value must be an array'
): asserts value is T[] {
  if (!isArray(value)) {
    throw new Error(message);
  }
}

export function assertString(
  value: unknown,
  message: string = 'Value must be a string'
): asserts value is string {
  if (!isString(value)) {
    throw new Error(message);
  }
}

export function assertNumber(
  value: unknown,
  message: string = 'Value must be a number'
): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message);
  }
}

export function assertObject(
  value: unknown,
  message: string = 'Value must be an object'
): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error(message);
  }
}

// Safe accessors
export function safeArrayAccess<T>(
  array: T[] | null | undefined,
  index: number,
  fallback: T
): T {
  if (!array || !Array.isArray(array) || array.length <= index || index < 0) {
    return fallback;
  }
  return array[index] ?? fallback;
}

export function safePropAccess<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback: T[K]
): T[K] {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }
  return obj[key] ?? fallback;
}

export function safeStringAccess(
  value: unknown,
  fallback: string = ''
): string {
  return isString(value) ? value : fallback;
}

export function safeNumberAccess(
  value: unknown,
  fallback: number = 0
): number {
  return isNumber(value) ? value : fallback;
}

// Array helpers
export function filterDefined<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(isDefined);
}

export function mapSafely<T, R>(
  array: T[] | null | undefined,
  mapFn: (item: T, index: number) => R
): R[] {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  return array.map(mapFn);
}
