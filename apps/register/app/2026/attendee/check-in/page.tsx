import type { Metadata } from "next"

import {
  getCheckInSession,
  getSelfCheckInOpensAt,
  isCheckInConfigured,
  isSelfCheckInOpen,
} from "@/lib/check-in-session"

import { CheckInClosed } from "./_components/check-in-closed"
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

  // Staff sign in at ?staff, which isn't linked from anywhere.
  const { staff } = await searchParams

  if (staff !== undefined) {
    return <CheckInSignIn isConfigured={isCheckInConfigured()} />
  }

  return isSelfCheckInOpen() ? (
    <CheckInStation mode="self" />
  ) : (
    <CheckInClosed opensAt={getSelfCheckInOpensAt()} />
  )
}
