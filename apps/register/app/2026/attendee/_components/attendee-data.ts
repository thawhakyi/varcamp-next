// Switches the page from "Coming soon" to the form, and lets the API accept
// submissions.
export const attendeeRegistrationOpen = false

export const registrationSteps = [
  {
    title: "About You",
    description: "Who you are",
    introduction: "Tell us who you are and where you'll join from.",
  },
  {
    title: "Interests",
    description: "What you'd like to hear",
    introduction:
      "Pick the topics you're interested in so we can plan sessions around them.",
  },
] as const

export type RegistrationStep = (typeof registrationSteps)[number]

export const yesNoOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
] as const

export type YesNoAnswer = (typeof yesNoOptions)[number]["value"]

export const topicOptions = [
  { id: "ai", label: "Artificial Intelligence (AI)" },
  { id: "machine-learning", label: "Machine Learning & Deep Learning" },
  { id: "web-development", label: "Web Development (Frontend & Backend)" },
  { id: "cloud-devops", label: "Cloud Computing & DevOps" },
  { id: "cybersecurity", label: "Cybersecurity & Privacy" },
  { id: "iot", label: "Internet of Things (IoT)" },
  { id: "blockchain", label: "Blockchain & Web3" },
  { id: "data-science", label: "Data Science & Analytics" },
  { id: "mobile-development", label: "Mobile App Development" },
  { id: "ar-vr", label: "Augmented Reality (AR) / Virtual Reality (VR)" },
  { id: "ux-ui", label: "UX/UI Design" },
  { id: "robotics", label: "Robotics & Automation" },
  { id: "quantum-computing", label: "Quantum Computing" },
  { id: "saas-product", label: "SaaS & Product Management" },
  { id: "digital-marketing", label: "Digital Marketing & Growth Hacking" },
  { id: "startups", label: "Startup & Entrepreneurship" },
  { id: "open-source", label: "Open Source Software" },
  { id: "edge-computing", label: "Edge Computing" },
  { id: "game-development", label: "Game Development" },
  {
    id: "tech-for-good",
    label: "Tech for Social Good (Impact & Sustainability)",
  },
  { id: "others", label: "Others" },
] as const

export type TopicId = (typeof topicOptions)[number]["id"]

export type AboutYou = {
  fullName: string
  email: string
  livesInMyanmar: YesNoAnswer | ""
  country: string
}

export type Interests = {
  topics: TopicId[]
  otherTopics: string
  agreement: boolean
  newsletter: boolean
}

// Printed on the ticket, e.g. VC-2026-00001.
export const ticketIdPattern = /^VC-2026-\d{5,}$/

export type AttendeeTicket = {
  ticketId: string
  // Encoded in the QR code with the name and email for check-in.
  uuid: string
  name: string
  email: string
}

// Hands the ticket from the form to the ticket page within the same tab.
export const ticketStorageKey = "varcamp-2026-attendee-ticket"
