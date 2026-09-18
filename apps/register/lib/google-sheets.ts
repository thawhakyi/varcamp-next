import "server-only"

import { JWT } from "google-auth-library"

import {
  browserOptions as organizerBrowserOptions,
  contactChannels as organizerContactChannels,
  operatingSystemOptions as organizerOperatingSystemOptions,
  organizerSkillOptions,
  organizerTeams,
} from "@/app/2026/organizer/_components/organizer-data"
import {
  browserOptions,
  contactChannels,
  operatingSystemOptions,
  volunteerSkillOptions,
  volunteerTeams,
} from "@/app/2026/volunteer/_components/volunteer-data"
import type { OrganizerRegistrationSubmission } from "@/lib/organizer-registration-schema"
import type { VolunteerRegistrationSubmission } from "@/lib/volunteer-registration-schema"

const sheetsScope = "https://www.googleapis.com/auth/spreadsheets"

export const registrationHeaders = [
  "Submitted At (UTC)",
  "Full Name",
  "Username",
  "Email",
  "Contact Channel",
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

export const volunteerRegistrationHeaders = registrationHeaders

type RegistrationKind = "volunteer" | "organizer"

type RegistrationSubmission =
  | VolunteerRegistrationSubmission
  | OrganizerRegistrationSubmission

type RegistrationLookups = {
  browserNames: ReadonlyMap<string, string>
  contactChannelDetails: ReadonlyMap<
    string,
    { label: string; linkPrefix?: string }
  >
  operatingSystemNames: ReadonlyMap<string, string>
  skillNames: ReadonlyMap<string, string>
  teamNames: ReadonlyMap<string, string>
}

type RegistrationSource = {
  browsers: readonly { value: string; label: string }[]
  channels: readonly { id: string; label: string; linkPrefix?: string }[]
  operatingSystems: readonly { value: string; label: string }[]
  skills: readonly { id: string; label: string }[]
  teams: readonly { id: string; name: string }[]
}

function createRegistrationLookups(
  source: RegistrationSource
): RegistrationLookups {
  return {
    browserNames: new Map(
      source.browsers.map((browser) => [browser.value, browser.label])
    ),
    contactChannelDetails: new Map(
      source.channels.map((channel) => [channel.id, channel])
    ),
    operatingSystemNames: new Map(
      source.operatingSystems.map((operatingSystem) => [
        operatingSystem.value,
        operatingSystem.label,
      ])
    ),
    skillNames: new Map(source.skills.map((skill) => [skill.id, skill.label])),
    teamNames: new Map(source.teams.map((team) => [team.id, team.name])),
  }
}

const registrationLookups: Record<RegistrationKind, RegistrationLookups> = {
  volunteer: createRegistrationLookups({
    browsers: browserOptions,
    channels: contactChannels,
    operatingSystems: operatingSystemOptions,
    skills: volunteerSkillOptions,
    teams: volunteerTeams,
  }),
  organizer: createRegistrationLookups({
    browsers: organizerBrowserOptions,
    channels: organizerContactChannels,
    operatingSystems: organizerOperatingSystemOptions,
    skills: organizerSkillOptions,
    teams: organizerTeams,
  }),
}

// Both registration forms live in the same spreadsheet and are separated by
// sheet tab. Only the tab name differs between the two ranges.
const registrationRangeSettings: Record<
  RegistrationKind,
  { environmentVariable: string; defaultRange: string }
> = {
  volunteer: {
    environmentVariable: "GOOGLE_SHEETS_RANGE",
    defaultRange: "Volunteer Registrations!A:AA",
  },
  organizer: {
    environmentVariable: "GOOGLE_SHEETS_ORGANIZER_RANGE",
    defaultRange: "Organizer Registrations!A:AA",
  },
}

type GoogleSheetsConfig = {
  clientEmail: string
  privateKey: string
  spreadsheetId: string
  range: string
}

function getGoogleSheetsConfig(kind: RegistrationKind): GoogleSheetsConfig {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  )
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const { environmentVariable, defaultRange } = registrationRangeSettings[kind]
  const configuredRange =
    process.env[environmentVariable]?.trim() || defaultRange
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
    currentHeaders.length === registrationHeaders.length &&
    registrationHeaders.every(
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
      values: [[...registrationHeaders]],
    },
  })
}

function getTeamName(lookups: RegistrationLookups, teamId: string) {
  return teamId ? lookups.teamNames.get(teamId) || teamId : ""
}

function getContactChannel(
  lookups: RegistrationLookups,
  channelId: string,
  value: string
) {
  const channel = lookups.contactChannelDetails.get(channelId)

  if (!channel) {
    return value
  }

  return `${channel.label}: ${channel.linkPrefix ?? ""}${value}`
}

function createRegistrationRow(
  kind: RegistrationKind,
  submission: RegistrationSubmission,
  clientIp: string
) {
  const lookups = registrationLookups[kind]
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
    getContactChannel(
      lookups,
      personalInformation.contactChannel,
      personalInformation.contactValue
    ),
    personalInformation.country,
    personalInformation.city,
    personalInformation.timezone,
    personalInformation.bio,
    getTeamName(lookups, teamPriorities.first),
    getTeamName(lookups, teamPriorities.second),
    getTeamName(lookups, teamPriorities.third),
    selectedSkills
      .map((skill) => lookups.skillNames.get(skill) || skill)
      .join(", "),
    technicalReadiness.computerAccess,
    technicalReadiness.stableInternet,
    // Keep the removed microphone and camera columns blank so historical rows
    // remain aligned with the existing 26-column spreadsheet.
    "",
    "",
    lookups.operatingSystemNames.get(technicalReadiness.operatingSystem) ||
      technicalReadiness.operatingSystem,
    lookups.browserNames.get(technicalReadiness.browser) ||
      technicalReadiness.browser,
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

async function appendRegistration(
  kind: RegistrationKind,
  submission: RegistrationSubmission,
  clientIp: string
) {
  const { clientEmail, privateKey, spreadsheetId, range } =
    getGoogleSheetsConfig(kind)
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
      values: [createRegistrationRow(kind, submission, clientIp)],
    },
  })
}

export async function appendVolunteerRegistration(
  submission: VolunteerRegistrationSubmission,
  clientIp: string
) {
  await appendRegistration("volunteer", submission, clientIp)
}

export async function appendOrganizerRegistration(
  submission: OrganizerRegistrationSubmission,
  clientIp: string
) {
  await appendRegistration("organizer", submission, clientIp)
}
