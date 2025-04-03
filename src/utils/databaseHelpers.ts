import { supabase } from '@/integrations/supabase/client';

/**
 * Safely execute a Supabase query with fallback value on error
 * @param operation Function that returns a Supabase query promise
 * @param fallbackValue Value to return if operation fails
 */
export async function safeDbOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  fallbackValue: T
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      console.error('Database operation error:', error);
      return fallbackValue;
    }
    return data || fallbackValue;
  } catch (err) {
    console.error('Database operation exception:', err);
    return fallbackValue;
  }
}

/**
 * Try to refresh the schema cache via a direct API call
 */
export async function refreshSchemaCache(): Promise<boolean> {
  try {
    // This requires admin credentials to work properly
    const response = await fetch('/api/refresh-schema', {
      method: 'POST'
    });
    
    return response.ok;
  } catch (err) {
    console.error('Failed to refresh schema cache:', err);
    return false;
  }
}

/**
 * Add robust error handling to database operations
 */
export function withErrorHandling<T, P extends any[]>(
  fn: (...args: P) => Promise<T>,
  fallbackValue: T
): (...args: P) => Promise<T> {
  return async (...args: P) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Database operation failed:', error);
      return fallbackValue;
    }
  };
} 