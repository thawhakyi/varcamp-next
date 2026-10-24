import { cookies } from "next/headers"
import { z } from "zod"

import { staffNameMaxLength } from "@/app/2026/attendee/check-in/_components/check-in-data"
import {
  checkInCookieName,
  checkInSessionSeconds,
  createCheckInSessionToken,
  isCheckInConfigured,
  isSameOriginRequest,
  isValidPasscode,
} from "@/lib/check-in-session"
import {
  checkCheckInSignInRateLimit,
  consumeCheckInSignInRateLimit,
  getCheckInClientIp,
} from "@/lib/check-in-rate-limit"

export const runtime = "nodejs"

const responseHeaders = {
  "Cache-Control": "no-store",
}
const genericErrorMessage =
  "Something went wrong. Refresh the page and try again."

const signInSchema = z
  .object({
    staffName: z
      .string()
      .trim()
      .min(1, "Enter your name.")
      .max(staffNameMaxLength, "Name is too long."),
    passcode: z.string().min(1, "Enter the check-in passcode.").max(200),
  })
  .strict()

function createRateLimitResponse(retryAfter: number) {
  const retryMinutes = Math.max(1, Math.ceil(retryAfter / 60))

  return Response.json(
    {
      message: `Too many wrong passcodes. Try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
    },
    {
      status: 429,
      headers: { ...responseHeaders, "Retry-After": String(retryAfter) },
    }
  )
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json(
      { message: genericErrorMessage },
      { status: 403, headers: responseHeaders }
    )
  }

  if (!isCheckInConfigured()) {
    return Response.json(
      { message: "Check-in isn't set up yet. Ask an organizer." },
      { status: 503, headers: responseHeaders }
    )
  }

  const clientIp = getCheckInClientIp(request)

  if (!clientIp) {
    return Response.json(
      { message: genericErrorMessage },
      { status: 403, headers: responseHeaders }
    )
  }

  // Only wrong passcodes count toward the limit.
  const rateLimit = checkCheckInSignInRateLimit(clientIp)

  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.retryAfter)
  }

  const result = signInSchema.safeParse(await request.json().catch(() => null))

  if (!result.success) {
    return Response.json(
      { message: result.error.issues[0]?.message || genericErrorMessage },
      { status: 422, headers: responseHeaders }
    )
  }

  if (!isValidPasscode(result.data.passcode)) {
    const attempt = consumeCheckInSignInRateLimit(clientIp)

    return attempt.success
      ? Response.json(
          { message: "That passcode isn't right." },
          { status: 401, headers: responseHeaders }
        )
      : createRateLimitResponse(attempt.retryAfter)
  }

  const cookieStore = await cookies()

  cookieStore.set(
    checkInCookieName,
    createCheckInSessionToken(result.data.staffName),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: checkInSessionSeconds,
    }
  )

  return Response.json(
    { message: "Signed in." },
    { status: 200, headers: responseHeaders }
  )
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json(
      { message: genericErrorMessage },
      { status: 403, headers: responseHeaders }
    )
  }

  const cookieStore = await cookies()

  cookieStore.delete(checkInCookieName)

  return Response.json(
    { message: "Signed out." },
    { status: 200, headers: responseHeaders }
  )
}
