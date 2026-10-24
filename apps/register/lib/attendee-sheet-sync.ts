import "server-only"

import { listAttendees } from "@/lib/attendee-db"
import { replaceAttendeeSheet } from "@/lib/google-sheets"

// The attendee tab is a copy of the database for organizers. Copies are
// spaced out so a busy minute costs a handful of Sheets requests, not one per
// registration or check-in.
const minimumIntervalMs = 15_000
const retryDelayMs = 60_000

type SyncState = {
  isPending: boolean
  isRunning: boolean
  nextRunAt: number
  timer?: ReturnType<typeof setTimeout>
}

const globalSync = globalThis as typeof globalThis & {
  attendeeSheetSync?: SyncState
}

const syncState = (globalSync.attendeeSheetSync ??= {
  isPending: false,
  isRunning: false,
  nextRunAt: 0,
})

export function scheduleAttendeeSheetSync() {
  syncState.isPending = true

  if (syncState.timer || syncState.isRunning) {
    return
  }

  syncState.timer = setTimeout(
    runAttendeeSheetSync,
    Math.max(0, syncState.nextRunAt - Date.now())
  )
}

async function runAttendeeSheetSync() {
  syncState.timer = undefined
  syncState.isPending = false
  syncState.isRunning = true
  syncState.nextRunAt = Date.now() + minimumIntervalMs

  try {
    await replaceAttendeeSheet(listAttendees())
  } catch (error) {
    console.error("Unable to copy attendees to Google Sheets:", error)
    syncState.isPending = true
    syncState.nextRunAt = Date.now() + retryDelayMs
  } finally {
    syncState.isRunning = false

    if (syncState.isPending) {
      scheduleAttendeeSheetSync()
    }
  }
}
