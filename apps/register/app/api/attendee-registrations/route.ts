import {
  attendeeRegistrationOpen,
  type AttendeeTicket,
} from "@/app/2026/attendee/_components/attendee-data"
import {
  checkAttendeeRateLimit,
  consumeAttendeeRateLimit,
  getAttendeeClientIp,
  releaseAttendeeRateLimit,
} from "@/lib/attendee-rate-limit"
import { insertAttendee } from "@/lib/attendee-db"
import { attendeeRegistrationSchema } from "@/lib/attendee-registration-schema"
import { scheduleAttendeeSheetSync } from "@/lib/attendee-sheet-sync"

export const runtime = "nodejs"

const maximumRequestSize = 20_000
const responseHeaders = {
  "Cache-Control": "no-store",
}
const genericErrorMessage =
  "Something went wrong. Refresh the page and try again."
const duplicateEmailMessage =
  "This email is already registered. If you lost your ticket, email contact@var.camp."

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
  result: ReturnType<typeof consumeAttendeeRateLimit>
) {
  return {
    ...responseHeaders,
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  }
}

function createRateLimitResponse(
  result: ReturnType<typeof consumeAttendeeRateLimit>
) {
  const retryMinutes = Math.max(1, Math.ceil(result.retryAfter / 60))

  return Response.json(
    {
      message: `Too many registration attempts. Please try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
    },
    {
      status: 429,
      headers: {
        ...createRateLimitHeaders(result),
        "Retry-After": String(result.retryAfter),
      },
    }
  )
}

export async function POST(request: Request) {
  if (!attendeeRegistrationOpen) {
    return Response.json(
      { message: "Attendee registration is not open yet." },
      { status: 403, headers: responseHeaders }
    )
  }

  if (!isSameOriginSubmission(request)) {
    return Response.json(
      { message: genericErrorMessage },
      { status: 403, headers: responseHeaders }
    )
  }

  const contentLength = Number(request.headers.get("content-length") || 0)

  if (contentLength > maximumRequestSize) {
    return Response.json(
      { message: genericErrorMessage },
      { status: 413, headers: responseHeaders }
    )
  }

  const clientIp = getAttendeeClientIp(request)

  if (!clientIp) {
    return Response.json(
      { message: genericErrorMessage },
      { status: 403, headers: responseHeaders }
    )
  }

  // Only saved submissions count toward the limit, so fixing invalid answers
  // never locks anyone out.
  const rateLimit = checkAttendeeRateLimit(clientIp)
  const rateLimitHeaders = createRateLimitHeaders(rateLimit)

  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit)
  }

  let requestBody: unknown

  try {
    requestBody = await request.json()
  } catch {
    return Response.json(
      { message: genericErrorMessage },
      { status: 400, headers: rateLimitHeaders }
    )
  }

  const result = attendeeRegistrationSchema.safeParse(requestBody)

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

  // Taken just before saving so simultaneous submissions can't all pass the
  // check above.
  const reservation = consumeAttendeeRateLimit(clientIp)

  if (!reservation.success) {
    return createRateLimitResponse(reservation)
  }

  try {
    // The ticket ID is public and sequential; the UUID is what check-in
    // trusts, since it can't be guessed.
    const uuid = crypto.randomUUID()
    const record = insertAttendee(result.data, uuid, clientIp)

    // Keeps the used allowance, so the form can't be used to test many
    // addresses for whether they're registered.
    if (!record) {
      return Response.json(
        {
          message: duplicateEmailMessage,
          issues: [{ message: duplicateEmailMessage, path: "aboutYou.email" }],
        },
        { status: 409, headers: createRateLimitHeaders(reservation) }
      )
    }

    scheduleAttendeeSheetSync()

    const ticket: AttendeeTicket = {
      ticketId: record.ticketId,
      uuid,
      name: record.name,
      email: record.email,
    }

    return Response.json(
      { message: "Registration submitted successfully.", ticket },
      { status: 201, headers: createRateLimitHeaders(reservation) }
    )
  } catch (error) {
    releaseAttendeeRateLimit(clientIp)
    console.error("Unable to save attendee registration:", error)

    return Response.json(
      {
        message:
          "Registration could not be saved right now. Please try again later.",
      },
      { status: 503, headers: rateLimitHeaders }
    )
  }
}
