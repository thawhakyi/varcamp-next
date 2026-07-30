export function BorderDecorations() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-6 -left-px w-px bg-border"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-6 -right-px w-px bg-border"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -top-px h-px bg-border"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -bottom-px h-px bg-border"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-1 size-5 shrink-0 -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] stroke-muted-foreground stroke-1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 z-1 size-5 shrink-0 translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] stroke-muted-foreground stroke-1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </>
  )
}
