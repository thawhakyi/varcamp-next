import type { Metadata } from "next"
import Link from "next/link"

import { RegistrationStatus } from "@/app/_components/registration-status"

export const metadata: Metadata = {
  title: "Page Not Found | VarCamp 2026",
  description: "The page you were looking for could not be found.",
}

export default function NotFound() {
  return (
    <RegistrationStatus
      badge="404"
      heading="Page not found"
      description="The page you were looking for doesn't exist or has moved."
      asideHeading="Looking to register?"
      asideDescription="All VarCamp 2026 registration forms are listed on the registration home page."
      footer={
        <Link href="/" className="underline underline-offset-4">
          Go to registration home
        </Link>
      }
    />
  )
}
