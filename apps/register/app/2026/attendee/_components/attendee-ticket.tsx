"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, DownloadIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { VarCampLogoHorizontal } from "@workspace/ui/components/varcamp-logo"
import { cn } from "@workspace/ui/lib/utils"

import { BorderDecorations } from "@/app/_components/border-decorations"

import {
  type AttendeeTicket,
  ticketIdPattern,
  ticketStorageKey,
} from "./attendee-data"
import {
  drawCheckInQrCode,
  drawTicket,
  ticketAspectRatio,
} from "./ticket-canvas"

// In CSS pixels; matches size-56 below.
const checkInQrSize = 224

// The server can't see session storage, so it renders a placeholder first.
const pendingSnapshot = "pending"

const subscribeToStorage = () => () => {}

const readStoredTicket = () => {
  try {
    return sessionStorage.getItem(ticketStorageKey)
  } catch {
    return null
  }
}

function parseTicket(storedTicket: string | null): AttendeeTicket | null {
  if (!storedTicket) {
    return null
  }

  try {
    const ticket = JSON.parse(storedTicket) as Partial<AttendeeTicket>

    return typeof ticket.ticketId === "string" &&
      ticketIdPattern.test(ticket.ticketId) &&
      typeof ticket.uuid === "string" &&
      typeof ticket.name === "string" &&
      typeof ticket.email === "string"
      ? {
          ticketId: ticket.ticketId,
          uuid: ticket.uuid,
          name: ticket.name,
          email: ticket.email,
        }
      : null
  } catch {
    return null
  }
}

export function AttendeeTicketView() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [drawStatus, setDrawStatus] = useState<"drawing" | "ready" | "error">(
    "drawing"
  )
  const storedTicket = useSyncExternalStore(
    subscribeToStorage,
    readStoredTicket,
    () => pendingSnapshot
  )
  const ticket = useMemo(
    () =>
      storedTicket === pendingSnapshot ? undefined : parseTicket(storedTicket),
    [storedTicket]
  )

  useEffect(() => {
    if (ticket === null) {
      router.replace("/2026/attendee")
    }
  }, [router, ticket])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!ticket || !canvas) {
      return
    }

    let isCurrent = true

    if (qrCanvasRef.current) {
      try {
        drawCheckInQrCode(qrCanvasRef.current, ticket, checkInQrSize)
      } catch (error) {
        console.error("Unable to draw the check-in QR code:", error)
      }
    }

    drawTicket(canvas, ticket)
      .then(() => {
        if (isCurrent) {
          setDrawStatus("ready")
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to draw the e-ticket:", error)

        if (isCurrent) {
          setDrawStatus("error")
        }
      })

    return () => {
      isCurrent = false
    }
  }, [ticket])

  const downloadTicket = () => {
    const canvas = canvasRef.current

    if (!ticket || !canvas) {
      return
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error(
          "We couldn't save the image. Take a screenshot of your ticket instead."
        )
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `VarCamp-2026-${ticket.ticketId}.png`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, "image/png")
  }

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden bg-muted/10 px-4 py-10 sm:px-10 sm:py-16">
      <section
        aria-labelledby="ticket-heading"
        className="relative w-full max-w-5xl bg-card px-5 py-7 ring-1 ring-border/60 sm:px-10 sm:py-9 lg:px-12 lg:py-10"
      >
        <BorderDecorations />

        <header className="flex items-center justify-between gap-4">
          <VarCampLogoHorizontal
            className="h-7 w-auto text-foreground"
            title="VarCamp"
          />
          <Badge variant="secondary" className="bg-primary text-neutral-900">
            Registration confirmed
          </Badge>
        </header>

        <Separator className="my-7 sm:my-9" />

        <div className="flex max-w-2xl flex-col gap-3">
          <h1
            id="ticket-heading"
            className="text-2xl/7 font-bold tracking-tight sm:text-3xl"
          >
            Here&apos;s your e-ticket
          </h1>
          <p className="text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
            Download it and keep it handy. You&apos;ll need it to check in on
            event day.
          </p>
        </div>

        <div className="mt-7 sm:mt-9">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={
              ticket
                ? `VarCamp 2026 e-ticket for ${ticket.name}, ticket ID ${ticket.ticketId}`
                : undefined
            }
            className={cn(
              "block h-auto w-full",
              drawStatus !== "ready" && "hidden"
            )}
          />
          {drawStatus === "drawing" && (
            <Skeleton
              className="w-full rounded-2xl"
              style={{ aspectRatio: ticketAspectRatio }}
            />
          )}
          {drawStatus === "error" && (
            <p
              role="alert"
              className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground"
            >
              We couldn&apos;t display your ticket image. Your registration is
              saved; please note your ticket ID below and refresh to try again.
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              size="lg"
              onClick={downloadTicket}
              disabled={drawStatus !== "ready"}
              className="w-full shadow-lg shadow-primary/20 sm:w-auto"
            >
              <DownloadIcon data-icon="inline-start" />
              Download ticket
            </Button>
          </div>
        </div>

        {/* The QR code on the ticket is too small to scan from a phone
            screen, so phones also get a large copy. */}
        {ticket && (
          <figure className="mt-6 flex flex-col items-center gap-2 rounded-2xl bg-white p-4 sm:hidden">
            <canvas
              ref={qrCanvasRef}
              role="img"
              aria-label="Check-in QR code"
              className="size-56"
            />
            <figcaption className="text-sm font-medium text-neutral-700">
              Show this QR code at check-in
            </figcaption>
          </figure>
        )}

        {ticket && (
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <TicketDetail label="Ticket ID" value={ticket.ticketId} />
            <TicketDetail label="Attendee Name" value={ticket.name} />
            <TicketDetail label="Email" value={ticket.email} />
          </dl>
        )}

        <CheckInGuide />

        <Separator className="my-7 sm:my-9" />

        <div className="flex justify-end">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link
              href={
                ticket
                  ? `/2026/attendee/success?id=${encodeURIComponent(ticket.ticketId)}`
                  : "/2026/attendee/success"
              }
            >
              Done
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function TicketDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium text-foreground">{value}</dd>
    </div>
  )
}

// The check-in page is opened from inside the event space, so it isn't
// linked here.
const checkInSteps = [
  <>
    Go to <strong className="font-medium text-foreground">play.var.camp</strong>{" "}
    to enter the event.
  </>,
  <>
    Find the{" "}
    <strong className="font-medium text-foreground">Check-in Counter</strong> in
    the event space.
  </>,
  <>
    Click the <strong className="font-medium text-foreground">Check In</strong>{" "}
    button there.
  </>,
  <>
    When the check-in page opens, scan the QR code on your ticket or upload this
    ticket image.
  </>,
]

function CheckInGuide() {
  return (
    <section
      aria-labelledby="check-in-guide-heading"
      className="mt-7 flex flex-col gap-4 rounded-2xl bg-muted/20 p-5 ring-1 ring-border sm:mt-9 sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id="check-in-guide-heading" className="text-base font-semibold">
          How to check in on event day
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Check-in opens on 15 Nov 2026 at 8:30 AM Myanmar time (UTC+6:30).
          Download your ticket now so it&apos;s ready.
        </p>
      </div>
      <ol className="flex flex-col gap-3">
        {checkInSteps.map((step, index) => (
          <li
            key={index}
            className="flex gap-3 text-sm leading-6 text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-neutral-900"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
