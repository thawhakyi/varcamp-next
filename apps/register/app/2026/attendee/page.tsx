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
      title: "Coming Soon | VarCamp 2026",
      description: "Attendee registration for VarCamp 2026 opens soon.",
    }

export default function AttendeePage() {
  if (attendeeRegistrationOpen) {
    return <AttendeeRegistration />
  }

  return (
    <RegistrationStatus
      badge="Coming soon"
      heading="Attendee registration is coming soon"
      description="We are getting VarCamp 2026 ready for you. Attendee registration will open here shortly."
      asideHeading="What happens next"
      asideDescription="Once the speakers and sessions are confirmed, we will announce the schedule and open attendee registration on this page."
      footer="Check back soon, or follow our channels for the announcement."
    />
  )
}
