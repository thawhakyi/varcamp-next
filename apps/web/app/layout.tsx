import { Geist, Inter, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

// Inter has no Myanmar glyphs. This font covers Myanmar text only; the
// unicode-range keeps it from loading on pages without Myanmar characters.
const myanmar = localFont({
  src: "./fonts/masterpiece-uni-round.woff2",
  weight: "400",
  variable: "--font-myanmar",
  adjustFontFallback: false,
  declarations: [
    { prop: "unicode-range", value: "U+1000-109F, U+A9E0-A9FF, U+AA60-AA7F" },
  ],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        geist.variable,
        "font-sans",
        inter.variable,
        myanmar.variable,
        geistMono.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
