import { z } from "zod"

import { topicOptions } from "@/app/2026/attendee/_components/attendee-data"

const topicIds = topicOptions.map((topic) => topic.id) as [
  (typeof topicOptions)[number]["id"],
  ...(typeof topicOptions)[number]["id"][],
]

export const aboutYouSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Enter your full name.")
      .max(120, "Full name is too long."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address.")
      .max(254, "Email is too long."),
    livesInMyanmar: z.enum(["yes", "no"], {
      message: "Tell us whether you live in Myanmar.",
    }),
    country: z.string().trim(),
  })
  .strict()
  .superRefine((aboutYou, context) => {
    if (aboutYou.livesInMyanmar !== "no") {
      return
    }

    if (!/^[A-Z]{2}$/.test(aboutYou.country)) {
      context.addIssue({
        code: "custom",
        message: "Select the country you live in.",
        path: ["country"],
      })
    } else if (aboutYou.country === "MM") {
      context.addIssue({
        code: "custom",
        message: "Choose Yes above if you live in Myanmar.",
        path: ["country"],
      })
    }
  })
  // Myanmar residents don't pick a country, so it's filled in for them.
  .transform((aboutYou) => ({
    ...aboutYou,
    country: aboutYou.livesInMyanmar === "yes" ? "MM" : aboutYou.country,
  }))

export const interestsSchema = z
  .object({
    topics: z
      .array(z.enum(topicIds))
      .min(1, "Select at least one topic you're interested in.")
      .max(topicIds.length)
      .transform((topics) => [...new Set(topics)]),
    otherTopics: z.string().trim().max(200, "Other topics is too long."),
    agreement: z.literal(true, {
      message: "Agree to the Privacy Policy and Code of Conduct to continue.",
    }),
    newsletter: z.boolean(),
  })
  .strict()
  .superRefine((interests, context) => {
    if (interests.topics.includes("others") && !interests.otherTopics) {
      context.addIssue({
        code: "custom",
        message: "Tell us which other topics you're interested in.",
        path: ["otherTopics"],
      })
    }
  })
  .transform((interests) => ({
    ...interests,
    otherTopics: interests.topics.includes("others")
      ? interests.otherTopics
      : "",
  }))

export const attendeeRegistrationSchema = z
  .object({
    aboutYou: aboutYouSchema,
    interests: interestsSchema,
  })
  .strict()

export type AttendeeRegistrationSubmission = z.infer<
  typeof attendeeRegistrationSchema
>

// Listed in step order.
export const registrationSections = ["aboutYou", "interests"] as const

export type RegistrationSection = (typeof registrationSections)[number]

export type RegistrationFieldErrors = Record<string, string>
