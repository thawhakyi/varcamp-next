"use client"

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import {
  CircleCheckIcon,
  CircleXIcon,
  LogOutIcon,
  ScanLineIcon,
  SearchIcon,
  TriangleAlertIcon,
  UploadIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Progress } from "@workspace/ui/components/progress"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"

import type {
  CheckInAttendee,
  CheckInResponse,
  CheckInSearchResponse,
  CheckInStats,
} from "./check-in-data"
import { CheckInShell } from "./check-in-shell"
import { decodeQrImageFile, QrScanner } from "./qr-scanner"

type Outcome = {
  tone: "success" | "warning" | "error"
  title: string
  message?: string
  attendee?: CheckInAttendee
}

type CheckInRequest = {
  uuid: string
  name?: string
  email?: string
}

// A ticket held in front of the camera is read many times a second, so the
// same code is ignored for a few seconds after each scan.
const repeatScanDelayMs = 5000

const countryNames = new Intl.DisplayNames(undefined, { type: "region" })

function getCountryName(code: string) {
  try {
    return code ? (countryNames.of(code) ?? code) : ""
  } catch {
    return code
  }
}

function formatCheckInTime(checkedInAt: string) {
  const date = new Date(checkedInAt)
  const isToday = date.toDateString() === new Date().toDateString()

  return new Intl.DateTimeFormat(
    undefined,
    isToday
      ? { timeStyle: "short" }
      : { dateStyle: "medium", timeStyle: "short" }
  ).format(date)
}

function parseTicketQrCode(value: string): CheckInRequest | null {
  try {
    const payload = JSON.parse(value) as Record<string, unknown>

    return typeof payload.uuid === "string"
      ? {
          uuid: payload.uuid,
          name: typeof payload.name === "string" ? payload.name : undefined,
          email: typeof payload.email === "string" ? payload.email : undefined,
        }
      : null
  } catch {
    return null
  }
}

function vibrate(tone: Outcome["tone"]) {
  navigator.vibrate?.(tone === "success" ? 80 : [60, 60, 60])
}

// Staff can also search; attendees checking themselves in can only use
// their own ticket.
type CheckInStationProps =
  { mode: "staff"; staffName: string } | { mode: "self" }

export function CheckInStation(props: CheckInStationProps) {
  const isStaff = props.mode === "staff"
  const router = useRouter()
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [stats, setStats] = useState<CheckInStats | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CheckInAttendee[] | null>(
    null
  )
  const [isSearching, setIsSearching] = useState(false)
  const isCheckingInRef = useRef(false)
  const lastScanRef = useRef({ value: "", time: 0 })

  const handleSessionEnded = useCallback(
    (message?: string) => {
      toast.error(message || "Your check-in session has ended. Sign in again.")
      router.refresh()
    },
    [router]
  )

  const showOutcome = (nextOutcome: Outcome) => {
    setOutcome(nextOutcome)
    vibrate(nextOutcome.tone)
  }

  const searchAttendees = useCallback(
    async (searchQuery: string) => {
      const response = await fetch(
        `/api/attendee-check-in?q=${encodeURIComponent(searchQuery)}`,
        { cache: "no-store" }
      )
      const responseBody = (await response.json().catch(() => null)) as
        (CheckInSearchResponse & { message?: string }) | null

      if (response.status === 401) {
        handleSessionEnded(responseBody?.message)
        return null
      }

      if (!response.ok || !responseBody?.stats) {
        throw new Error(
          responseBody?.message || "Couldn't load the attendee list."
        )
      }

      setStats(responseBody.stats)

      return responseBody.attendees
    },
    [handleSessionEnded]
  )

  useEffect(() => {
    if (!isStaff) {
      return
    }

    searchAttendees("").catch((error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't load the attendee list."
      )
    })
  }, [isStaff, searchAttendees])

  const checkIn = async (request: CheckInRequest) => {
    isCheckingInRef.current = true
    setIsCheckingIn(true)

    try {
      const response = await fetch("/api/attendee-check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      })
      const responseBody = (await response.json().catch(() => null)) as
        (CheckInResponse & { message?: string }) | null

      if (response.status === 401) {
        handleSessionEnded(responseBody?.message)
        return
      }

      if (!response.ok || !responseBody?.attendee) {
        const isNotFound = response.status === 404

        showOutcome({
          tone: "error",
          title: isNotFound ? "Ticket not found" : "Couldn't check in",
          message:
            isNotFound && !isStaff
              ? "Make sure this is your VarCamp 2026 e-ticket, or email contact@var.camp for help."
              : responseBody?.message || "Check the connection and try again.",
        })
        return
      }

      const { attendee } = responseBody

      setStats(responseBody.stats)
      setSearchResults(
        (current) =>
          current?.map((result) =>
            result.uuid === attendee.uuid ? attendee : result
          ) ?? null
      )
      const isFirstCheckIn = responseBody.status === "checked-in"
      const checkedInTime = formatCheckInTime(attendee.checkedInAt)

      // Check-in only records attendance, so for attendees a repeat scan is
      // just a confirmation.
      showOutcome(
        !isStaff
          ? {
              tone: "success",
              title: isFirstCheckIn
                ? "Attendance recorded"
                : "Attendance already recorded",
              attendee,
              message: isFirstCheckIn
                ? "Thanks for joining VarCamp 2026!"
                : `Recorded at ${checkedInTime}.`,
            }
          : isFirstCheckIn
            ? {
                tone: "success",
                title: "Checked in",
                attendee,
                message: responseBody.detailsDiffer
                  ? "The name or email in this QR code differs from the registration. Confirm who the attendee is."
                  : undefined,
              }
            : {
                tone: "warning",
                title: "Already checked in",
                attendee,
                message: `Checked in at ${checkedInTime}${
                  attendee.checkedInBy ? ` by ${attendee.checkedInBy}` : ""
                }.`,
              }
      )
    } catch {
      showOutcome({
        tone: "error",
        title: "Couldn't check in",
        message: "Check the connection and try again.",
      })
    } finally {
      isCheckingInRef.current = false
      setIsCheckingIn(false)
    }
  }

  // Uploads skip the repeat check, since choosing the same file again is
  // deliberate.
  const handleScan = (value: string, isUpload = false) => {
    const now = Date.now()

    if (
      isCheckingInRef.current ||
      (!isUpload &&
        value === lastScanRef.current.value &&
        now - lastScanRef.current.time < repeatScanDelayMs)
    ) {
      return
    }

    lastScanRef.current = { value, time: now }

    const request = parseTicketQrCode(value)

    if (!request) {
      showOutcome({
        tone: "error",
        title: "Not a VarCamp ticket",
        message: "This QR code isn't a VarCamp 2026 e-ticket.",
      })
      return
    }

    void checkIn(request)
  }

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    event.target.value = ""

    if (!file) {
      return
    }

    const value = await decodeQrImageFile(file).catch(() => null)

    if (!value) {
      showOutcome({
        tone: "error",
        title: "No QR code found",
        message:
          "Use the e-ticket image you downloaded, or a clear photo of its QR code.",
      })
      return
    }

    handleScan(value, true)
  }

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!query.trim()) {
      return
    }

    setIsSearching(true)

    try {
      const attendees = await searchAttendees(query.trim())

      if (attendees) {
        setSearchResults(attendees)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't search attendees."
      )
    } finally {
      setIsSearching(false)
    }
  }

  const signOut = async () => {
    await fetch("/api/attendee-check-in/session", { method: "DELETE" }).catch(
      () => null
    )
    router.refresh()
  }

  const scanPanel = (
    <div className="flex flex-col gap-3">
      <QrScanner onScan={handleScan} />
      <p className="text-center text-sm text-muted-foreground">
        {isCheckingIn ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Checking in...
          </span>
        ) : isStaff ? (
          "Hold the ticket's QR code inside the frame."
        ) : (
          "Hold your e-ticket's QR code up to the camera."
        )}
      </p>
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleUpload}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isCheckingIn}
        onClick={() => uploadInputRef.current?.click()}
      >
        <UploadIcon data-icon="inline-start" />
        Upload ticket image
      </Button>
    </div>
  )

  // Staff reach the sign-in form directly at /2026/attendee/check-in?staff;
  // it isn't linked from here.
  if (props.mode === "self") {
    return (
      <CheckInShell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1
              id="check-in-heading"
              className="text-2xl/7 font-bold tracking-tight"
            >
              Record your attendance
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Scan the QR code on your VarCamp 2026 e-ticket, or upload the
              ticket image you downloaded.
            </p>
          </div>

          {scanPanel}

          <div aria-live="polite">
            {outcome && (
              <OutcomeCard outcome={outcome} showContactDetails={false} />
            )}
          </div>
        </div>
      </CheckInShell>
    )
  }

  return (
    <CheckInShell
      actions={
        <Button type="button" variant="ghost" size="sm" onClick={signOut}>
          <LogOutIcon data-icon="inline-start" />
          Sign out
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <h1
              id="check-in-heading"
              className="text-2xl/7 font-bold tracking-tight"
            >
              Check-in
            </h1>
            <span className="truncate text-sm text-muted-foreground">
              {props.staffName}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {stats ? (
                <>
                  <span className="font-semibold text-foreground tabular-nums">
                    {stats.checkedIn}
                  </span>{" "}
                  of <span className="tabular-nums">{stats.total}</span>{" "}
                  attendees checked in
                </>
              ) : (
                "Loading attendees..."
              )}
            </p>
            <Progress
              value={
                stats && stats.total > 0
                  ? (stats.checkedIn / stats.total) * 100
                  : 0
              }
              aria-label="Attendees checked in"
            />
          </div>
        </div>

        <Tabs defaultValue="scan">
          <TabsList className="w-full">
            <TabsTrigger value="scan">
              <ScanLineIcon />
              Scan
            </TabsTrigger>
            <TabsTrigger value="search">
              <SearchIcon />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="mt-2">
            {scanPanel}
          </TabsContent>

          <TabsContent value="search" className="mt-2 flex flex-col gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                name="query"
                aria-label="Search attendees"
                placeholder="Name, email, or ticket number"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <SearchIcon data-icon="inline-start" />
                )}
                Search
              </Button>
            </form>

            {searchResults &&
              (searchResults.length > 0 ? (
                <ul className="flex flex-col divide-y divide-border rounded-xl ring-1 ring-border">
                  {searchResults.map((attendee) => (
                    <li
                      key={attendee.uuid}
                      className="flex items-center justify-between gap-3 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{attendee.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {attendee.ticketId} · {attendee.email}
                        </p>
                      </div>
                      {attendee.checkedInAt ? (
                        <Badge variant="outline" className="shrink-0">
                          In at {formatCheckInTime(attendee.checkedInAt)}
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className="shrink-0"
                          disabled={isCheckingIn}
                          onClick={() => void checkIn({ uuid: attendee.uuid })}
                        >
                          Check in
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No attendees match &ldquo;{query.trim()}&rdquo;.
                </p>
              ))}
          </TabsContent>
        </Tabs>

        <div aria-live="polite">
          {outcome && <OutcomeCard outcome={outcome} />}
        </div>
      </div>
    </CheckInShell>
  )
}

const toneStyles = {
  success: {
    card: "bg-primary/15 ring-primary/50",
    icon: "text-primary-foreground bg-primary",
    Icon: CircleCheckIcon,
  },
  warning: {
    card: "bg-amber-500/15 ring-amber-500/50",
    icon: "text-amber-950 bg-amber-400",
    Icon: TriangleAlertIcon,
  },
  error: {
    card: "bg-destructive/10 ring-destructive/50",
    icon: "text-white bg-destructive",
    Icon: CircleXIcon,
  },
} as const

function OutcomeCard({
  outcome,
  showContactDetails = true,
}: {
  outcome: Outcome
  showContactDetails?: boolean
}) {
  const { card, icon, Icon } = toneStyles[outcome.tone]
  const { attendee } = outcome

  return (
    <section
      aria-label="Last check-in"
      className={cn("flex gap-4 rounded-2xl p-4 ring-1", card)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          icon
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm font-semibold tracking-wide uppercase">
          {outcome.title}
        </p>
        {attendee && (
          <>
            <p className="text-xl/7 font-bold wrap-break-word">
              {attendee.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {showContactDetails
                ? [
                    attendee.ticketId,
                    attendee.email,
                    getCountryName(attendee.country),
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : attendee.ticketId}
            </p>
          </>
        )}
        {outcome.message && (
          <p className="text-sm leading-6">{outcome.message}</p>
        )}
      </div>
    </section>
  )
}
