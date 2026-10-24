import type { Metadata } from "next"

import { RegistrationStatus } from "@/app/_components/registration-status"

import { ticketIdPattern } from "../_components/attendee-data"

export const metadata: Metadata = {
  title: "Registration Received | VarCamp 2026",
  description: "Your VarCamp 2026 attendee registration has been received.",
}

export default async function AttendeeRegistrationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await searchParams
  const ticketId =
    typeof id === "string" && ticketIdPattern.test(id) ? id : undefined

  return (
    <RegistrationStatus
      badge="Registration received"
      heading="You're registered for VarCamp 2026"
      description="Thank you for registering. We can't wait to see you at VarCamp."
      asideHeading="Your ticket ID"
      asideDescription="Keep your e-ticket handy. You'll show its QR code to check in on event day."
      footer={
        ticketId ? (
          <span className="font-mono text-lg tracking-wider select-all">
            {ticketId}
          </span>
        ) : (
          "You can now close this page."
        )
      }
    />
  )
}
