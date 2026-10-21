import type { Metadata } from "next"

import { CommunityRegistration } from "./_components/community-registration"

export const metadata: Metadata = {
  title: "Community Registration | VarCamp 2026",
  description: "Register your community or organization for VarCamp 2026.",
}

export default function CommunityPage() {
  return <CommunityRegistration />
}
