/**
 * Custom error classes for the application
 * Provides structured error handling with context and error codes
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class ApplicationError extends Error {
  public readonly timestamp: Date;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string, statusCode = 500, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown (V8 only)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts error to JSON for logging/API responses
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Validation error - input data doesn't meet requirements
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, context?: { field?: string; value?: unknown }) {
    super(message, 'VALIDATION_ERROR', 400, context);
  }
}

/**
 * Not found error - requested resource doesn't exist
 */
export class NotFoundError extends ApplicationError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with ID '${identifier}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, { resource, identifier });
  }
}

/**
 * Unauthorized error - authentication required
 */
export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

/**
 * Forbidden error - user lacks permission
 */
export class ForbiddenError extends ApplicationError {
  constructor(message = 'Access forbidden', context?: { resource?: string }) {
    super(message, 'FORBIDDEN', 403, context);
  }
}

/**
 * Conflict error - resource already exists or conflict in state
 */
export class ConflictError extends ApplicationError {
  constructor(message: string, context?: { resource?: string; existingId?: string | number }) {
    super(message, 'CONFLICT', 409, context);
  }
}

/**
 * Internal server error - unexpected error occurred
 */
export class InternalServerError extends ApplicationError {
  constructor(message = 'Internal server error', cause?: Error) {
    super(message, 'INTERNAL_ERROR', 500, {
      cause: cause?.message,
      stack: cause?.stack,
    });
  }
}

/**
 * Service unavailable error - external service is down
 */
export class ServiceUnavailableError extends ApplicationError {
  constructor(message: string, cause?: Error) {
    super(message, 'SERVICE_UNAVAILABLE', 503, {
      cause: cause?.message,
      stack: cause?.stack,
    });
  }
}

/**
 * Bad request error - malformed request
 */
export class BadRequestError extends ApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BAD_REQUEST', 400, context);
  }
}

/**
 * Rate limit error - too many requests
 */
export class RateLimitError extends ApplicationError {
  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
  }
}

/**
 * Type guard to check if error is ApplicationError
 */
export function isApplicationError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError;
}

/**
 * Type guard to check if error is a standard Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Format error for logging
 */
export function formatError(error: unknown): string {
  if (isApplicationError(error)) {
    return JSON.stringify(error.toJSON(), null, 2);
  }

  if (isError(error)) {
    return JSON.stringify(
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      null,
      2
    );
  }

  return String(error);
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unknown error occurred';
}
