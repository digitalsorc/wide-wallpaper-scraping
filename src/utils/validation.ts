/**
 * Input validation utilities using Zod
 * Provides type-safe validation with descriptive error messages
 */

import { z } from 'zod';
import { ValidationError } from './errors';

/**
 * Common validation schemas
 */
export const schemas = {
  /**
   * Email validation
   */
  email: z.string().email('Invalid email address').min(1, 'Email is required'),

  /**
   * Password validation (min 8 chars, requires number and special char)
   */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),

  /**
   * URL validation
   */
  url: z.string().url('Invalid URL format'),

  /**
   * UUID validation
   */
  uuid: z.string().uuid('Invalid UUID format'),

  /**
   * Positive integer
   */
  positiveInt: z.number().int('Must be an integer').positive('Must be positive'),

  /**
   * Non-empty string
   */
  nonEmptyString: z.string().min(1, 'Cannot be empty'),

  /**
   * Date string (ISO format)
   */
  dateString: z.string().datetime('Invalid date format (must be ISO 8601)'),

  /**
   * Phone number (basic validation)
   */
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)'),
};

/**
 * Validates data against a Zod schema
 * Throws ValidationError with structured error information
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    throw new ValidationError('Validation failed', {
      field: 'validation',
      value: { errors, data },
    });
  }

  return result.data;
}

/**
 * Type guard for checking if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard for checking if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for checking if value is an object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for checking if value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard for checking if value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  try {
    schemas.email.parse(email);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): boolean {
  try {
    schemas.password.parse(password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    schemas.url.parse(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates UUID format
 */
export function isValidUuid(uuid: string): boolean {
  try {
    schemas.uuid.parse(uuid);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes string by removing dangerous characters
 * Useful for preventing XSS attacks
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim();
}

/**
 * Truncates string to maximum length
 */
export function truncateString(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, maxLength - 3)}...`;
}

/**
 * Validates and parses integer from string
 */
export function parseInteger(value: string | number): number {
  if (typeof value === 'number') {
    if (!Number.isInteger(value)) {
      throw new ValidationError('Value must be an integer');
    }
    return value;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new ValidationError('Invalid integer format', { value });
  }

  return parsed;
}

/**
 * Validates and parses float from string
 */
export function parseFloatSafe(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new ValidationError('Invalid number format', { field: 'number', value });
  }

  return parsed;
}

/**
 * Validates and parses boolean from string
 */
export function parseBoolean(value: string | boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  const lower = value.toLowerCase();
  if (lower === 'true' || lower === '1' || lower === 'yes') {
    return true;
  }
  if (lower === 'false' || lower === '0' || lower === 'no') {
    return false;
  }

  throw new ValidationError('Invalid boolean format', { value });
}

/**
 * Example: User registration validation schema
 */
export const userRegistrationSchema = z.object({
  email: schemas.email,
  password: schemas.password,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.number().int().min(18, 'Must be at least 18 years old').optional(),
});

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;

/**
 * Example: User update validation schema
 */
export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: schemas.email.optional(),
  age: z.number().int().min(18).optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
