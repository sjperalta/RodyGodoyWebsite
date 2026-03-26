/**
 * Normalized app-level error used by repo/data-layer code.
 * Keeps UI concerns (message display) consistent and testable.
 */
export class AppError extends Error {
  constructor({ message, code, context } = {}) {
    super(message || 'Something went wrong');
    this.name = 'AppError';
    this.code = code;
    this.context = context;
  }
}

export function normalizeSupabaseError(err, context) {
  if (!err) return new AppError({ message: 'Unknown error', code: 'UNKNOWN', context });
  const message = err.message || 'Supabase request failed';
  return new AppError({
    message,
    code: err.code,
    context,
  });
}

export function supabaseNotConfiguredError(context) {
  return new AppError({
    message: 'Supabase is not configured',
    code: 'SUPABASE_NOT_CONFIGURED',
    context,
  });
}

