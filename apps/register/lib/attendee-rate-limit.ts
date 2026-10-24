import { isIP } from "node:net"

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  limit: number
  remaining: number
  resetAt: number
  retryAfter: number
  success: boolean
}

const defaultLimit = 10
const defaultWindowSeconds = 60 * 60
const maximumTrackedAddresses = 10_000

const globalRateLimitStore = globalThis as typeof globalThis & {
  attendeeRegistrationRateLimits?: Map<string, RateLimitEntry>
}

const rateLimitStore =
  globalRateLimitStore.attendeeRegistrationRateLimits ??
  new Map<string, RateLimitEntry>()

globalRateLimitStore.attendeeRegistrationRateLimits = rateLimitStore

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number(value)

  return Number.isSafeInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback
}

export const attendeeRateLimit = readPositiveInteger(
  process.env.ATTENDEE_RATE_LIMIT_MAX,
  defaultLimit
)

export const attendeeRateLimitWindowSeconds = readPositiveInteger(
  process.env.ATTENDEE_RATE_LIMIT_WINDOW_SECONDS,
  defaultWindowSeconds
)

export function getAttendeeClientIp(request: Request) {
  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim()

  if (cloudflareIp && isIP(cloudflareIp)) {
    return cloudflareIp
  }

  const requestHostname = new URL(request.url).hostname

  if (
    requestHostname === "localhost" ||
    requestHostname === "127.0.0.1" ||
    requestHostname === "::1"
  ) {
    const forwardedIp = request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim()

    return forwardedIp && isIP(forwardedIp) ? forwardedIp : "127.0.0.1"
  }

  return null
}

export function consumeAttendeeRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const windowMilliseconds = attendeeRateLimitWindowSeconds * 1000
  const currentEntry = rateLimitStore.get(identifier)

  if (!currentEntry || currentEntry.resetAt <= now) {
    const resetAt = now + windowMilliseconds

    rateLimitStore.set(identifier, { count: 1, resetAt })
    pruneRateLimitStore(now)

    return {
      limit: attendeeRateLimit,
      remaining: Math.max(0, attendeeRateLimit - 1),
      resetAt,
      retryAfter: 0,
      success: true,
    }
  }

  if (currentEntry.count >= attendeeRateLimit) {
    return {
      limit: attendeeRateLimit,
      remaining: 0,
      resetAt: currentEntry.resetAt,
      retryAfter: Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1000)),
      success: false,
    }
  }

  currentEntry.count += 1

  return {
    limit: attendeeRateLimit,
    remaining: Math.max(0, attendeeRateLimit - currentEntry.count),
    resetAt: currentEntry.resetAt,
    retryAfter: 0,
    success: true,
  }
}

// Reports the current allowance without using any of it.
export function checkAttendeeRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const currentEntry = rateLimitStore.get(identifier)

  if (!currentEntry || currentEntry.resetAt <= now) {
    return {
      limit: attendeeRateLimit,
      remaining: attendeeRateLimit,
      resetAt: now + attendeeRateLimitWindowSeconds * 1000,
      retryAfter: 0,
      success: true,
    }
  }

  const remaining = Math.max(0, attendeeRateLimit - currentEntry.count)

  return {
    limit: attendeeRateLimit,
    remaining,
    resetAt: currentEntry.resetAt,
    retryAfter:
      remaining > 0
        ? 0
        : Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1000)),
    success: remaining > 0,
  }
}

// Gives back the allowance taken by consumeAttendeeRateLimit when the submission
// could not be saved.
export function releaseAttendeeRateLimit(identifier: string) {
  const currentEntry = rateLimitStore.get(identifier)

  if (currentEntry && currentEntry.count > 0) {
    currentEntry.count -= 1
  }
}

function pruneRateLimitStore(now: number) {
  if (rateLimitStore.size <= maximumTrackedAddresses) {
    return
  }

  for (const [identifier, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(identifier)
    }
  }

  while (rateLimitStore.size > maximumTrackedAddresses) {
    const oldestIdentifier = rateLimitStore.keys().next().value

    if (!oldestIdentifier) {
      break
    }

    rateLimitStore.delete(oldestIdentifier)
  }
}
