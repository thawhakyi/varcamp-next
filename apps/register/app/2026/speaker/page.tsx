import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

import { speakerRegistrationOpen } from "./_components/speaker-data"
import { SpeakerRegistration } from "./_components/speaker-registration"

export const metadata: Metadata = speakerRegistrationOpen
  ? {
      title: "Speaker Registration | VarCamp 2026",
      description: "Register as a speaker for VarCamp 2026.",
    }
  : {
      title: "Registrations Closed | VarCamp 2026",
      description: "Speaker registration for VarCamp 2026 is now closed.",
    }

export default function SpeakerPage() {
  if (speakerRegistrationOpen) {
    return <SpeakerRegistration />
  }

  return (
    <RegistrationStatus
      badge="Registrations closed"
      heading="Speaker registrations are closed"
      description="Thank you for your interest. We are no longer accepting speaker registrations for VarCamp 2026."
      asideHeading="What happens next"
      asideDescription="We are reviewing every session we received and will contact speakers directly with the next steps."
      footer="Already registered? Watch your inbox for our follow-up."
    />
  )
}
