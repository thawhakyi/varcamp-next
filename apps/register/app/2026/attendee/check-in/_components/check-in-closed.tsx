import { CheckInShell } from "./check-in-shell"

// Shown in Myanmar time, where the event is held.
const eventTimeZone = "Asia/Yangon"

function formatEventTime(time: Date) {
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: eventTimeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(time)
  const clock = new Intl.DateTimeFormat("en-US", {
    timeZone: eventTimeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(time)

  return `${date} at ${clock} Myanmar time (UTC+6:30)`
}

type CheckInClosedProps =
  { state: "not-open"; opensAt: Date } | { state: "closed"; closedAt: Date }

export function CheckInClosed(props: CheckInClosedProps) {
  return (
    <CheckInShell>
      <div className="flex flex-col gap-2">
        <h1
          id="check-in-heading"
          className="text-2xl/7 font-bold tracking-tight"
        >
          {props.state === "not-open"
            ? "Check-in isn't open yet"
            : "Check-in has closed"}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {props.state === "not-open"
            ? `Check-in opens on ${formatEventTime(props.opensAt)}. On event day, come back through the Check-in Counter at play.var.camp.`
            : `Check-in closed on ${formatEventTime(props.closedAt)}. Thanks for joining VarCamp 2026!`}
        </p>
      </div>
    </CheckInShell>
  )
}
