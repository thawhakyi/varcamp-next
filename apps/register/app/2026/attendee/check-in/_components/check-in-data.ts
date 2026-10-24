export type CheckInAttendee = {
  ticketId: string
  uuid: string
  name: string
  email: string
  country: string
  checkedInAt: string
  checkedInBy: string
}

export type CheckInStats = {
  checkedIn: number
  total: number
}

export type CheckInResponse = {
  status: "checked-in" | "already-checked-in"
  attendee: CheckInAttendee
  // The name or email in the QR code differs from the registration.
  detailsDiffer: boolean
  stats: CheckInStats
}

export type CheckInSearchResponse = {
  attendees: CheckInAttendee[]
  stats: CheckInStats
}

export const staffNameMaxLength = 60

// Recorded as "Checked In By" when attendees check themselves in.
export const selfCheckInLabel = "Self check-in"
