// Runs once when the server starts.
export async function register() {
  // The sheet copy uses the database and Node APIs, and is skipped where
  // Google Sheets isn't configured, such as local development.
  if (
    // eslint-disable-next-line turbo/no-undeclared-env-vars -- Set by Next.js.
    process.env.NEXT_RUNTIME !== "nodejs" ||
    !process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  ) {
    return
  }

  // Copies the attendee database to the sheet after each restart, so the
  // sheet is current even when no registration or check-in follows.
  const { scheduleAttendeeSheetSync } =
    await import("@/lib/attendee-sheet-sync")

  scheduleAttendeeSheetSync()
}
