import type { Metadata } from "next"

import { VolunteerRegistration } from "./_components/volunteer-registration"

export const metadata: Metadata = {
  title: "Volunteer Registration | VarCamp 2026",
  description: "Register to volunteer for VarCamp 2026.",
}

export default function VolunteerPage() {
  return <VolunteerRegistration />
}
