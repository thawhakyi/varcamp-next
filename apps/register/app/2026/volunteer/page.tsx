import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

export const metadata: Metadata = {
  title: "Coming Soon | VarCamp 2026",
  description: "Volunteer registration for VarCamp 2026 opens soon.",
}

export default function VolunteerPage() {
  return (
    <RegistrationStatus
      badge="Coming soon"
      heading="Volunteer registration is coming soon"
      description="We are putting the final touches on the volunteer program for VarCamp 2026. Registration will open here shortly."
      asideHeading="What happens next"
      asideDescription="Once the organizer team is in place, we will announce volunteer roles and open registration on this page."
      footer="Check back soon, or follow our channels for the announcement."
    />
  )
}
