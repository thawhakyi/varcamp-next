import { logoMaxBytes } from "@/app/2026/community/_components/community-data"
import { uploadCommunityLogo } from "@/lib/cloudflare-r2"
import {
  checkCommunityRateLimit,
  consumeCommunityRateLimit,
  getCommunityClientIp,
  releaseCommunityRateLimit,
} from "@/lib/community-rate-limit"
import {
  communityRegistrationSchema,
  logoRequiredMessage,
  validateLogo,
} from "@/lib/community-registration-schema"
import { appendCommunityRegistration } from "@/lib/google-sheets"

export const runtime = "nodejs"

const maximumRequestSize = logoMaxBytes + 100_000
const responseHeaders = {
  "Cache-Control": "no-store",
}
const genericErrorMessage =
  "Something went wrong. Refresh the page and try again."

const logoSignatures = [
  { type: "image/jpeg", extension: "jpg", bytes: [0xff, 0xd8, 0xff] },
  {
    type: "image/png",
    extension: "png",
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  // RIFF, four bytes of file size, then WEBP.
  {
    type: "image/webp",
    extension: "webp",
    bytes: [
      0x52,
      0x49,
      0x46,
      0x46,
      null,
      null,
      null,
      null,
      0x57,
      0x45,
      0x42,
      0x50,
    ],
  },
] as const

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
  result: ReturnType<typeof consumeCommunityRateLimit>
) {
  return {
    ...responseHeaders,
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  }
}

function createRateLimitResponse(
  result: ReturnType<typeof consumeCommunityRateLimit>
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

// The browser-reported file type is not trusted; the file content decides.
async function detectLogoSignature(logo: File) {
  const header = new Uint8Array(await logo.slice(0, 12).arrayBuffer())

  return logoSignatures.find((signature) =>
    signature.bytes.every(
      (byte, index) => byte === null || header[index] === byte
    )
  )
}

export async function POST(request: Request) {
  if (!isSameOriginSubmission(request)) {
    return Response.json(
      { message: genericErrorMessage },
      { status: 403, headers: responseHeaders }
    )
  }

  const contentLength = Number(request.headers.get("content-length") || 0)

  if (contentLength > maximumRequestSize) {
    return Response.json(
      {
        message: "Your logo is too large. Use an image of 5 MB or smaller.",
      },
      { status: 413, headers: responseHeaders }
    )
  }

  const clientIp = getCommunityClientIp(request)

  if (!clientIp) {
    return Response.json(
      { message: genericErrorMessage },
      { status: 403, headers: responseHeaders }
    )
  }

  // Only saved submissions count toward the limit, so fixing invalid answers
  // never locks anyone out.
  const rateLimit = checkCommunityRateLimit(clientIp)
  const rateLimitHeaders = createRateLimitHeaders(rateLimit)

  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit)
  }

  let requestBody: unknown
  let logo: File | null

  try {
    const formData = await request.formData()
    const data = formData.get("data")
    const logoEntry = formData.get("logo")

    requestBody = JSON.parse(typeof data === "string" ? data : "")
    logo = logoEntry instanceof File ? logoEntry : null
  } catch {
    return Response.json(
      { message: genericErrorMessage },
      { status: 400, headers: rateLimitHeaders }
    )
  }

  const result = communityRegistrationSchema.safeParse(requestBody)

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

  const logoSignature = logo ? await detectLogoSignature(logo) : undefined
  const logoError = logo
    ? (validateLogo(logo) ??
      (logoSignature ? undefined : "Use a JPG, PNG, or WebP image."))
    : logoRequiredMessage

  if (logoError || !logo || !logoSignature) {
    return Response.json(
      {
        message: logoError,
        issues: [{ message: logoError, path: "profile.logo" }],
      },
      { status: 422, headers: rateLimitHeaders }
    )
  }

  // Taken just before saving so simultaneous submissions can't all pass the
  // check above.
  const reservation = consumeCommunityRateLimit(clientIp)

  if (!reservation.success) {
    return createRateLimitResponse(reservation)
  }

  try {
    const logoUrl = await uploadCommunityLogo({
      contentType: logoSignature.type,
      extension: logoSignature.extension,
      logo,
    })

    await appendCommunityRegistration(result.data, logoUrl, clientIp)

    return Response.json(
      { message: "Registration submitted successfully." },
      { status: 201, headers: createRateLimitHeaders(reservation) }
    )
  } catch (error) {
    releaseCommunityRateLimit(clientIp)
    console.error("Unable to save community registration:", error)

    return Response.json(
      {
        message:
          "Registration could not be saved right now. Please try again later.",
      },
      { status: 503, headers: rateLimitHeaders }
    )
  }
}
