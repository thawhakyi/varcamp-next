import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

export const metadata: Metadata = {
  title: "Registration Received | VarCamp 2026",
  description: "Your VarCamp 2026 speaker registration has been received.",
}

export default function SpeakerRegistrationSuccessPage() {
  return (
    <RegistrationStatus
      badge="Registration received"
      heading="Thank you for registering"
      description="Your speaker registration for VarCamp 2026 has been received."
      asideHeading="What happens next"
      asideDescription="We'll review your registration and contact you by email or Telegram about next steps."
      footer="You can now close this page."
    />
  )
}
