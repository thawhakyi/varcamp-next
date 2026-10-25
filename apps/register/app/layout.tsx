import { Geist, Geist_Mono, Inter } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { Toaster } from "@workspace/ui/components/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

// Toasts use the app font and solid brand colors. Neutral toasts invert the
// page colors, and errors keep the same red in both themes so white text
// stays readable.
const toasterStyle = {
  fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  "--border-radius": "var(--radius)",
  "--normal-bg": "var(--foreground)",
  "--normal-text": "var(--background)",
  "--normal-border": "var(--foreground)",
  "--info-bg": "var(--foreground)",
  "--info-text": "var(--background)",
  "--info-border": "var(--foreground)",
  "--success-bg": "var(--primary)",
  "--success-text": "oklch(0.205 0 0)",
  "--success-border": "var(--primary)",
  "--warning-bg": "oklch(0.828 0.189 84.429)",
  "--warning-text": "oklch(0.279 0.077 45.635)",
  "--warning-border": "oklch(0.828 0.189 84.429)",
  "--error-bg": "oklch(0.577 0.245 27.325)",
  "--error-text": "oklch(0.985 0 0)",
  "--error-border": "oklch(0.577 0.245 27.325)",
} as React.CSSProperties

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
        geistMono.variable
      )}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-center"
            richColors
            style={toasterStyle}
            toastOptions={{
              classNames: {
                toast: "cn-toast text-sm! shadow-lg!",
                description: "text-current! opacity-90",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
