/**
 * Input Validation Schemas
 *
 * Zod schemas for validating all user input. These schemas provide:
 * - Runtime type checking
 * - Length limits to prevent abuse
 * - Format validation (emails, UUIDs, etc.)
 * - XSS prevention through sanitization
 * - Strict mode to reject unexpected fields
 *
 * SECURITY: Always validate user input before database operations.
 */

import { z } from 'zod';

// =============================================================================
// Constants - Centralized limits for easy auditing
// =============================================================================

export const LIMITS = {
  // String length limits
  NAME_MIN: 1,
  NAME_MAX: 100,
  TITLE_MIN: 1,
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 2000,
  CONTENT_MAX: 5000,
  EMAIL_MAX: 254, // RFC 5321
  URL_MAX: 2048,
  REACTION_MAX: 50,

  // Numeric limits
  PROGRESS_MIN: 0,
  PROGRESS_MAX: 100,
} as const;

// =============================================================================
// Utility Schemas
// =============================================================================

/**
 * UUID v4 validation
 * Prevents injection by ensuring IDs match expected format
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid ID format')
  .describe('UUID v4 identifier');

/**
 * Email validation with length limit
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(LIMITS.EMAIL_MAX, `Email must be ${LIMITS.EMAIL_MAX} characters or less`)
  .toLowerCase()
  .trim();

/**
 * Safe string that strips potential XSS vectors
 * Trims whitespace and limits length
 */
const safeString = (minLength: number, maxLength: number) =>
  z
    .string()
    .min(minLength, `Must be at least ${minLength} character(s)`)
    .max(maxLength, `Must be ${maxLength} characters or less`)
    .trim()
    // Basic XSS prevention - strip script tags and event handlers
    .transform((val) =>
      val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=/gi, '')
    );

/**
 * Optional safe string (allows null/undefined)
 */
const optionalSafeString = (maxLength: number) =>
  z
    .string()
    .max(maxLength, `Must be ${maxLength} characters or less`)
    .trim()
    .transform((val) =>
      val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=/gi, '')
    )
    .nullable()
    .optional();

// =============================================================================
// Team Member Schemas
// =============================================================================

export const teamMemberCreateSchema = z
  .object({
    name: safeString(LIMITS.NAME_MIN, LIMITS.NAME_MAX),
    email: emailSchema,
    avatar_url: z
      .string()
      .url('Invalid URL format')
      .max(LIMITS.URL_MAX)
      .nullable()
      .optional(),
    role: z.enum(['lead', 'member']).default('member'),
  })
  .strict(); // Reject unexpected fields

export const teamMemberUpdateSchema = z
  .object({
    name: safeString(LIMITS.NAME_MIN, LIMITS.NAME_MAX).optional(),
    email: emailSchema.optional(),
    avatar_url: z
      .string()
      .url('Invalid URL format')
      .max(LIMITS.URL_MAX)
      .nullable()
      .optional(),
    role: z.enum(['lead', 'member']).optional(),
  })
  .strict();

// =============================================================================
// Agreement Schemas
// =============================================================================

export const agreementCreateSchema = z
  .object({
    title: safeString(LIMITS.TITLE_MIN, LIMITS.TITLE_MAX),
    description: optionalSafeString(LIMITS.DESCRIPTION_MAX),
    status: z.enum(['pending', 'active', 'archived']).default('pending'),
    created_by: uuidSchema.nullable().optional(),
  })
  .strict();

export const agreementUpdateSchema = z
  .object({
    title: safeString(LIMITS.TITLE_MIN, LIMITS.TITLE_MAX).optional(),
    description: optionalSafeString(LIMITS.DESCRIPTION_MAX),
    status: z.enum(['pending', 'active', 'archived']).optional(),
  })
  .strict();

export const agreementSignatureSchema = z
  .object({
    agreement_id: uuidSchema,
    member_id: uuidSchema,
  })
  .strict();

// =============================================================================
// Deliverable Schemas
// =============================================================================

export const deliverableCreateSchema = z
  .object({
    title: safeString(LIMITS.TITLE_MIN, LIMITS.TITLE_MAX),
    description: optionalSafeString(LIMITS.DESCRIPTION_MAX),
    owner_id: uuidSchema.nullable().optional(),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be in YYYY-MM-DD format')
      .nullable()
      .optional(),
    progress: z
      .number()
      .int()
      .min(LIMITS.PROGRESS_MIN)
      .max(LIMITS.PROGRESS_MAX)
      .default(0),
    status: z
      .enum(['upcoming', 'in-progress', 'at-risk', 'completed'])
      .default('upcoming'),
  })
  .strict();

export const deliverableUpdateSchema = z
  .object({
    title: safeString(LIMITS.TITLE_MIN, LIMITS.TITLE_MAX).optional(),
    description: optionalSafeString(LIMITS.DESCRIPTION_MAX),
    owner_id: uuidSchema.nullable().optional(),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be in YYYY-MM-DD format')
      .nullable()
      .optional(),
    progress: z
      .number()
      .int()
      .min(LIMITS.PROGRESS_MIN)
      .max(LIMITS.PROGRESS_MAX)
      .optional(),
    status: z
      .enum(['upcoming', 'in-progress', 'at-risk', 'completed'])
      .optional(),
  })
  .strict();

// =============================================================================
// Update (Status Post) Schemas
// =============================================================================

export const updateCreateSchema = z
  .object({
    content: safeString(LIMITS.NAME_MIN, LIMITS.CONTENT_MAX),
    author_id: uuidSchema.nullable().optional(),
    deliverable_id: uuidSchema.nullable().optional(),
    is_help_request: z.boolean().default(false),
  })
  .strict();

export const updateReactionSchema = z
  .object({
    update_id: uuidSchema,
    member_id: uuidSchema,
    reaction_type: safeString(1, LIMITS.REACTION_MAX),
  })
  .strict();

// =============================================================================
// Type Exports
// =============================================================================

export type TeamMemberCreate = z.infer<typeof teamMemberCreateSchema>;
export type TeamMemberUpdate = z.infer<typeof teamMemberUpdateSchema>;
export type AgreementCreate = z.infer<typeof agreementCreateSchema>;
export type AgreementUpdate = z.infer<typeof agreementUpdateSchema>;
export type AgreementSignature = z.infer<typeof agreementSignatureSchema>;
export type DeliverableCreate = z.infer<typeof deliverableCreateSchema>;
export type DeliverableUpdate = z.infer<typeof deliverableUpdateSchema>;
export type UpdateCreate = z.infer<typeof updateCreateSchema>;
export type UpdateReaction = z.infer<typeof updateReactionSchema>;

// =============================================================================
// Validation Helper
// =============================================================================

/**
 * Validates input against a schema and returns a result object
 *
 * @example
 * const result = validate(agreementCreateSchema, userInput);
 * if (!result.success) {
 *   return res.status(400).json({ error: result.error.message });
 * }
 * const validData = result.data;
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Formats Zod errors into a user-friendly message
 */
export function formatValidationError(error: z.ZodError<unknown>): string {
  return error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');
}
