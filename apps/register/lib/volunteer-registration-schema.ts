import { z } from "zod"
import { isValidPhoneNumber } from "libphonenumber-js"

import {
  browserOptions,
  commitmentAgreementFields,
  operatingSystemOptions,
  volunteerSkillOptions,
  volunteerTeams,
} from "@/app/2026/volunteer/_components/volunteer-data"

const volunteerTeamIds: ReadonlySet<string> = new Set(
  volunteerTeams.map((team) => team.id)
)
const volunteerSkillIds: ReadonlySet<string> = new Set(
  volunteerSkillOptions.map((skill) => skill.id)
)
const operatingSystemIds: ReadonlySet<string> = new Set(
  operatingSystemOptions.map((operatingSystem) => operatingSystem.value)
)
const browserIds: ReadonlySet<string> = new Set(
  browserOptions.map((browser) => browser.value)
)

const requiredText = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} is too long.`)

const optionalTeam = z
  .string()
  .refine(
    (team) => team === "" || volunteerTeamIds.has(team),
    "Select a valid volunteer team."
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
    phone: requiredText("Phone number", 30).refine(
      (phone) => isValidPhoneNumber(phone),
      "Enter a valid international phone number."
    ),
    country: z
      .string()
      .length(2, "Select your country.")
      .regex(/^[A-Z]{2}$/, "Select a valid country."),
    city: requiredText("City", 100),
    timezone: requiredText("Timezone", 100),
    bio: z.string().trim().max(1500, "Short bio is too long."),
  })
  .strict()

export const teamPrioritiesSchema = z
  .object({
    first: z
      .string()
      .refine(
        (team) => volunteerTeamIds.has(team),
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
      .refine((skill) => volunteerSkillIds.has(skill), "Select a valid skill.")
  )
  .min(1, "Select at least one skill.")
  .max(volunteerSkillOptions.length)
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
        (operatingSystem) => operatingSystemIds.has(operatingSystem),
        "Select your operating system."
      ),
    browser: z
      .string()
      .refine((browser) => browserIds.has(browser), "Select your browser."),
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

export const volunteerRegistrationSchema = z
  .object({
    personalInformation: personalInformationSchema,
    teamPriorities: teamPrioritiesSchema,
    selectedSkills: selectedSkillsSchema,
    technicalReadiness: technicalReadinessSchema,
    commitmentAgreements: commitmentAgreementsSchema,
  })
  .strict()

export type VolunteerRegistrationSubmission = z.infer<
  typeof volunteerRegistrationSchema
>

export type PersonalInformation = {
  fullName: string
  username: string
  email: string
  phone: string
  city: string
  bio: string
}

export type RegistrationFieldErrors = Record<string, string>
