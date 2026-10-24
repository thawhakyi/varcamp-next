import type { ReactNode } from "react"

import { Separator } from "@workspace/ui/components/separator"
import { VarCampLogoHorizontal } from "@workspace/ui/components/varcamp-logo"

import { BorderDecorations } from "@/app/_components/border-decorations"

type CheckInShellProps = {
  actions?: ReactNode
  children: ReactNode
}

export function CheckInShell({ actions, children }: CheckInShellProps) {
  return (
    <main className="flex min-h-dvh justify-center bg-muted/10 px-4 py-6 sm:items-center sm:px-10 sm:py-16">
      <section
        aria-labelledby="check-in-heading"
        className="relative w-full max-w-xl self-start bg-card px-5 py-6 ring-1 ring-border/60 sm:self-center sm:px-8 sm:py-8"
      >
        <BorderDecorations />

        <header className="flex min-h-9 items-center justify-between gap-4">
          <VarCampLogoHorizontal
            className="h-6 w-auto text-foreground"
            title="VarCamp"
          />
          {actions}
        </header>

        <Separator className="my-6" />

        {children}
      </section>
    </main>
  )
}
