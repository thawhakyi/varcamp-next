import type { Metadata } from "next"
import { CircleCheckBigIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"

import { BorderDecorations } from "../_components/border-decorations"

export const metadata: Metadata = {
  title: "Registration Received | VarCamp 2026",
  description: "Your VarCamp 2026 volunteer registration has been received.",
}

export default function VolunteerRegistrationSuccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden px-6 py-16 sm:px-10">
      <section
        aria-labelledby="registration-success-heading"
        className="relative w-full max-w-3xl bg-muted/20 px-6 py-12 sm:px-12 sm:py-16"
      >
        <BorderDecorations />

        <div className="mx-auto flex max-w-xl flex-col items-center gap-7 text-center">
          <div className="flex size-14 items-center justify-center bg-primary text-primary-foreground">
            <CircleCheckBigIcon aria-hidden="true" className="size-7" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <Badge variant="secondary">Submission complete</Badge>
            <h1
              id="registration-success-heading"
              className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              Registration received
            </h1>
            <p className="max-w-lg text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
              Thank you for volunteering with VarCamp 2026. The organizing team
              will review your registration and contact you later with the next
              steps.
            </p>
          </div>

          <Separator />

          <p className="font-medium text-foreground">
            You can now safely close this page.
          </p>
        </div>
      </section>
    </main>
  )
}
