export const registrationSteps = [
  {
    title: "General Information",
    description: "How to reach you",
    introduction: "We'll use these details to contact you about your session.",
  },
  {
    title: "Speaker Profile",
    description: "Who you are",
    introduction: "This appears on your public speaker profile.",
  },
  {
    title: "About the Session",
    description: "What you will share",
    introduction: "Tell us what you'd like to present.",
  },
] as const

export type RegistrationStep = (typeof registrationSteps)[number]

export type GeneralInformation = {
  name: string
  email: string
  phone: string
  telegram: string
  country: string
}

export const socialLinkFields = [
  {
    key: "linkedin",
    label: "LinkedIn",
    prefix: "linkedin.com/in/",
    placeholder: "username",
  },
  {
    key: "facebook",
    label: "Facebook",
    prefix: "facebook.com/",
    placeholder: "username",
  },
  {
    key: "youtube",
    label: "YouTube",
    prefix: "youtube.com/@",
    placeholder: "channel",
  },
  {
    key: "github",
    label: "GitHub",
    prefix: "github.com/",
    placeholder: "username",
  },
] as const

export type SocialLinkKey = (typeof socialLinkFields)[number]["key"]

export type SpeakerProfile = Record<SocialLinkKey, string> & {
  jobTitle: string
  company: string
  biography: string
  aiWorkflow: string
}

export const extractLinkHandle = (text: string, prefix: string) => {
  const link = text.trim().replace(/^https?:\/\//i, "")
  const prefixIndex = link.toLowerCase().indexOf(prefix.toLowerCase())

  if (
    prefixIndex === -1 ||
    !/^([a-z0-9-]+\.)*$/i.test(link.slice(0, prefixIndex))
  ) {
    return undefined
  }

  const handle = link.slice(prefixIndex + prefix.length).replace(/^@/, "")

  return (
    handle.match(/^profile\.php\?id=\d+/)?.[0] ?? handle.replace(/[/?#].*$/, "")
  )
}

export const profilePhotoAcceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const
export const profilePhotoMaxBytes = 5 * 1024 * 1024

export type ProfilePhoto = {
  file: File
  previewUrl: string
}

export const preferredTimeOptions = [
  { label: "Morning", value: "morning" },
  { label: "Evening", value: "evening" },
] as const

export const yesNoOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
] as const

export type PreferredTime = (typeof preferredTimeOptions)[number]["value"]
export type YesNoAnswer = (typeof yesNoOptions)[number]["value"]

export type SessionDetails = {
  title: string
  description: string
  preferredTime: PreferredTime | ""
  needsTechnicalSupport: YesNoAnswer | ""
  technicalSupport: string
  recordingConsent: YesNoAnswer | ""
  hasSpecialRequest: YesNoAnswer | ""
  specialRequest: string
  codeOfConduct: boolean
}
