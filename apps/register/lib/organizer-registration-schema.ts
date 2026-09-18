import { z } from "zod"
import { isValidPhoneNumber } from "libphonenumber-js"

import {
  browserOptions,
  commitmentAgreementFields,
  contactChannels,
  type ContactChannelId,
  operatingSystemOptions,
  organizerSkillOptions,
  organizerTeams,
} from "@/app/2026/organizer/_components/organizer-data"

const organizerTeamIds: ReadonlySet<string> = new Set(
  organizerTeams.map((team) => team.id)
)
const organizerSkillIds: ReadonlySet<string> = new Set(
  organizerSkillOptions.map((skill) => skill.id)
)
const operatingSystemIds: ReadonlySet<string> = new Set(
  operatingSystemOptions.map((operatingSystem) => operatingSystem.value)
)
const browserIds: ReadonlySet<string> = new Set(
  browserOptions.map((browser) => browser.value)
)
const contactChannelIds = contactChannels.map((channel) => channel.id) as [
  ContactChannelId,
  ...ContactChannelId[],
]

const requiredText = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} is too long.`)

const optionalTeam = z
  .string()
  .refine(
    (team) => team === "" || organizerTeamIds.has(team),
    "Select a valid organizer team."
  )

export const personalInformationSchema = z
  .object({
    fullName: requiredText("Full name", 120),
    username: requiredText("Username", 60).regex(
      /^[a-zA-Z0-9._-]+$/,
      "Use only letters, numbers, periods, hyphens, or underscores."
    ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address.")
      .max(254, "Email is too long."),
    contactChannel: z.enum(contactChannelIds, {
      message: "Choose a contact channel.",
    }),
    contactValue: requiredText("Contact details", 120),
    country: z
      .string()
      .length(2, "Select your country.")
      .regex(/^[A-Z]{2}$/, "Select a valid country."),
    city: requiredText("City", 100),
    timezone: requiredText("Timezone", 100),
    bio: z.string().trim().max(1500, "Short bio is too long."),
  })
  .strict()
  .superRefine(({ contactChannel, contactValue }, context) => {
    if (!contactValue) {
      return
    }

    const addContactIssue = (message: string) => {
      context.addIssue({
        code: "custom",
        message,
        path: ["contactValue"],
      })
    }

    if (contactChannel === "phone") {
      if (!isValidPhoneNumber(contactValue)) {
        addContactIssue("Enter a valid international phone number.")
      }
      return
    }

    if (contactChannel === "facebook") {
      if (!/^[a-zA-Z0-9.]+$/.test(contactValue)) {
        addContactIssue("Enter the username from your Facebook profile link.")
      }
      return
    }

    if (contactChannel === "telegram") {
      if (!/^[a-zA-Z0-9_]+$/.test(contactValue)) {
        addContactIssue("Enter your Telegram username without @.")
      }
      return
    }

    if (contactChannel === "discord") {
      if (!/^\d{17,20}$/.test(contactValue)) {
        addContactIssue("Enter your 17–20 digit Discord user ID.")
      }
    }
  })

export const teamPrioritiesSchema = z
  .object({
    first: z
      .string()
      .refine(
        (team) => organizerTeamIds.has(team),
        "Select your first team priority."
      ),
    second: optionalTeam,
    third: optionalTeam,
  })
  .strict()
  .refine(
    (priorities) => {
      const selectedTeams = Object.values(priorities).filter(Boolean)
      return new Set(selectedTeams).size === selectedTeams.length
    },
    {
      message: "Each team priority must be different.",
      path: ["second"],
    }
  )

export const selectedSkillsSchema = z
  .array(
    z
      .string()
      .refine((skill) => organizerSkillIds.has(skill), "Select a valid skill.")
  )
  .min(1, "Select at least one skill.")
  .max(organizerSkillOptions.length)
  .refine(
    (skills) => new Set(skills).size === skills.length,
    "Each skill can only be selected once."
  )

export const technicalReadinessSchema = z
  .object({
    computerAccess: z.enum(["yes", "no"], {
      message: "Choose Yes or No.",
    }),
    stableInternet: z.enum(["yes", "no"], {
      message: "Choose Yes or No.",
    }),
    operatingSystem: z
      .string()
      .refine(
        (operatingSystem) =>
          operatingSystem === "" || operatingSystemIds.has(operatingSystem),
        "Select a valid operating system."
      ),
    browser: z
      .string()
      .refine(
        (browser) => browser === "" || browserIds.has(browser),
        "Select a valid browser."
      ),
    workAdventureExperience: z.enum(["yes", "no"], {
      message: "Choose Yes or No.",
    }),
  })
  .strict()

export const commitmentAgreementsSchema = z
  .object(
    Object.fromEntries(
      commitmentAgreementFields.map((agreement) => [
        agreement.key,
        z.literal(true, {
          message: "This agreement is required.",
        }),
      ])
    ) as Record<
      (typeof commitmentAgreementFields)[number]["key"],
      z.ZodLiteral<true>
    >
  )
  .strict()

export const organizerRegistrationSchema = z
  .object({
    personalInformation: personalInformationSchema,
    teamPriorities: teamPrioritiesSchema,
    selectedSkills: selectedSkillsSchema,
    technicalReadiness: technicalReadinessSchema,
    commitmentAgreements: commitmentAgreementsSchema,
  })
  .strict()

export type OrganizerRegistrationSubmission = z.infer<
  typeof organizerRegistrationSchema
>

export type PersonalInformation = {
  fullName: string
  username: string
  email: string
  contactChannel: ContactChannelId | ""
  contactValue: string
  city: string
  bio: string
}

export type RegistrationFieldErrors = Record<string, string>
