import type { Metadata } from "next"

import {
  getCheckInSession,
  isCheckInConfigured,
  isSelfCheckInOpen,
} from "@/lib/check-in-session"

import { CheckInSignIn } from "./_components/check-in-sign-in"
import { CheckInStation } from "./_components/check-in-station"

export const metadata: Metadata = {
  title: "Check-in | VarCamp 2026",
  description: "Record your VarCamp 2026 attendance with your e-ticket.",
  robots: { index: false, follow: false },
}

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getCheckInSession()

  if (session) {
    return <CheckInStation mode="staff" staffName={session.staffName} />
  }

  // ?staff shows the sign-in form even after self check-in opens.
  const { staff } = await searchParams

  if (isSelfCheckInOpen() && staff === undefined) {
    return <CheckInStation mode="self" />
  }

  return <CheckInSignIn isConfigured={isCheckInConfigured()} />
}
