import { appendOrganizerRegistration } from "@/lib/google-sheets"
import {
  consumeOrganizerRateLimit,
  getOrganizerClientIp,
} from "@/lib/organizer-rate-limit"
import { organizerRegistrationSchema } from "@/lib/organizer-registration-schema"

export const runtime = "nodejs"

const maximumRequestSize = 50_000
const responseHeaders = {
  "Cache-Control": "no-store",
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

function isSameOriginSubmission(request: Request) {
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

function createRateLimitHeaders(
  result: ReturnType<typeof consumeOrganizerRateLimit>
) {
  return {
    ...responseHeaders,
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  }
}

export async function POST(request: Request) {
  if (!isSameOriginSubmission(request)) {
    return Response.json(
      { message: "Cross-origin submissions are not allowed." },
      { status: 403, headers: responseHeaders }
    )
  }

  const contentLength = Number(request.headers.get("content-length") || 0)

  if (contentLength > maximumRequestSize) {
    return Response.json(
      { message: "Submission is too large." },
      { status: 413, headers: responseHeaders }
    )
  }

  const clientIp = getOrganizerClientIp(request)

  if (!clientIp) {
    return Response.json(
      { message: "Direct submissions are not allowed." },
      { status: 403, headers: responseHeaders }
    )
  }

  const rateLimit = consumeOrganizerRateLimit(clientIp)
  const rateLimitHeaders = createRateLimitHeaders(rateLimit)

  if (!rateLimit.success) {
    const retryMinutes = Math.max(1, Math.ceil(rateLimit.retryAfter / 60))

    return Response.json(
      {
        message: `Too many registration attempts. Please try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          "Retry-After": String(rateLimit.retryAfter),
        },
      }
    )
  }

  let requestBody: unknown

  try {
    requestBody = await request.json()
  } catch {
    return Response.json(
      { message: "Invalid submission data." },
      { status: 400, headers: rateLimitHeaders }
    )
  }

  const result = organizerRegistrationSchema.safeParse(requestBody)

  if (!result.success) {
    return Response.json(
      {
        message: result.error.issues[0]?.message || "Check your information.",
        issues: result.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path.join("."),
        })),
      },
      { status: 422, headers: rateLimitHeaders }
    )
  }

  try {
    await appendOrganizerRegistration(result.data, clientIp)

    return Response.json(
      { message: "Registration submitted successfully." },
      { status: 201, headers: rateLimitHeaders }
    )
  } catch (error) {
    console.error("Unable to append organizer registration:", error)

    return Response.json(
      {
        message:
          "Registration could not be saved right now. Please try again later.",
      },
      { status: 503, headers: rateLimitHeaders }
    )
  }
}
