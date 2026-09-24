import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

export const metadata: Metadata = {
  title: "Registrations Closed | VarCamp 2026",
  description: "Organizer registration for VarCamp 2026 is now closed.",
}

export default function OrganizerPage() {
  return (
    <RegistrationStatus
      badge="Registrations closed"
      heading="Organizer registrations are closed"
      description="Thank you for the overwhelming interest. We are no longer accepting organizer registrations for VarCamp 2026."
      asideHeading="What happens next"
      asideDescription="We are reviewing every registration we received and will contact applicants directly with the next steps."
      footer="Already registered? Watch your inbox for our follow-up."
    />
  )
}
