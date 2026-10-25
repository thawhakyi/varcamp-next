import { CheckInShell } from "./check-in-shell"

// Shown in Myanmar time, where the event is held.
const eventTimeZone = "Asia/Yangon"

function formatOpeningTime(opensAt: Date) {
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: eventTimeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(opensAt)
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: eventTimeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(opensAt)

  return `${date} at ${time} Myanmar time (UTC+6:30)`
}

type CheckInClosedProps = {
  opensAt: Date
}

export function CheckInClosed({ opensAt }: CheckInClosedProps) {
  return (
    <CheckInShell>
      <div className="flex flex-col gap-2">
        <h1
          id="check-in-heading"
          className="text-2xl/7 font-bold tracking-tight"
        >
          Check-in isn&apos;t open yet
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Check-in opens on {formatOpeningTime(opensAt)}. On event day, come
          back through the Check-in Counter at play.var.camp.
        </p>
      </div>
    </CheckInShell>
  )
}
