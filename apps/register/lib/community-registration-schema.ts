import { z } from "zod"

import {
  logoAcceptedTypes,
  logoMaxBytes,
} from "@/app/2026/community/_components/community-data"

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

// Accepts "example.com" as well as full links, and stores them with https.
const withProtocol = (website: string) =>
  website === "" || /^https?:\/\//i.test(website)
    ? website
    : `https://${website}`

const isWebsite = (website: string) => {
  try {
    const url = new URL(website)

    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname.includes(".")
    )
  } catch {
    return false
  }
}

export const communityProfileSchema = z
  .object({
    name: requiredText(
      "Community/Organization name",
      150,
      "Enter your community or organization name."
    ),
    about: requiredText(
      "About",
      1500,
      "Tell us about your community or organization."
    ),
    website: optionalText("Website", 300)
      .transform(withProtocol)
      .refine(
        (website) => website === "" || isWebsite(website),
        "Enter a valid website address."
      ),
    facebook: socialHandle("Facebook"),
    linkedin: socialHandle("LinkedIn"),
    x: socialHandle("X"),
    youtube: socialHandle("YouTube"),
  })
  .strict()

export const contactPersonSchema = z
  .object({
    name: requiredText("Contact person name", 120),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address.")
      .max(254, "Email is too long."),
    telegram: requiredText("Telegram username", 120).regex(
      /^[a-zA-Z0-9_]*$/,
      "Use only letters, numbers, and underscores."
    ),
  })
  .strict()

export const participationSchema = z
  .object({
    purpose: requiredText(
      "Purpose",
      1500,
      "Tell us why your community would like to take part."
    ),
    isNonProfit: z.enum(["yes", "no"], {
      message: "Choose Yes or No.",
    }),
  })
  .strict()

export const communityRegistrationSchema = z
  .object({
    profile: communityProfileSchema,
    contact: contactPersonSchema,
    participation: participationSchema,
  })
  .strict()

export type CommunityRegistrationSubmission = z.infer<
  typeof communityRegistrationSchema
>

// Listed in step order.
export const registrationSections = [
  "profile",
  "contact",
  "participation",
] as const

export type RegistrationSection = (typeof registrationSections)[number]

export const logoRequiredMessage = "Upload your community logo."

export const validateLogo = (file: File) => {
  if (!logoAcceptedTypes.some((type) => type === file.type)) {
    return "Use a JPG, PNG, or WebP image."
  }

  if (file.size > logoMaxBytes) {
    return "Logo must be 5 MB or smaller."
  }

  return undefined
}

export type RegistrationFieldErrors = Record<string, string>
