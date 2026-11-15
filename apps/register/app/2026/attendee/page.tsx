import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

import { attendeeRegistrationOpen } from "./_components/attendee-data"
import { AttendeeRegistration } from "./_components/attendee-registration"

export const metadata: Metadata = attendeeRegistrationOpen
  ? {
      title: "Attendee Registration | VarCamp 2026",
      description: "Register to attend VarCamp 2026.",
    }
  : {
      title: "Registrations Closed | VarCamp 2026",
      description: "Attendee registration for VarCamp 2026 is now closed.",
    }

export default function AttendeePage() {
  if (attendeeRegistrationOpen) {
    return <AttendeeRegistration />
  }

  return (
    <RegistrationStatus
      badge="Registrations closed"
      heading="Attendee registrations are closed"
      description="Thank you for your interest. We are no longer accepting attendee registrations for VarCamp 2026."
      asideHeading="What happens next"
      asideDescription="Follow our channels for updates and announcements about VarCamp."
      footer="Already registered? Your ticket is still valid."
    />
  )
}
