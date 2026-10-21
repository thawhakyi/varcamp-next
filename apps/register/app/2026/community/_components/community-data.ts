export const registrationSteps = [
  {
    title: "Community Profile",
    description: "Who you are",
    introduction: "Tell us about your community or organization.",
  },
  {
    title: "Contact Person",
    description: "How to reach you",
    introduction: "We'll use these details to contact you about VarCamp.",
  },
  {
    title: "Participation",
    description: "Why you're joining",
    introduction: "Tell us how your community would like to take part.",
  },
] as const

export type RegistrationStep = (typeof registrationSteps)[number]

export const socialLinkFields = [
  {
    key: "facebook",
    label: "Facebook",
    prefix: "facebook.com/",
    placeholder: "page",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    prefix: "linkedin.com/company/",
    placeholder: "company",
  },
  {
    key: "x",
    label: "X",
    prefix: "x.com/",
    placeholder: "username",
  },
  {
    key: "youtube",
    label: "YouTube",
    prefix: "youtube.com/@",
    placeholder: "channel",
  },
] as const

export type SocialLinkKey = (typeof socialLinkFields)[number]["key"]

export type CommunityProfile = Record<SocialLinkKey, string> & {
  name: string
  about: string
  website: string
}

export type ContactPerson = {
  name: string
  email: string
  telegram: string
}

export const yesNoOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
] as const

export type YesNoAnswer = (typeof yesNoOptions)[number]["value"]

export type Participation = {
  purpose: string
  isNonProfit: YesNoAnswer | ""
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

export const logoAcceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const
export const logoMaxBytes = 5 * 1024 * 1024

export type CommunityLogo = {
  file: File
  previewUrl: string
}
