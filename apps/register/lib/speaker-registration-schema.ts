import { z } from "zod"
import { isValidPhoneNumber } from "libphonenumber-js"

import {
  type PreferredTime,
  preferredTimeOptions,
  profilePhotoAcceptedTypes,
  profilePhotoMaxBytes,
} from "@/app/2026/speaker/_components/speaker-data"

const preferredTimeIds = preferredTimeOptions.map((option) => option.value) as [
  PreferredTime,
  ...PreferredTime[],
]

const requiredText = (
  label: string,
  maxLength: number,
  requiredMessage = `${label} is required.`
) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage)
    .max(maxLength, `${label} is too long.`)

const optionalText = (label: string, maxLength: number) =>
  z.string().trim().max(maxLength, `${label} is too long.`)

const socialHandle = (label: string) =>
  optionalText(label, 120).refine(
    (handle) => handle === "" || /^[^\s/]+$/.test(handle),
    `Enter only the username from your ${label} link.`
  )

const yesNoAnswer = z.enum(["yes", "no"], {
  message: "Choose Yes or No.",
})

// Lets the follow-up checks report alongside other invalid answers instead of
// only after those are fixed.
const isObjectPayload = ({ value }: { value: unknown }) =>
  typeof value === "object" && value !== null

export const generalInformationSchema = z
  .object({
    name: requiredText("Name", 120),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address.")
      .max(254, "Email is too long."),
    phone: z
      .string()
      .min(1, "Phone is required.")
      .refine(
        (phone) => isValidPhoneNumber(phone),
        "Enter a valid phone number."
      ),
    telegram: optionalText("Telegram", 120).regex(
      /^[a-zA-Z0-9_]*$/,
      "Use only letters, numbers, and underscores."
    ),
    country: z
      .string()
      .length(2, "Select your country.")
      .regex(/^[A-Z]{2}$/, "Select a valid country."),
  })
  .strict()

export const speakerProfileSchema = z
  .object({
    jobTitle: optionalText("Job title", 120),
    company: optionalText("Company/Organization", 120),
    biography: optionalText("Biography", 1500),
    aiWorkflow: optionalText("AI/Tech workflow", 1500),
    linkedin: socialHandle("LinkedIn"),
    facebook: socialHandle("Facebook"),
    youtube: socialHandle("YouTube"),
    github: socialHandle("GitHub"),
  })
  .strict()

export const sessionSchema = z
  .object({
    title: requiredText("Session title", 150, "Enter your session title."),
    description: requiredText(
      "Session description",
      1500,
      "Describe your session."
    ),
    preferredTime: z.enum(preferredTimeIds, {
      message: "Choose a preferred time.",
    }),
    needsTechnicalSupport: yesNoAnswer,
    technicalSupport: optionalText("Technical support", 1500),
    recordingConsent: yesNoAnswer,
    hasSpecialRequest: yesNoAnswer,
    specialRequest: optionalText("Special request", 1500),
    codeOfConduct: z.literal(true, {
      message: "Agree to the Code of Conduct to continue.",
    }),
  })
  .strict()
  .refine(
    (session) =>
      session.needsTechnicalSupport !== "yes" ||
      Boolean(session.technicalSupport?.trim()),
    {
      message: "Describe the technical support you need.",
      path: ["technicalSupport"],
      when: isObjectPayload,
    }
  )
  .refine(
    (session) =>
      session.hasSpecialRequest !== "yes" ||
      Boolean(session.specialRequest?.trim()),
    {
      message: "Describe your request.",
      path: ["specialRequest"],
      when: isObjectPayload,
    }
  )
  // Answers typed before switching back to "No" are hidden in the form, so
  // they are not part of the submission.
  .transform((session) => ({
    ...session,
    technicalSupport:
      session.needsTechnicalSupport === "yes" ? session.technicalSupport : "",
    specialRequest:
      session.hasSpecialRequest === "yes" ? session.specialRequest : "",
  }))

export const speakerRegistrationSchema = z
  .object({
    generalInformation: generalInformationSchema,
    profile: speakerProfileSchema,
    session: sessionSchema,
  })
  .strict()

export type SpeakerRegistrationSubmission = z.infer<
  typeof speakerRegistrationSchema
>

// Listed in step order.
export const registrationSections = [
  "generalInformation",
  "profile",
  "session",
] as const

export type RegistrationSection = (typeof registrationSections)[number]

export const validateProfilePhoto = (file: File) => {
  if (!profilePhotoAcceptedTypes.some((type) => type === file.type)) {
    return "Use a JPG, PNG, or WebP image."
  }

  if (file.size > profilePhotoMaxBytes) {
    return "Profile photo must be 5 MB or smaller."
  }

  return undefined
}

export type RegistrationFieldErrors = Record<string, string>
