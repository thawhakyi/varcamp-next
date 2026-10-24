import "server-only"

import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const checkInCookieName = "varcamp_check_in"
// Long enough to cover the whole event day from one sign-in.
export const checkInSessionSeconds = 16 * 60 * 60

export type CheckInSession = {
  staffName: string
  expiresAt: number
}

function getCheckInSecrets() {
  const passcode = process.env.CHECK_IN_PASSCODE?.trim()
  const sessionSecret = process.env.CHECK_IN_SESSION_SECRET?.trim()

  return passcode && sessionSecret ? { passcode, sessionSecret } : null
}

export function isCheckInConfigured() {
  return getCheckInSecrets() !== null
}

// From this moment attendees can check themselves in without a passcode.
// CHECK_IN_OPEN_FROM overrides it, for example to test before the event.
const defaultSelfCheckInOpensAt = "2026-11-15T08:30:00+06:30"

export function isSelfCheckInOpen() {
  const configuredOpensAt = Date.parse(
    process.env.CHECK_IN_OPEN_FROM?.trim() ?? ""
  )
  const opensAt = Number.isNaN(configuredOpensAt)
    ? Date.parse(defaultSelfCheckInOpensAt)
    : configuredOpensAt

  return Date.now() >= opensAt
}

// Hashing first gives both sides the same length, as timingSafeEqual needs.
function safeEqual(first: string, second: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest()

  return timingSafeEqual(digest(first), digest(second))
}

export function isValidPasscode(passcode: string) {
  const secrets = getCheckInSecrets()

  return secrets !== null && safeEqual(passcode, secrets.passcode)
}

function sign(payload: string, sessionSecret: string) {
  return createHmac("sha256", sessionSecret).update(payload).digest("base64url")
}

export function createCheckInSessionToken(staffName: string) {
  const secrets = getCheckInSecrets()

  if (!secrets) {
    throw new Error("Check-in environment variables are not configured.")
  }

  const session: CheckInSession = {
    staffName,
    expiresAt: Date.now() + checkInSessionSeconds * 1000,
  }
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url")

  return `${payload}.${sign(payload, secrets.sessionSecret)}`
}

function readCheckInSessionToken(token: string | undefined) {
  const secrets = getCheckInSecrets()
  const [payload, signature] = token?.split(".") ?? []

  if (
    !secrets ||
    !payload ||
    !signature ||
    !safeEqual(signature, sign(payload, secrets.sessionSecret))
  ) {
    return null
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as Partial<CheckInSession>

    return typeof session.staffName === "string" &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now()
      ? { staffName: session.staffName, expiresAt: session.expiresAt }
      : null
  } catch {
    return null
  }
}

export async function getCheckInSession() {
  const cookieStore = await cookies()

  return readCheckInSessionToken(cookieStore.get(checkInCookieName)?.value)
}

function getFirstForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim()
}

function getPublicRequestOrigin(request: Request) {
  const requestUrl = new URL(request.url)
  const forwardedHost = getFirstForwardedValue(
    request.headers.get("x-forwarded-host")
  )
  const host = forwardedHost || request.headers.get("host") || requestUrl.host
  const forwardedProtocol = getFirstForwardedValue(
    request.headers.get("x-forwarded-proto")
  )
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : requestUrl.protocol.slice(0, -1)

  try {
    return new URL(`${protocol}://${host}`).origin
  } catch {
    return requestUrl.origin
  }
}

export function isSameOriginRequest(request: Request) {
  const requestOrigin = request.headers.get("origin")

  if (!requestOrigin) {
    return true
  }

  try {
    return new URL(requestOrigin).origin === getPublicRequestOrigin(request)
  } catch {
    return false
  }
}
