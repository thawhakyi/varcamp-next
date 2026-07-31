"use client"

import { motion, useReducedMotion } from "framer-motion"
import { PartyPopperIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

const confettiPieces = [
  {
    x: -32,
    y: -22,
    rotate: -28,
    delay: 0.03,
    className: "h-2.5 w-1 bg-chart-1",
  },
  {
    x: -18,
    y: -36,
    rotate: 18,
    delay: 0.08,
    className: "size-1.5 rounded-full bg-chart-2",
  },
  { x: 2, y: -40, rotate: 42, delay: 0.02, className: "h-2 w-1 bg-chart-3" },
  { x: 25, y: -31, rotate: 68, delay: 0.11, className: "size-1.5 bg-chart-4" },
  {
    x: 37,
    y: -12,
    rotate: 112,
    delay: 0.06,
    className: "h-2.5 w-1 bg-chart-5",
  },
  {
    x: 34,
    y: 15,
    rotate: 148,
    delay: 0.14,
    className: "size-1.5 rounded-full bg-chart-2",
  },
  { x: 18, y: 33, rotate: 196, delay: 0.09, className: "h-2 w-1 bg-chart-4" },
  { x: -9, y: 38, rotate: 224, delay: 0.04, className: "size-1.5 bg-chart-1" },
  {
    x: -30,
    y: 27,
    rotate: 256,
    delay: 0.12,
    className: "h-2.5 w-1 bg-chart-3",
  },
  {
    x: -39,
    y: 4,
    rotate: 302,
    delay: 0.07,
    className: "size-1.5 rounded-full bg-chart-5",
  },
] as const

export function SuccessConfetti() {
  const shouldReduceMotion = useReducedMotion()
  const isStatic = shouldReduceMotion === true

  return (
    <div
      aria-hidden="true"
      className="relative flex size-20 items-center justify-center"
    >
      {confettiPieces.map((piece) => (
        <span
          key={`${piece.x}-${piece.y}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.span
            className={cn("block origin-center", piece.className)}
            initial={
              isStatic
                ? false
                : { x: -3, y: 3, rotate: 0, scale: 0.45, opacity: 0.2 }
            }
            animate={{
              x: piece.x,
              y: piece.y,
              rotate: piece.rotate,
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: isStatic ? 0 : 0.65,
              delay: isStatic ? 0 : piece.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </span>
      ))}

      <motion.div
        className="relative z-1 flex size-14 items-center justify-center bg-primary text-primary-foreground"
        initial={isStatic ? false : { rotate: -10, scale: 0.82 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{
          duration: isStatic ? 0 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <PartyPopperIcon className="size-7" />
      </motion.div>
    </div>
  )
}
