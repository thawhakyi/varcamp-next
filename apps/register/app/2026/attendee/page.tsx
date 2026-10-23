import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

export const metadata: Metadata = {
  title: "Coming Soon | VarCamp 2026",
  description: "Attendee registration for VarCamp 2026 opens soon.",
}

export default function AttendeePage() {
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
