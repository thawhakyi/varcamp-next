import type { Metadata } from "next"

import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { VarCampLogoHorizontal } from "@workspace/ui/components/varcamp-logo"

import { BorderDecorations } from "../_components/border-decorations"
import { SuccessConfetti } from "../_components/success-confetti"

export const metadata: Metadata = {
  title: "Registration Received | VarCamp 2026",
  description: "Your VarCamp 2026 organizer registration has been received.",
}

export default function OrganizerRegistrationSuccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden bg-muted/10 px-6 py-16 sm:px-10">
      <section
        aria-labelledby="registration-success-heading"
        className="relative w-full max-w-4xl bg-card px-6 py-7 ring-1 ring-border/60 sm:px-10 sm:py-9 lg:px-12 lg:py-10"
      >
        <BorderDecorations />

        <header className="flex items-center justify-between gap-4">
          <VarCampLogoHorizontal
            className="h-7 w-auto text-foreground"
            title="VarCamp"
          />
          <Badge variant="secondary" className="bg-primary text-foreground">
            Submission completed
          </Badge>
        </header>

        <Separator className="my-7 sm:my-9" />

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] md:gap-10">
          <div className="flex flex-col items-start justify-center gap-6">
            <div className="flex max-w-xl flex-col gap-4">
              <h1
                id="registration-success-heading"
                className="text-2xl/7 font-bold tracking-tight sm:text-3xl"
              >
                Registration received
              </h1>
              <p className="max-w-lg text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
                Thank you for registering as an organizer with VarCamp 2026.
              </p>
            </div>
          </div>

          <aside
            aria-labelledby="next-steps-heading"
            className="flex flex-col gap-6 border-t border-border pt-7 md:border-t-0 md:border-l md:pt-1 md:pl-10"
          >
            <div className="flex flex-col gap-2">
              <h2 id="next-steps-heading" className="text-base font-semibold">
                What happens next
              </h2>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                We will review your registration and contact you later with the
                next steps.
              </p>
            </div>

            <Separator />

            <p className="text-sm font-medium text-foreground sm:text-base">
              You can now close this page.
            </p>
          </aside>
        </div>
      </section>
    </main>
  )
}
