export const registrationSteps = [
  { title: "Personal Information", description: "Who you are" },
  { title: "Team Preferences", description: "How you fit in" },
  { title: "Skills and Experience", description: "What you bring" },
  { title: "Technical Readiness", description: "Your setup" },
  { title: "Commitment and Agreement", description: "Final steps" },
] as const

export type RegistrationStep = (typeof registrationSteps)[number]

export const volunteerTeams = [
  {
    id: "event-coordination",
    name: "Event Coordination Team",
    summary:
      "Plans the event, coordinates volunteers, manages schedules, and communicates with partners and sponsors.",
    sections: [
      {
        title: "Responsibilities",
        items: [
          "Plan the event",
          "Coordinate volunteers",
          "Manage schedules",
          "Communicate with partners and sponsors",
        ],
      },
    ],
  },
  {
    id: "technology-platform",
    name: "Technology and Platform Team",
    summary:
      "Manages the event website, registration system, WorkAdventure map, livestreaming, and technical troubleshooting.",
    sections: [
      {
        title: "Responsibilities",
        items: [
          "Manage the event website",
          "Manage the registration system",
          "Maintain the WorkAdventure map",
          "Support livestreaming",
          "Troubleshoot technical issues",
        ],
      },
    ],
  },
  {
    id: "program-production",
    name: "Program and Production Team",
    summary:
      "Coordinates speakers, sessions, rehearsals, moderators, presentations, recordings, and event-day production.",
    sections: [
      {
        title: "Responsibilities",
        items: [
          "Coordinate speakers and sessions",
          "Run rehearsals",
          "Coordinate moderators",
          "Manage presentations and recordings",
          "Lead event-day production",
        ],
      },
    ],
  },
  {
    id: "communications-creative",
    name: "Communications and Creative Team",
    summary:
      "Handles event promotion, social media, announcements, graphic design, videos, and post-event documentation.",
    sections: [
      {
        title: "Responsibilities",
        items: [
          "Promote the event",
          "Manage social media and announcements",
          "Create graphic designs and videos",
          "Prepare post-event documentation",
        ],
      },
    ],
  },
  {
    id: "participant-support-community",
    name: "Participant Support and Community Team",
    summary:
      "Welcomes participants, provides help desk support, facilitates networking, promotes accessibility, and manages community safety.",
    sections: [
      {
        title: "Responsibilities",
        items: [
          "Welcome participants",
          "Provide help desk support",
          "Facilitate networking",
          "Promote accessibility",
          "Manage community safety",
        ],
      },
    ],
  },
] as const

export const teamPriorityFields = [
  {
    key: "first",
    label: "First priority",
    placeholder: "Choose your top team",
  },
  {
    key: "second",
    label: "Second priority",
    placeholder: "Choose your backup team",
  },
  {
    key: "third",
    label: "Third priority",
    placeholder: "Choose another team",
  },
] as const

export type TeamPriorityKey = (typeof teamPriorityFields)[number]["key"]
export type TeamPriorities = Record<TeamPriorityKey, string>

export const volunteerSkillOptions = [
  { id: "event-coordination", label: "Event coordination" },
  { id: "volunteer-management", label: "Volunteer management" },
  { id: "public-speaking", label: "Public speaking" },
  { id: "session-moderation", label: "Session moderation" },
  { id: "community-moderation", label: "Community moderation" },
  { id: "customer-support", label: "Customer support" },
  { id: "workadventure", label: "WorkAdventure" },
  { id: "tiled-map-editor", label: "Tiled map editor" },
  { id: "javascript", label: "JavaScript" },
  { id: "laravel", label: "Laravel" },
  { id: "react-nextjs", label: "React or Next.js" },
  { id: "wordpress", label: "WordPress" },
  { id: "ui-ux-design", label: "UI/UX design" },
  { id: "graphic-design", label: "Graphic design" },
  { id: "video-editing", label: "Video editing" },
  { id: "livestreaming", label: "Livestreaming" },
  { id: "audio-production", label: "Audio production" },
  { id: "social-media-management", label: "Social media management" },
  { id: "copywriting", label: "Copywriting" },
  { id: "translation", label: "Translation" },
  { id: "documentation", label: "Documentation" },
  { id: "accessibility-support", label: "Accessibility support" },
] as const

export type VolunteerSkillId = (typeof volunteerSkillOptions)[number]["id"]

export const technicalReadinessQuestions = [
  {
    key: "computerAccess",
    label: "Do you have access to a computer?",
  },
  {
    key: "stableInternet",
    label: "Do you have a stable internet connection?",
  },
  {
    key: "workingMicrophone",
    label: "Do you have a working microphone?",
  },
  {
    key: "workingCamera",
    label: "Do you have a working camera?",
  },
  {
    key: "operatingSystem",
    label: "Which operating system do you use?",
  },
  {
    key: "browserTesting",
    label: "Which browsers can you test?",
  },
  {
    key: "workAdventureExperience",
    label: "Have you used WorkAdventure before?",
  },
] as const

export type TechnicalReadinessKey =
  (typeof technicalReadinessQuestions)[number]["key"]
export type YesNoAnswer = "yes" | "no"
export type TechnicalReadinessAnswers = Record<
  TechnicalReadinessKey,
  YesNoAnswer | ""
>

export const commitmentAgreementFields = [
  {
    key: "responsibilityCommitment",
    label: "I can commit to the responsibilities assigned to me.",
  },
  {
    key: "availabilityCommunication",
    label: "I agree to communicate if I become unavailable.",
  },
  {
    key: "codeOfConduct",
    label: "I agree to follow the VarCamp 2026 Code of Conduct.",
  },
  {
    key: "orientationAttendance",
    label: "I agree to attend required orientation or training.",
  },
  {
    key: "placementUnderstanding",
    label:
      "I understand that submitting this form does not guarantee placement.",
  },
  {
    key: "informationConsent",
    label: "I consent to the use of my information for volunteer coordination.",
  },
] as const

export type CommitmentAgreementKey =
  (typeof commitmentAgreementFields)[number]["key"]
export type CommitmentAgreements = Record<CommitmentAgreementKey, boolean>
