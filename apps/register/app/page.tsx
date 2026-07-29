import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          Welcome to VarCamp
        </h1>
        <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out delay-150 fill-mode-both">
          Join our community of volunteers and make a difference.
        </p>
        <div className="pt-8 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out delay-300 fill-mode-both">
          <Link
            href="/volunteer"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring gap-2 group"
          >
            Become a Volunteer
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
