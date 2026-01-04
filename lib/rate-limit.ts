/**
 * Rate Limiting Utility
 *
 * Provides IP-based and user-based rate limiting for API routes.
 * Uses an in-memory store (suitable for single-instance deployments).
 *
 * For production with multiple instances, consider:
 * - Redis-based rate limiting (e.g., @upstash/ratelimit)
 * - Vercel Edge middleware with KV store
 *
 * SECURITY: Rate limiting prevents abuse and DoS attacks.
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// Configuration
// =============================================================================

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Identifier type: 'ip' for anonymous, 'user' for authenticated */
  identifierType: 'ip' | 'user';
}

/** Default limits - adjust based on your needs */
export const RATE_LIMITS = {
  /** Standard API endpoints: 60 requests per minute */
  standard: { limit: 60, windowSeconds: 60, identifierType: 'ip' } as RateLimitConfig,
  /** Strict limit for sensitive operations: 10 per minute */
  strict: { limit: 10, windowSeconds: 60, identifierType: 'ip' } as RateLimitConfig,
  /** Write operations: 30 per minute */
  write: { limit: 30, windowSeconds: 60, identifierType: 'ip' } as RateLimitConfig,
  /** Authentication attempts: 5 per 15 minutes */
  auth: { limit: 5, windowSeconds: 900, identifierType: 'ip' } as RateLimitConfig,
} as const;

// =============================================================================
// In-Memory Store
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limit store
 *
 * NOTE: This store is cleared on server restart and doesn't share
 * state between serverless function instances. For production at scale,
 * use a distributed store like Redis.
 */
const store = new Map<string, RateLimitEntry>();

/** Clean up expired entries periodically to prevent memory leaks */
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  // Don't block process exit
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

// Start cleanup when module loads
startCleanup();

// =============================================================================
// Rate Limit Functions
// =============================================================================

/**
 * Extracts client IP from request headers
 * Handles common proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIp(request: NextRequest): string {
  // Vercel/Next.js forwarded IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (original client)
    return forwardedFor.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Real IP header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback - should rarely happen in production
  return 'unknown';
}

/**
 * Check rate limit for a given identifier
 *
 * @returns Object with limit status and headers
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number | null;
} {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = `${config.identifierType}:${identifier}`;

  let entry = store.get(key);

  // Create new entry if expired or doesn't exist
  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    store.set(key, entry);
  }

  // Increment counter
  entry.count++;

  const allowed = entry.count <= config.limit;
  const remaining = Math.max(0, config.limit - entry.count);
  const retryAfter = allowed ? null : Math.ceil((entry.resetAt - now) / 1000);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    retryAfter,
  };
}

/**
 * Creates standard rate limit headers
 */
export function rateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: number,
  retryAfter: number | null
): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', limit.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', Math.ceil(resetAt / 1000).toString());

  if (retryAfter !== null) {
    headers.set('Retry-After', retryAfter.toString());
  }

  return headers;
}

/**
 * Rate limit middleware for API routes
 *
 * @example
 * // In your API route handler:
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = rateLimit(request, RATE_LIMITS.write);
 *   if (rateLimitResult) {
 *     return rateLimitResult; // Returns 429 response
 *   }
 *   // Continue with your handler...
 * }
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.standard
): NextResponse | null {
  const identifier =
    config.identifierType === 'ip'
      ? getClientIp(request)
      : request.headers.get('x-user-id') || getClientIp(request);

  const result = checkRateLimit(identifier, config);
  const headers = rateLimitHeaders(
    config.limit,
    result.remaining,
    result.resetAt,
    result.retryAfter
  );

  if (!result.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers),
        },
      }
    );
  }

  // Return null to indicate request is allowed
  // The handler should add rate limit headers to successful responses
  return null;
}

/**
 * Higher-order function to wrap an API handler with rate limiting
 *
 * @example
 * export const POST = withRateLimit(RATE_LIMITS.write, async (request) => {
 *   // Your handler logic here
 *   return NextResponse.json({ success: true });
 * });
 */
export function withRateLimit<T extends (request: NextRequest) => Promise<NextResponse>>(
  config: RateLimitConfig,
  handler: T
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    // Get identifier once
    const identifier =
      config.identifierType === 'ip'
        ? getClientIp(request)
        : request.headers.get('x-user-id') || getClientIp(request);

    // Check rate limit ONCE and store result
    const result = checkRateLimit(identifier, config);
    const headers = rateLimitHeaders(
      config.limit,
      result.remaining,
      result.resetAt,
      result.retryAfter
    );

    // Return 429 if not allowed
    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers),
          },
        }
      );
    }

    // Execute handler
    const response = await handler(request);

    // Add rate limit headers to successful response (using stored result)
    const newHeaders = new Headers(response.headers);
    headers.forEach((value, key) => {
      newHeaders.set(key, value);
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}
