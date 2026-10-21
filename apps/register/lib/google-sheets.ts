import "server-only"

import { JWT } from "google-auth-library"

import { socialLinkFields as communitySocialLinkFields } from "@/app/2026/community/_components/community-data"
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
import {
  preferredTimeOptions,
  socialLinkFields,
} from "@/app/2026/speaker/_components/speaker-data"
import type { CommunityRegistrationSubmission } from "@/lib/community-registration-schema"
import type { OrganizerRegistrationSubmission } from "@/lib/organizer-registration-schema"
import type { SpeakerRegistrationSubmission } from "@/lib/speaker-registration-schema"
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

export const speakerRegistrationHeaders = [
  "Submitted At (UTC)",
  "Name",
  "Email",
  "Phone",
  "Telegram",
  "Job Title",
  "Company/Organization",
  "Biography",
  "Profile Photo",
  "LinkedIn",
  "Facebook",
  "YouTube",
  "GitHub",
  "Session Title",
  "Session Description",
  "Preferred Time",
  "Needs Technical Support",
  "Technical Support",
  "Recording Consent",
  "Has Special Request",
  "Special Request",
  "Submitter IP",
  // Added after launch, so they follow the original columns.
  "Country",
  "AI/Tech Workflow",
  "Code of Conduct",
] as const

export const communityRegistrationHeaders = [
  "Submitted At (UTC)",
  "Community/Organization Name",
  "About",
  "Logo",
  "Website",
  "Facebook",
  "LinkedIn",
  "X",
  "YouTube",
  "Contact Person Name",
  "Email",
  "Telegram",
  "Purpose of Participation",
  "Non-profit",
  "Submitter IP",
] as const

type RegistrationKind = "volunteer" | "organizer"

type RegistrationSubmission =
  VolunteerRegistrationSubmission | OrganizerRegistrationSubmission

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

type RangeSettings = { environmentVariable: string; defaultRange: string }

// Both registration forms live in the same spreadsheet and are separated by
// sheet tab. Only the tab name differs between the two ranges.
const registrationRangeSettings: Record<RegistrationKind, RangeSettings> = {
  volunteer: {
    environmentVariable: "GOOGLE_SHEETS_RANGE",
    defaultRange: "Volunteer Registrations!A:Y",
  },
  organizer: {
    environmentVariable: "GOOGLE_SHEETS_ORGANIZER_RANGE",
    defaultRange: "Organizer Registrations!A:Y",
  },
}

// Speaker registrations use their own tab and columns in the same spreadsheet.
const speakerRangeSettings: RangeSettings = {
  environmentVariable: "GOOGLE_SHEETS_SPEAKER_RANGE",
  defaultRange: "Speaker Registrations!A:Y",
}

const communityRangeSettings: RangeSettings = {
  environmentVariable: "GOOGLE_SHEETS_COMMUNITY_RANGE",
  defaultRange: "Community Registrations!A:O",
}

type GoogleSheetsConfig = {
  clientEmail: string
  privateKey: string
  spreadsheetId: string
  range: string
}

function getGoogleSheetsConfig({
  environmentVariable,
  defaultRange,
}: RangeSettings): GoogleSheetsConfig {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  )
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const configuredRange =
    process.env[environmentVariable]?.trim() || defaultRange
  const range = getRegistrationRange(configuredRange, defaultRange)

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error("Google Sheets environment variables are not configured.")
  }

  return { clientEmail, privateKey, spreadsheetId, range }
}

// Only the tab name is configurable; the columns always follow the default.
function getRegistrationRange(configuredRange: string, defaultRange: string) {
  const separatorIndex = configuredRange.indexOf("!")
  const sheetPrefix =
    separatorIndex >= 0 ? configuredRange.slice(0, separatorIndex + 1) : ""

  return `${sheetPrefix}${defaultRange.slice(defaultRange.indexOf("!") + 1)}`
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
  range: string,
  headers: readonly string[]
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
    currentHeaders.length === headers.length &&
    headers.every((header, index) => currentHeaders[index] === header)

  if (headersAreCurrent) {
    return
  }

  await auth.request({
    url: headerUrl,
    method: "PUT",
    params: { valueInputOption: "RAW" },
    data: {
      majorDimension: "ROWS",
      values: [[...headers]],
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

const speakerPreferredTimeNames: ReadonlyMap<string, string> = new Map(
  preferredTimeOptions.map((option) => [option.value, option.label])
)

function getProfileLink(prefix: string, handle: string) {
  return handle ? `https://${prefix}${handle}` : ""
}

function createSpeakerRegistrationRow(
  submission: SpeakerRegistrationSubmission,
  profilePhotoUrl: string,
  clientIp: string
) {
  const { generalInformation, profile, session } = submission

  return [
    new Date().toISOString(),
    generalInformation.name,
    generalInformation.email,
    generalInformation.phone,
    getProfileLink("t.me/", generalInformation.telegram),
    profile.jobTitle,
    profile.company,
    profile.biography,
    profilePhotoUrl,
    ...socialLinkFields.map((field) =>
      getProfileLink(field.prefix, profile[field.key])
    ),
    session.title,
    session.description,
    speakerPreferredTimeNames.get(session.preferredTime) ||
      session.preferredTime,
    session.needsTechnicalSupport,
    session.technicalSupport,
    session.recordingConsent,
    session.hasSpecialRequest,
    session.specialRequest,
    clientIp,
    generalInformation.country,
    profile.aiWorkflow,
    session.codeOfConduct ? "Agreed" : "",
  ]
}

function createCommunityRegistrationRow(
  submission: CommunityRegistrationSubmission,
  logoUrl: string,
  clientIp: string
) {
  const { profile, contact, participation } = submission

  return [
    new Date().toISOString(),
    profile.name,
    profile.about,
    logoUrl,
    profile.website,
    ...communitySocialLinkFields.map((field) =>
      getProfileLink(field.prefix, profile[field.key])
    ),
    contact.name,
    contact.email,
    getProfileLink("t.me/", contact.telegram),
    participation.purpose,
    participation.isNonProfit,
    clientIp,
  ]
}

async function appendRow(
  rangeSettings: RangeSettings,
  headers: readonly string[],
  row: string[]
) {
  const { clientEmail, privateKey, spreadsheetId, range } =
    getGoogleSheetsConfig(rangeSettings)
  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [sheetsScope],
  })

  await ensureHeaderRow(auth, spreadsheetId, range, headers)

  await auth.request({
    url: `${getSheetsValueUrl(spreadsheetId, range)}:append`,
    method: "POST",
    params: {
      insertDataOption: "INSERT_ROWS",
      valueInputOption: "RAW",
    },
    data: {
      majorDimension: "ROWS",
      values: [row],
    },
  })
}

async function appendRegistration(
  kind: RegistrationKind,
  submission: RegistrationSubmission,
  clientIp: string
) {
  await appendRow(
    registrationRangeSettings[kind],
    registrationHeaders,
    createRegistrationRow(kind, submission, clientIp)
  )
}

export async function appendSpeakerRegistration(
  submission: SpeakerRegistrationSubmission,
  profilePhotoUrl: string,
  clientIp: string
) {
  await appendRow(
    speakerRangeSettings,
    speakerRegistrationHeaders,
    createSpeakerRegistrationRow(submission, profilePhotoUrl, clientIp)
  )
}

export async function appendCommunityRegistration(
  submission: CommunityRegistrationSubmission,
  logoUrl: string,
  clientIp: string
) {
  await appendRow(
    communityRangeSettings,
    communityRegistrationHeaders,
    createCommunityRegistrationRow(submission, logoUrl, clientIp)
  )
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
