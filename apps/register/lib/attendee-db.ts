import "server-only"

import { mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { DatabaseSync } from "node:sqlite"

import type { AttendeeRegistrationSubmission } from "@/lib/attendee-registration-schema"

// Relative to the app directory unless an absolute path is configured.
const defaultDatabasePath = "data/attendees.sqlite"

// AUTOINCREMENT never reuses a number, so a ticket ID stays unique even if a
// registration is deleted.
const schema = `
  CREATE TABLE IF NOT EXISTS attendees (
    ticket_number INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    email_key TEXT NOT NULL UNIQUE,
    lives_in_myanmar TEXT NOT NULL,
    country TEXT NOT NULL,
    topics TEXT NOT NULL,
    other_topics TEXT NOT NULL,
    agreement INTEGER NOT NULL,
    newsletter INTEGER NOT NULL,
    submitter_ip TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    checked_in_at TEXT,
    checked_in_by TEXT
  );
`

export type AttendeeRecord = {
  ticketId: string
  uuid: string
  name: string
  email: string
  livesInMyanmar: string
  country: string
  topics: string[]
  otherTopics: string
  agreement: boolean
  newsletter: boolean
  submitterIp: string
  submittedAt: string
  checkedInAt: string
  checkedInBy: string
}

type AttendeeRow = {
  ticket_number: number
  uuid: string
  full_name: string
  email: string
  lives_in_myanmar: string
  country: string
  topics: string
  other_topics: string
  agreement: number
  newsletter: number
  submitter_ip: string
  submitted_at: string
  checked_in_at: string | null
  checked_in_by: string | null
}

const globalDatabase = globalThis as typeof globalThis & {
  attendeeDatabase?: DatabaseSync
}

// Opened on first use rather than on import, so building the app never
// touches the database.
function getDatabase() {
  if (!globalDatabase.attendeeDatabase) {
    const path = resolve(
      process.env.ATTENDEE_DATABASE_PATH?.trim() || defaultDatabasePath
    )

    mkdirSync(dirname(path), { recursive: true })

    const database = new DatabaseSync(path)

    database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA busy_timeout = 5000;
    `)
    database.exec(schema)
    globalDatabase.attendeeDatabase = database
  }

  return globalDatabase.attendeeDatabase
}

export function createTicketId(ticketNumber: number) {
  return `VC-2026-${String(ticketNumber).padStart(5, "0")}`
}

// Emails are compared without case or surrounding spaces.
const toEmailKey = (email: string) => email.trim().toLowerCase()

function toRecord(row: AttendeeRow): AttendeeRecord {
  return {
    ticketId: createTicketId(row.ticket_number),
    uuid: row.uuid,
    name: row.full_name,
    email: row.email,
    livesInMyanmar: row.lives_in_myanmar,
    country: row.country,
    topics: JSON.parse(row.topics) as string[],
    otherTopics: row.other_topics,
    agreement: row.agreement === 1,
    newsletter: row.newsletter === 1,
    submitterIp: row.submitter_ip,
    submittedAt: row.submitted_at,
    checkedInAt: row.checked_in_at ?? "",
    checkedInBy: row.checked_in_by ?? "",
  }
}

export function isAttendeeEmailRegistered(email: string) {
  return (
    getDatabase()
      .prepare("SELECT 1 FROM attendees WHERE email_key = ?")
      .get(toEmailKey(email)) !== undefined
  )
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Error && error.message.includes("UNIQUE constraint failed")
  )
}

// Returns null when the email is already registered.
export function insertAttendee(
  submission: AttendeeRegistrationSubmission,
  uuid: string,
  submitterIp: string
) {
  const { aboutYou, interests } = submission

  try {
    const row = getDatabase()
      .prepare(
        `INSERT INTO attendees (
          uuid, full_name, email, email_key, lives_in_myanmar, country,
          topics, other_topics, agreement, newsletter, submitter_ip,
          submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *`
      )
      .get(
        uuid,
        aboutYou.fullName,
        aboutYou.email,
        toEmailKey(aboutYou.email),
        aboutYou.livesInMyanmar,
        aboutYou.country,
        JSON.stringify(interests.topics),
        interests.otherTopics,
        interests.agreement ? 1 : 0,
        interests.newsletter ? 1 : 0,
        submitterIp,
        new Date().toISOString()
      ) as AttendeeRow

    return toRecord(row)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return null
    }

    throw error
  }
}

export function findAttendeeByUuid(uuid: string) {
  const row = getDatabase()
    .prepare("SELECT * FROM attendees WHERE uuid = ?")
    .get(uuid) as AttendeeRow | undefined

  return row ? toRecord(row) : null
}

// The update only applies to attendees not yet checked in, so two staff
// scanning the same ticket at once can't both check it in.
export function checkInAttendee(uuid: string, checkedInBy: string) {
  const { changes } = getDatabase()
    .prepare(
      `UPDATE attendees SET checked_in_at = ?, checked_in_by = ?
       WHERE uuid = ? AND checked_in_at IS NULL`
    )
    .run(new Date().toISOString(), checkedInBy, uuid)
  const record = findAttendeeByUuid(uuid)

  return record
    ? {
        status:
          changes === 1
            ? ("checked-in" as const)
            : ("already-checked-in" as const),
        record,
      }
    : null
}

const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, "\\$&")

// Matches a ticket ID or its number alone ("42" for VC-2026-00042), or part
// of a name or email.
export function searchAttendees(query: string, limit: number) {
  const normalizedQuery = query.trim().replace(/\s+/g, " ").toLowerCase()
  const ticketNumber = Number(
    normalizedQuery.match(/^(?:vc-2026-)?(\d{1,9})$/)?.[1] ?? -1
  )
  const pattern = `%${escapeLikePattern(normalizedQuery)}%`
  const rows = getDatabase()
    .prepare(
      `SELECT * FROM attendees
       WHERE ticket_number = ?
         OR email_key LIKE ? ESCAPE '\\'
         OR lower(full_name) LIKE ? ESCAPE '\\'
       ORDER BY ticket_number
       LIMIT ?`
    )
    .all(ticketNumber, pattern, pattern, limit) as AttendeeRow[]

  return rows.map(toRecord)
}

export function getCheckInStats() {
  const stats = getDatabase()
    .prepare(
      "SELECT COUNT(*) AS total, COUNT(checked_in_at) AS checkedIn FROM attendees"
    )
    .get() as { total: number; checkedIn: number }

  return { checkedIn: stats.checkedIn, total: stats.total }
}

export function listAttendees() {
  const rows = getDatabase()
    .prepare("SELECT * FROM attendees ORDER BY ticket_number")
    .all() as AttendeeRow[]

  return rows.map(toRecord)
}
