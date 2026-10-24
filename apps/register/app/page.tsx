import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui/components/item"
import { Separator } from "@workspace/ui/components/separator"
import { VarCampLogoHorizontal } from "@workspace/ui/components/varcamp-logo"
import { cn } from "@workspace/ui/lib/utils"

import { attendeeRegistrationOpen } from "@/app/2026/attendee/_components/attendee-data"
import { BorderDecorations } from "@/app/_components/border-decorations"
import { mainWebsiteUrl } from "@/app/_components/registration-status"

export const metadata: Metadata = {
  title: "Registration | VarCamp 2026",
  description:
    "Register as an attendee, speaker, community, volunteer, or organizer for VarCamp 2026.",
}

type RegistrationStatus = "open" | "soon" | "closed"

const registrations = [
  {
    title: "Attendee",
    description: "Join the sessions at VarCamp 2026.",
    href: "/2026/attendee",
    status: attendeeRegistrationOpen ? "open" : "soon",
  },
  {
    title: "Speaker",
    description: "Share a session with the VarCamp community.",
    href: "/2026/speaker",
    status: "open",
  },
  {
    title: "Community",
    description: "Take part as a community or organization.",
    href: "/2026/community",
    status: "open",
  },
  {
    title: "Volunteer",
    description: "Help run VarCamp on the day.",
    href: "/2026/volunteer",
    status: "soon",
  },
  {
    title: "Organizer",
    description: "Join the team that plans VarCamp.",
    href: "/2026/organizer",
    status: "closed",
  },
] as const satisfies readonly {
  title: string
  description: string
  href: string
  status: RegistrationStatus
}[]

const statusLabels: Record<RegistrationStatus, string> = {
  open: "Open",
  soon: "Coming soon",
  closed: "Closed",
}

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden bg-muted/10 px-6 py-16 sm:px-10">
      <section
        aria-labelledby="home-heading"
        className="relative w-full max-w-4xl bg-card px-6 py-7 ring-1 ring-border/60 sm:px-10 sm:py-9 lg:px-12 lg:py-10"
      >
        <BorderDecorations />

        <header className="flex items-center justify-between gap-4">
          <VarCampLogoHorizontal
            className="h-7 w-auto text-foreground"
            title="VarCamp"
          />
          <Button asChild variant="ghost" size="sm">
            <a href={mainWebsiteUrl}>
              var.camp
              <ArrowUpRightIcon data-icon="inline-end" />
            </a>
          </Button>
        </header>

        <Separator className="my-7 sm:my-9" />

        <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10">
          <div className="flex max-w-md flex-col gap-4">
            <h1
              id="home-heading"
              className="text-2xl/7 font-bold tracking-tight sm:text-3xl"
            >
              VarCamp 2026 registration
            </h1>
            <p className="text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
              Choose how you&apos;d like to take part.
            </p>
          </div>

          <nav aria-label="Registrations">
            <ItemGroup className="gap-2">
              {registrations.map((registration) => (
                <Item key={registration.href} asChild variant="outline">
                  <Link href={registration.href}>
                    <ItemContent>
                      <ItemTitle>{registration.title}</ItemTitle>
                      <ItemDescription>
                        {registration.description}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Badge
                        variant={
                          registration.status === "open"
                            ? "secondary"
                            : "outline"
                        }
                        className={cn(
                          registration.status === "open"
                            ? "bg-primary text-neutral-900"
                            : "text-muted-foreground"
                        )}
                      >
                        {statusLabels[registration.status]}
                      </Badge>
                      <ChevronRightIcon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                    </ItemActions>
                  </Link>
                </Item>
              ))}
            </ItemGroup>
          </nav>
        </div>
      </section>
    </main>
  )
}
