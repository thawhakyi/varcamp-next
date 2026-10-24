"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

// The full policies live on the VarCamp 2026 website.
export const policySiteUrl = "https://varcamp2026.vercel.app"

const hoverOpenDelay = 150
const hoverCloseDelay = 200

export function EmailLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="font-medium text-foreground underline underline-offset-4"
    >
      {email}
    </a>
  )
}

export function PolicyPageLink({
  children,
  path,
}: {
  children: ReactNode
  path: string
}) {
  return (
    <a
      href={`${policySiteUrl}${path}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-foreground underline underline-offset-4"
    >
      {children}
    </a>
  )
}

type PolicyLinkProps = {
  children: ReactNode
  label: string
}

// Opens on hover for a quick read, and stays open after a click so the full
// text can be scrolled and its links reached by keyboard.
export function PolicyLink({ children, label }: PolicyLinkProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(hoverTimer.current), [])

  const scheduleHoverChange = (open: boolean, pointerType: string) => {
    if (pointerType !== "mouse" || isPinned) {
      return
    }

    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(
      () => setIsOpen(open),
      open ? hoverOpenDelay : hoverCloseDelay
    )
  }

  const hoverHandlers = {
    onPointerEnter: (event: { pointerType: string }) =>
      scheduleHoverChange(true, event.pointerType),
    onPointerLeave: (event: { pointerType: string }) =>
      scheduleHoverChange(false, event.pointerType),
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        clearTimeout(hoverTimer.current)
        setIsOpen(open)
        setIsPinned(open)
      }}
    >
      <PopoverTrigger
        type="button"
        className="font-medium text-foreground underline underline-offset-4 hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        {...hoverHandlers}
        onClick={(event) => {
          // A click while the hover preview is showing keeps it open.
          if (isOpen && !isPinned) {
            event.preventDefault()
            clearTimeout(hoverTimer.current)
            setIsPinned(true)
          }
        }}
      >
        {label}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="max-h-[min(32rem,var(--radix-popover-content-available-height))] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto"
        onOpenAutoFocus={(event) => {
          if (!isPinned) {
            event.preventDefault()
          }
        }}
        {...hoverHandlers}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
