// Validation Utilities
import { z } from 'zod';

// =====================================================================================
// ERROR MESSAGE HELPER
// =====================================================================================

export function getValidationErrorMessage(error: z.ZodError): string {
  const firstError = error.issues[0];
  if (firstError) {
    return `${firstError.path.join('.')}: ${firstError.message}`;
  }
  return 'Validation error';
}
