import { create as createQrCode } from "qrcode"

import type { AttendeeTicket } from "./attendee-data"
// Imported rather than placed in public/ so it's served from /_next/, which
// the production Nginx config passes to Next.js. Other image paths are
// answered by WordOps's static-file rules and return 404.
import ticketTemplate from "./e-ticket-template.png"

const ticketTemplateUrl = ticketTemplate.src

// Positions below are measured on the 2376 × 782 px template. Another export
// of the same design works too; everything is scaled to its width.
const templateWidth = 2376
export const ticketAspectRatio = "2376 / 782"

const colors = {
  label: "#21222e",
  name: "#000000",
  ticketId: "#ddd5ec",
  qr: "#000000",
}

const layout = {
  // Centered in the light stub, between its heading and the QR code.
  attendee: {
    centerX: 1911,
    labelY: 226,
    labelSize: 24,
    nameY: 262,
    nameSize: 26,
    lineHeight: 30,
    maxWidth: 410,
  },
  // In the purple tab at the bottom left.
  ticketId: { x: 67, y: 719, size: 28 },
  // The white square in the stub.
  qr: { x: 1764, y: 304, size: 300, padding: 18 },
}

export function getQrPayload(ticket: AttendeeTicket) {
  return JSON.stringify({
    name: ticket.name,
    email: ticket.email,
    uuid: ticket.uuid,
  })
}

async function loadImage(source: string) {
  const image = new Image()

  image.src = source
  await image.decode()

  return image
}

// next/font gives Inter a generated family name, exposed as --font-inter.
function getFontFamily() {
  const inter = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-inter")
    .trim()

  return `${inter || "Inter"}, sans-serif`
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
) {
  const fits = (value: string) => context.measureText(value).width <= maxWidth
  const lines: string[] = []
  let line = ""

  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word

    if (fits(candidate)) {
      line = candidate
      continue
    }

    if (line) {
      lines.push(line)
    }

    // A single word wider than the space is broken between characters.
    let characters = Array.from(word)

    while (!fits(characters.join("")) && characters.length > 1) {
      let fitLength = characters.length - 1

      while (fitLength > 1 && !fits(characters.slice(0, fitLength).join(""))) {
        fitLength -= 1
      }

      lines.push(characters.slice(0, fitLength).join(""))
      characters = characters.slice(fitLength)
    }

    line = characters.join("")
  }

  if (line) {
    lines.push(line)
  }

  if (lines.length <= maxLines) {
    return lines
  }

  const keptLines = lines.slice(0, maxLines)
  let lastLine = Array.from(keptLines[maxLines - 1] ?? "")

  while (lastLine.length > 0 && !fits(`${lastLine.join("")}…`)) {
    lastLine = lastLine.slice(0, -1)
  }

  keptLines[maxLines - 1] = `${lastLine.join("").trimEnd()}…`

  return keptLines
}

// Draws the QR modules into a square of the given size, in canvas pixels.
function drawQrCode(
  context: CanvasRenderingContext2D,
  text: string,
  originX: number,
  originY: number,
  size: number
) {
  const { modules } = createQrCode(text, { errorCorrectionLevel: "M" })
  const moduleSize = size / modules.size
  // Module edges land on whole pixels so the code stays sharp for scanners.
  const edge = (origin: number, index: number) =>
    Math.round(origin + index * moduleSize)

  context.fillStyle = colors.qr

  for (let row = 0; row < modules.size; row += 1) {
    for (let column = 0; column < modules.size; column += 1) {
      if (!modules.get(row, column)) {
        continue
      }

      const left = edge(originX, column)
      const top = edge(originY, row)

      context.fillRect(
        left,
        top,
        edge(originX, column + 1) - left,
        edge(originY, row + 1) - top
      )
    }
  }
}

export async function drawTicket(
  canvas: HTMLCanvasElement,
  ticket: AttendeeTicket
) {
  const fontFamily = getFontFamily()
  const [template] = await Promise.all([
    loadImage(ticketTemplateUrl),
    document.fonts.load(`400 12px ${fontFamily}`),
    document.fonts.load(`700 12px ${fontFamily}`),
  ])
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Canvas is not supported.")
  }

  const scale = template.naturalWidth / templateWidth

  canvas.width = template.naturalWidth
  canvas.height = template.naturalHeight
  context.drawImage(template, 0, 0)

  const { qr } = layout

  drawQrCode(
    context,
    getQrPayload(ticket),
    (qr.x + qr.padding) * scale,
    (qr.y + qr.padding) * scale,
    (qr.size - qr.padding * 2) * scale
  )

  context.scale(scale, scale)
  context.textBaseline = "alphabetic"

  const { attendee, ticketId } = layout

  context.font = `700 ${attendee.nameSize}px ${fontFamily}`

  const nameLines = wrapText(context, ticket.name, attendee.maxWidth, 2)
  // A two-line name moves the block up so it stays clear of the QR code.
  const blockOffset = ((nameLines.length - 1) * attendee.lineHeight) / 2

  context.textAlign = "center"
  context.fillStyle = colors.name
  nameLines.forEach((line, index) => {
    context.fillText(
      line,
      attendee.centerX,
      attendee.nameY - blockOffset + index * attendee.lineHeight
    )
  })
  context.fillStyle = colors.label
  context.font = `400 ${attendee.labelSize}px ${fontFamily}`
  context.fillText(
    "Attendee Name",
    attendee.centerX,
    attendee.labelY - blockOffset
  )

  context.textAlign = "left"
  context.fillStyle = colors.ticketId
  context.font = `400 ${ticketId.size}px ${fontFamily}`
  context.fillText(ticket.ticketId, ticketId.x, ticketId.y)
}

// A large QR code on its own, for scanning straight from a phone screen.
export function drawCheckInQrCode(
  canvas: HTMLCanvasElement,
  ticket: AttendeeTicket,
  displaySize: number
) {
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Canvas is not supported.")
  }

  const size = Math.ceil(displaySize * window.devicePixelRatio)
  const quietZone = Math.round(size * 0.06)

  canvas.width = size
  canvas.height = size
  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, size, size)
  drawQrCode(
    context,
    getQrPayload(ticket),
    quietZone,
    quietZone,
    size - quietZone * 2
  )
}
