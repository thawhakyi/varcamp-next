import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

import { communityRegistrationOpen } from "./_components/community-data"
import { CommunityRegistration } from "./_components/community-registration"

export const metadata: Metadata = communityRegistrationOpen
  ? {
      title: "Community Registration | VarCamp 2026",
      description: "Register your community or organization for VarCamp 2026.",
    }
  : {
      title: "Registrations Closed | VarCamp 2026",
      description: "Community registration for VarCamp 2026 is now closed.",
    }

export default function CommunityPage() {
  if (communityRegistrationOpen) {
    return <CommunityRegistration />
  }

  return (
    <RegistrationStatus
      badge="Registrations closed"
      heading="Community registrations are closed"
      description="Thank you for your interest. We are no longer accepting community registrations for VarCamp 2026."
      asideHeading="What happens next"
      asideDescription="We are reviewing every registration we received and will contact communities directly with the next steps."
      footer="Already registered? Watch your inbox for our follow-up."
    />
  )
}
