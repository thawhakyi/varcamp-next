import { create as createQrCode } from "qrcode"

import type { AttendeeTicket } from "./attendee-data"
// Imported rather than placed in public/ so it's served from /_next/, which
// the production Nginx config passes to Next.js. Other image paths are
// answered by WordOps's static-file rules and return 404.
import ticketTemplate from "./e-ticket-template.png"

const ticketTemplateUrl = ticketTemplate.src

// Positions below are measured on the 2316 × 722 px template. Another export
// of the same design works too; everything is scaled to its width.
const templateWidth = 2316
export const ticketAspectRatio = "2316 / 722"

const colors = {
  name: "#000000",
  ticketId: "#ddd5ec",
  qr: "#000000",
  qrBackground: "#ffffff",
}

const layout = {
  // Centered under the template's "Attendee Name" label, above the QR code.
  attendee: {
    centerX: 1908,
    nameY: 234,
    nameSize: 30,
    lineHeight: 32,
    // How far a two-line name moves up, keeping clear of both the label and
    // the QR code.
    twoLineShift: 10,
    maxWidth: 420,
  },
  // In the purple tab at the bottom left.
  ticketId: { x: 56, y: 699, size: 28 },
  // The gray placeholder inside the green corner marks; it's painted white
  // first so the code has full contrast.
  qr: { x: 1776, y: 316, size: 244, padding: 10 },
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

  context.fillStyle = colors.qrBackground
  context.fillRect(qr.x * scale, qr.y * scale, qr.size * scale, qr.size * scale)
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

  const blockOffset = (nameLines.length - 1) * attendee.twoLineShift

  context.textAlign = "center"
  context.fillStyle = colors.name
  nameLines.forEach((line, index) => {
    context.fillText(
      line,
      attendee.centerX,
      attendee.nameY - blockOffset + index * attendee.lineHeight
    )
  })

  context.textAlign = "left"
  context.fillStyle = colors.ticketId
  context.font = `400 ${ticketId.size}px ${fontFamily}`
  context.fillText(ticket.ticketId, ticketId.x, ticketId.y)
}
