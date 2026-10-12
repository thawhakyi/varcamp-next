import type { ReactNode } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { VarCampLogoHorizontal } from "@workspace/ui/components/varcamp-logo"

import { BorderDecorations } from "./border-decorations"

type RegistrationStatusProps = {
  badge: string
  heading: string
  description: string
  asideHeading: string
  asideDescription: string
  footer: ReactNode
}

export function RegistrationStatus({
  badge,
  heading,
  description,
  asideHeading,
  asideDescription,
  footer,
}: RegistrationStatusProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden bg-muted/10 px-6 py-16 sm:px-10">
      <section
        aria-labelledby="registration-status-heading"
        className="relative w-full max-w-4xl bg-card px-6 py-7 ring-1 ring-border/60 sm:px-10 sm:py-9 lg:px-12 lg:py-10"
      >
        <BorderDecorations />

        <header className="flex items-center justify-between gap-4">
          <VarCampLogoHorizontal
            className="h-7 w-auto text-foreground"
            title="VarCamp"
          />
          <Badge variant="secondary" className="bg-primary text-neutral-900">
            {badge}
          </Badge>
        </header>

        <Separator className="my-7 sm:my-9" />

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] md:gap-10">
          <div className="flex flex-col items-start justify-center gap-6">
            <div className="flex max-w-xl flex-col gap-4">
              <h1
                id="registration-status-heading"
                className="text-2xl/7 font-bold tracking-tight sm:text-3xl"
              >
                {heading}
              </h1>
              <p className="max-w-lg text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
                {description}
              </p>
            </div>
          </div>

          <aside
            aria-labelledby="registration-status-aside-heading"
            className="flex flex-col gap-6 border-t border-border pt-7 md:border-t-0 md:border-l md:pt-1 md:pl-10"
          >
            <div className="flex flex-col gap-2">
              <h2
                id="registration-status-aside-heading"
                className="text-base font-semibold"
              >
                {asideHeading}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {asideDescription}
              </p>
            </div>

            <Separator />

            <div className="text-sm font-medium text-foreground sm:text-base">
              {footer}
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
