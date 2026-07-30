import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background p-4 sm:p-8">
      <div className="max-w-3xl space-y-6 text-center">
        <h1 className="animate-in text-5xl font-bold tracking-tight text-foreground duration-700 ease-out fade-in slide-in-from-bottom-4 sm:text-6xl">
          Welcome to VarCamp
        </h1>
        <p className="animate-in text-xl text-muted-foreground delay-150 duration-700 ease-out fill-mode-both slide-in-from-bottom-5 fade-in">
          Join our community of volunteers and make a difference.
        </p>
        <div className="animate-in pt-8 delay-300 duration-700 ease-out fill-mode-both fade-in slide-in-from-bottom-6">
          <Link
            href="/2026/volunteer"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            Become a Volunteer
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
