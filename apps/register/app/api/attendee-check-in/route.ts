import { z } from "zod"

import {
  type CheckInAttendee,
  type CheckInResponse,
  type CheckInSearchResponse,
  selfCheckInLabel,
} from "@/app/2026/attendee/check-in/_components/check-in-data"
import {
  type AttendeeRecord,
  checkInAttendee,
  getCheckInStats,
  searchAttendees,
} from "@/lib/attendee-db"
import { scheduleAttendeeSheetSync } from "@/lib/attendee-sheet-sync"
import {
  getCheckInSession,
  isSameOriginRequest,
  isSelfCheckInOpen,
} from "@/lib/check-in-session"

export const runtime = "nodejs"

const responseHeaders = {
  "Cache-Control": "no-store",
}
const genericErrorMessage =
  "Something went wrong. Refresh the page and try again."
const databaseErrorMessage =
  "Couldn't reach the attendee list. Try again, or ask an organizer."
const maximumSearchResults = 10

const checkInSchema = z
  .object({
    uuid: z.uuid("This isn't a VarCamp ticket."),
    // Present when the ticket was scanned, for comparing with the
    // registration.
    name: z.string().max(300).optional(),
    email: z.string().max(300).optional(),
  })
  .strict()

const unauthorizedResponse = () =>
  Response.json(
    { message: "Your check-in session has ended. Sign in again." },
    { status: 401, headers: responseHeaders }
  )

const toAttendee = (record: AttendeeRecord): CheckInAttendee => ({
  ticketId: record.ticketId,
  uuid: record.uuid,
  name: record.name,
  email: record.email,
  country: record.country,
  checkedInAt: record.checkedInAt,
  checkedInBy: record.checkedInBy,
})

const normalize = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase()

export async function GET(request: Request) {
  if (!(await getCheckInSession())) {
    return unauthorizedResponse()
  }

  const query = normalize(new URL(request.url).searchParams.get("q") ?? "")

  try {
    const attendees =
      query.length >= 2 || /^\d+$/.test(query)
        ? searchAttendees(query, maximumSearchResults).map(toAttendee)
        : []

    return Response.json(
      { attendees, stats: getCheckInStats() } satisfies CheckInSearchResponse,
      { headers: responseHeaders }
    )
  } catch (error) {
    console.error("Unable to search attendees:", error)

    return Response.json(
      { message: databaseErrorMessage },
      { status: 503, headers: responseHeaders }
    )
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json(
      { message: genericErrorMessage },
      { status: 403, headers: responseHeaders }
    )
  }

  // Staff sign in; once self check-in opens, a ticket's UUID is enough.
  const session = await getCheckInSession()
  const checkedInBy =
    session?.staffName ?? (isSelfCheckInOpen() ? selfCheckInLabel : null)

  if (!checkedInBy) {
    return unauthorizedResponse()
  }

  const result = checkInSchema.safeParse(await request.json().catch(() => null))

  if (!result.success) {
    return Response.json(
      { message: result.error.issues[0]?.message || genericErrorMessage },
      { status: 422, headers: responseHeaders }
    )
  }

  const { uuid, name, email } = result.data

  try {
    const checkIn = checkInAttendee(uuid, checkedInBy)

    if (!checkIn) {
      return Response.json(
        {
          message:
            "No registration matches this ticket. Search for the attendee by name or email instead.",
        },
        { status: 404, headers: responseHeaders }
      )
    }

    const { record, status } = checkIn

    if (status === "checked-in") {
      scheduleAttendeeSheetSync()
    }

    return Response.json(
      {
        status,
        attendee: toAttendee(record),
        detailsDiffer:
          (name !== undefined && normalize(name) !== normalize(record.name)) ||
          (email !== undefined && normalize(email) !== normalize(record.email)),
        stats: getCheckInStats(),
      } satisfies CheckInResponse,
      { headers: responseHeaders }
    )
  } catch (error) {
    console.error("Unable to check in attendee:", error)

    return Response.json(
      { message: databaseErrorMessage },
      { status: 503, headers: responseHeaders }
    )
  }
}
