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

const defaultLimit = 5
const defaultWindowSeconds = 60 * 60
const maximumTrackedAddresses = 10_000

const globalRateLimitStore = globalThis as typeof globalThis & {
  speakerRegistrationRateLimits?: Map<string, RateLimitEntry>
}

const rateLimitStore =
  globalRateLimitStore.speakerRegistrationRateLimits ??
  new Map<string, RateLimitEntry>()

globalRateLimitStore.speakerRegistrationRateLimits = rateLimitStore

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number(value)

  return Number.isSafeInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback
}

export const speakerRateLimit = readPositiveInteger(
  process.env.SPEAKER_RATE_LIMIT_MAX,
  defaultLimit
)

export const speakerRateLimitWindowSeconds = readPositiveInteger(
  process.env.SPEAKER_RATE_LIMIT_WINDOW_SECONDS,
  defaultWindowSeconds
)

export function getSpeakerClientIp(request: Request) {
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

export function consumeSpeakerRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const windowMilliseconds = speakerRateLimitWindowSeconds * 1000
  const currentEntry = rateLimitStore.get(identifier)

  if (!currentEntry || currentEntry.resetAt <= now) {
    const resetAt = now + windowMilliseconds

    rateLimitStore.set(identifier, { count: 1, resetAt })
    pruneRateLimitStore(now)

    return {
      limit: speakerRateLimit,
      remaining: Math.max(0, speakerRateLimit - 1),
      resetAt,
      retryAfter: 0,
      success: true,
    }
  }

  if (currentEntry.count >= speakerRateLimit) {
    return {
      limit: speakerRateLimit,
      remaining: 0,
      resetAt: currentEntry.resetAt,
      retryAfter: Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1000)),
      success: false,
    }
  }

  currentEntry.count += 1

  return {
    limit: speakerRateLimit,
    remaining: Math.max(0, speakerRateLimit - currentEntry.count),
    resetAt: currentEntry.resetAt,
    retryAfter: 0,
    success: true,
  }
}

// Reports the current allowance without using any of it.
export function checkSpeakerRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const currentEntry = rateLimitStore.get(identifier)

  if (!currentEntry || currentEntry.resetAt <= now) {
    return {
      limit: speakerRateLimit,
      remaining: speakerRateLimit,
      resetAt: now + speakerRateLimitWindowSeconds * 1000,
      retryAfter: 0,
      success: true,
    }
  }

  const remaining = Math.max(0, speakerRateLimit - currentEntry.count)

  return {
    limit: speakerRateLimit,
    remaining,
    resetAt: currentEntry.resetAt,
    retryAfter:
      remaining > 0
        ? 0
        : Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1000)),
    success: remaining > 0,
  }
}

// Gives back the allowance taken by consumeSpeakerRateLimit when the submission
// could not be saved.
export function releaseSpeakerRateLimit(identifier: string) {
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
