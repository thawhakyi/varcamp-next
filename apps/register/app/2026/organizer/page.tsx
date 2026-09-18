import type { Metadata } from "next"

import { OrganizerRegistration } from "./_components/organizer-registration"

export const metadata: Metadata = {
  title: "Organizer Registration | VarCamp 2026",
  description: "Register as an organizer for VarCamp 2026.",
}

export default function OrganizerPage() {
  return <OrganizerRegistration />
}
