export interface AppErrorContext {
  operation: string;
  [key: string]: unknown;
}

interface AppErrorConstructorArgs {
  message?: string;
  code?: string;
  context?: AppErrorContext;
}

/**
 * Normalized app-level error used by repo/data-layer code.
 * Keeps UI concerns (message display) consistent and testable.
 */
export class AppError extends Error {
  code?: string;
  context?: AppErrorContext;

  constructor({ message, code, context }: AppErrorConstructorArgs = {}) {
    super(message || 'Something went wrong');
    this.name = 'AppError';
    this.code = code;
    this.context = context;
  }
}

export function normalizeSupabaseError(err: Error | null | undefined, context: AppErrorContext): AppError {
  if (!err) return new AppError({ message: 'Unknown error', code: 'UNKNOWN', context });
  const message = err.message || 'Supabase request failed';
  // Assuming Supabase errors might have a 'code' property
  const errorCode = 'code' in err && typeof err.code === 'string' ? err.code : undefined;
  return new AppError({
    message,
    code: errorCode,
    context,
  });
}

export function supabaseNotConfiguredError(context: AppErrorContext): AppError {
  return new AppError({
    message: 'Supabase is not configured',
    code: 'SUPABASE_NOT_CONFIGURED',
    context,
  });
}
