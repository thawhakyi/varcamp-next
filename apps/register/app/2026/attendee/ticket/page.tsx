import type { Metadata } from "next"

import { AttendeeTicketView } from "../_components/attendee-ticket"

export const metadata: Metadata = {
  title: "Your E-Ticket | VarCamp 2026",
  description: "Your VarCamp 2026 attendee e-ticket.",
  robots: { index: false },
}

export default function AttendeeTicketPage() {
  return <AttendeeTicketView />
}
