"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/reui/field"
import { Spinner } from "@workspace/ui/components/spinner"

import { staffNameMaxLength } from "./check-in-data"
import { CheckInShell } from "./check-in-shell"

type CheckInSignInProps = {
  isConfigured: boolean
}

export function CheckInSignIn({ isConfigured }: CheckInSignInProps) {
  const router = useRouter()
  const [staffName, setStaffName] = useState("")
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSigningIn(true)

    try {
      const response = await fetch("/api/attendee-check-in/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffName, passcode }),
      })
      const responseBody = (await response.json().catch(() => null)) as {
        message?: string
      } | null

      if (!response.ok) {
        setError(responseBody?.message || "Couldn't sign in. Try again.")
        return
      }

      router.refresh()
    } catch {
      setError("Couldn't sign in. Check your connection and try again.")
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <CheckInShell>
      <div className="mb-6 flex flex-col gap-2">
        <h1
          id="check-in-heading"
          className="text-2xl/7 font-bold tracking-tight"
        >
          Attendee check-in
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {isConfigured
            ? "For VarCamp staff. Sign in with the passcode from the organizers."
            : "Check-in isn't set up yet. Ask an organizer to add the check-in passcode."}
        </p>
      </div>

      {isConfigured && (
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="staffName">Your name</FieldLabel>
              <FieldDescription>
                Saved with each check-in you make.
              </FieldDescription>
              <Input
                id="staffName"
                name="staffName"
                autoComplete="name"
                value={staffName}
                maxLength={staffNameMaxLength}
                onChange={(event) => setStaffName(event.target.value)}
                required
              />
            </Field>
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="passcode">Passcode</FieldLabel>
              <Input
                id="passcode"
                name="passcode"
                type="password"
                autoComplete="current-password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "signIn-error" : undefined}
              />
              <FieldError id="signIn-error">{error}</FieldError>
            </Field>
            <Button
              type="submit"
              size="lg"
              disabled={isSigningIn}
              className="w-full"
            >
              {isSigningIn && <Spinner data-icon="inline-start" />}
              {isSigningIn ? "Signing in..." : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      )}
    </CheckInShell>
  )
}
