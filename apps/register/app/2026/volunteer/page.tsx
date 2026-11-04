import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

import { volunteerRegistrationOpen } from "./_components/volunteer-data"
import { VolunteerRegistration } from "./_components/volunteer-registration"

export const metadata: Metadata = volunteerRegistrationOpen
  ? {
      title: "Volunteer Registration | VarCamp 2026",
      description: "Register to volunteer for VarCamp 2026.",
    }
  : {
      title: "Registrations Closed | VarCamp 2026",
      description: "Volunteer registration for VarCamp 2026 is now closed.",
    }

export default function VolunteerPage() {
  if (volunteerRegistrationOpen) {
    return <VolunteerRegistration />
  }

  return (
    <RegistrationStatus
      badge="Registrations closed"
      heading="Volunteer registrations are closed"
      description="Thank you for your interest. We are no longer accepting volunteer registrations for VarCamp 2026."
      asideHeading="What happens next"
      asideDescription="We are reviewing every registration we received and will contact volunteers directly with the next steps."
      footer="Already registered? Watch your inbox for our follow-up."
    />
  )
}
