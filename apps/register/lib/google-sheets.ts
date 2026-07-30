import "server-only"

import { JWT } from "google-auth-library"

import {
  browserOptions,
  operatingSystemOptions,
  volunteerSkillOptions,
  volunteerTeams,
} from "@/app/2026/volunteer/_components/volunteer-data"
import type { VolunteerRegistrationSubmission } from "@/lib/volunteer-registration-schema"

const sheetsScope = "https://www.googleapis.com/auth/spreadsheets"

export const volunteerRegistrationHeaders = [
  "Submitted At (UTC)",
  "Full Name",
  "Username",
  "Email",
  "Phone",
  "Country Code",
  "City",
  "Timezone",
  "Short Bio",
  "First Team Priority",
  "Second Team Priority",
  "Third Team Priority",
  "Skills",
  "Computer Access",
  "Stable Internet",
  "Working Microphone",
  "Working Camera",
  "Operating System",
  "Browser",
  "WorkAdventure Experience",
  "Responsibility Commitment",
  "Availability Communication",
  "Code of Conduct",
  "Orientation Attendance",
  "Placement Understanding",
  "Information Consent",
  "Submitter IP",
] as const

const teamNames: ReadonlyMap<string, string> = new Map(
  volunteerTeams.map((team) => [team.id, team.name])
)
const skillNames: ReadonlyMap<string, string> = new Map(
  volunteerSkillOptions.map((skill) => [skill.id, skill.label])
)
const operatingSystemNames: ReadonlyMap<string, string> = new Map(
  operatingSystemOptions.map((operatingSystem) => [
    operatingSystem.value,
    operatingSystem.label,
  ])
)
const browserNames: ReadonlyMap<string, string> = new Map(
  browserOptions.map((browser) => [browser.value, browser.label])
)

type GoogleSheetsConfig = {
  clientEmail: string
  privateKey: string
  spreadsheetId: string
  range: string
}

function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  )
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const configuredRange =
    process.env.GOOGLE_SHEETS_RANGE || "Volunteer Registrations!A:AA"
  const range = getRegistrationRange(configuredRange)

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error("Google Sheets environment variables are not configured.")
  }

  return { clientEmail, privateKey, spreadsheetId, range }
}

function getRegistrationRange(configuredRange: string) {
  const separatorIndex = configuredRange.indexOf("!")
  const sheetPrefix =
    separatorIndex >= 0 ? configuredRange.slice(0, separatorIndex + 1) : ""

  return `${sheetPrefix}A:AA`
}

function getHeaderRange(range: string) {
  const separatorIndex = range.indexOf("!")
  const sheetPrefix =
    separatorIndex >= 0 ? range.slice(0, separatorIndex + 1) : ""
  const columns = separatorIndex >= 0 ? range.slice(separatorIndex + 1) : range
  const [start = "A", end = "Z"] = columns.split(":")
  const startColumn = start.replace(/\d/g, "") || "A"
  const endColumn = end.replace(/\d/g, "") || "Z"

  return `${sheetPrefix}${startColumn}1:${endColumn}1`
}

function getSheetsValueUrl(spreadsheetId: string, range: string) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${encodeURIComponent(range)}`
}

async function ensureHeaderRow(
  auth: JWT,
  spreadsheetId: string,
  range: string
) {
  const headerRange = getHeaderRange(range)
  const headerUrl = getSheetsValueUrl(spreadsheetId, headerRange)
  const existingHeader = await auth.request<{ values?: string[][] }>({
    url: headerUrl,
    method: "GET",
    params: { majorDimension: "ROWS" },
  })

  const currentHeaders = existingHeader.data.values?.[0] ?? []
  const headersAreCurrent =
    currentHeaders.length === volunteerRegistrationHeaders.length &&
    volunteerRegistrationHeaders.every(
      (header, index) => currentHeaders[index] === header
    )

  if (headersAreCurrent) {
    return
  }

  await auth.request({
    url: headerUrl,
    method: "PUT",
    params: { valueInputOption: "RAW" },
    data: {
      majorDimension: "ROWS",
      values: [[...volunteerRegistrationHeaders]],
    },
  })
}

function getTeamName(teamId: string) {
  return teamId ? teamNames.get(teamId) || teamId : ""
}

function createRegistrationRow(
  submission: VolunteerRegistrationSubmission,
  clientIp: string
) {
  const {
    personalInformation,
    selectedSkills,
    teamPriorities,
    technicalReadiness,
  } = submission

  return [
    new Date().toISOString(),
    personalInformation.fullName,
    personalInformation.username,
    personalInformation.email,
    personalInformation.phone,
    personalInformation.country,
    personalInformation.city,
    personalInformation.timezone,
    personalInformation.bio,
    getTeamName(teamPriorities.first),
    getTeamName(teamPriorities.second),
    getTeamName(teamPriorities.third),
    selectedSkills.map((skill) => skillNames.get(skill) || skill).join(", "),
    technicalReadiness.computerAccess,
    technicalReadiness.stableInternet,
    // Keep the removed microphone and camera columns blank so historical rows
    // remain aligned with the existing 26-column spreadsheet.
    "",
    "",
    operatingSystemNames.get(technicalReadiness.operatingSystem) ||
      technicalReadiness.operatingSystem,
    browserNames.get(technicalReadiness.browser) || technicalReadiness.browser,
    technicalReadiness.workAdventureExperience,
    // Keep the six agreement columns for historical alignment, but do not
    // store new Commitment and Agreement step values.
    "",
    "",
    "",
    "",
    "",
    "",
    clientIp,
  ]
}

export async function appendVolunteerRegistration(
  submission: VolunteerRegistrationSubmission,
  clientIp: string
) {
  const { clientEmail, privateKey, spreadsheetId, range } =
    getGoogleSheetsConfig()
  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [sheetsScope],
  })

  await ensureHeaderRow(auth, spreadsheetId, range)

  await auth.request({
    url: `${getSheetsValueUrl(spreadsheetId, range)}:append`,
    method: "POST",
    params: {
      insertDataOption: "INSERT_ROWS",
      valueInputOption: "RAW",
    },
    data: {
      majorDimension: "ROWS",
      values: [createRegistrationRow(submission, clientIp)],
    },
  })
}
