import type { Metadata } from "next"

import { SpeakerRegistration } from "./_components/speaker-registration"

export const metadata: Metadata = {
  title: "Speaker Registration | VarCamp 2026",
  description: "Register as a speaker for VarCamp 2026.",
}

export default function SpeakerPage() {
  return <SpeakerRegistration />
}
