import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

export const metadata: Metadata = {
  title: "Registration Received | VarCamp 2026",
  description: "Your VarCamp 2026 volunteer registration has been received.",
}

export default function VolunteerRegistrationSuccessPage() {
  return (
    <RegistrationStatus
      badge="Submission completed"
      heading="Registration received"
      description="Thank you for volunteering with VarCamp 2026."
      asideHeading="What happens next"
      asideDescription="We will review your registration and contact you later with the next steps."
      footer="You can now close this page."
    />
  )
}
