"use client"

import { type FormEvent, type KeyboardEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Stepper } from "@workspace/ui/components/reui/stepper"

import {
  attendeeRegistrationSchema,
  type RegistrationFieldErrors,
  registrationSections,
} from "@/lib/attendee-registration-schema"

import {
  type AboutYou,
  type AttendeeTicket,
  type Interests,
  ticketStorageKey,
} from "./attendee-data"
import { RegistrationPanel } from "./registration-panel"
import { RegistrationSidebar } from "./registration-sidebar"

const initialAboutYou: AboutYou = {
  fullName: "",
  email: "",
  livesInMyanmar: "",
  country: "",
}

const initialInterests: Interests = {
  topics: [],
  otherTopics: "",
  agreement: false,
  newsletter: false,
}

const submissionErrorMessage =
  "We couldn't submit your registration. Check your connection and try again."

export function AttendeeRegistration() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const [activeStep, setActiveStep] = useState(1)
  const [mobileStepPicker, setMobileStepPicker] = useState("")
  const [aboutYou, setAboutYou] = useState<AboutYou>(initialAboutYou)
  const [interests, setInterests] = useState<Interests>(initialInterests)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({})

  const clearFieldErrors = (...paths: string[]) => {
    setFieldErrors((current) => {
      const nextErrors = { ...current }

      for (const path of paths) {
        delete nextErrors[path]
      }

      return nextErrors
    })
  }

  const validateRegistration = () => {
    const validation = attendeeRegistrationSchema.safeParse({
      aboutYou,
      interests,
    })
    const errors: RegistrationFieldErrors = {}

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const path = issue.path.map(String).join(".")

        if (!(path in errors)) {
          errors[path] = issue.message
        }
      }
    }

    return { data: validation.data, errors }
  }

  const changeStep = (step: number) => {
    setActiveStep(step)
  }

  const continueToNextStep = () => {
    const section = registrationSections[activeStep - 1]
    const sectionErrors = Object.fromEntries(
      Object.entries(validateRegistration().errors).filter(([path]) =>
        path.startsWith(`${section}.`)
      )
    )

    setFieldErrors((current) => ({
      ...Object.fromEntries(
        Object.entries(current).filter(
          ([path]) => !path.startsWith(`${section}.`)
        )
      ),
      ...sectionErrors,
    }))

    const firstError = Object.values(sectionErrors)[0]

    if (firstError) {
      toast.error(firstError)
      return
    }

    setActiveStep(Math.min(registrationSections.length, activeStep + 1))
  }

  const updateAboutYou = <Key extends keyof AboutYou>(
    key: Key,
    value: AboutYou[Key]
  ) => {
    setAboutYou((current) => ({ ...current, [key]: value }))
    clearFieldErrors(
      `aboutYou.${key}`,
      ...(key === "livesInMyanmar" ? ["aboutYou.country"] : [])
    )
  }

  const updateInterests = <Key extends keyof Interests>(
    key: Key,
    value: Interests[Key]
  ) => {
    setInterests((current) => ({ ...current, [key]: value }))
    clearFieldErrors(
      `interests.${key}`,
      ...(key === "topics" ? ["interests.otherTopics"] : [])
    )
  }

  // Enter in a single-line field would submit the whole form from the last
  // step, so submitting is left to the buttons.
  const preventImplicitSubmit = (event: KeyboardEvent<HTMLFormElement>) => {
    if (
      event.key === "Enter" &&
      event.target instanceof HTMLInputElement &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { data, errors } = validateRegistration()
    const errorPaths = Object.keys(errors)
    const errorStep =
      registrationSections.findIndex((section) =>
        errorPaths.some((path) => path.startsWith(`${section}.`))
      ) + 1

    setFieldErrors(errors)

    if (!data || errorStep > 0) {
      const firstError = errorPaths.find((path) =>
        path.startsWith(`${registrationSections[errorStep - 1]}.`)
      )

      setActiveStep(errorStep || 1)
      toast.error(
        (firstError && errors[firstError]) || "Check your registration details."
      )
      return
    }

    setIsSubmitting(true)

    try {
      // The raw answers are sent; the server applies the same schema.
      const response = await fetch("/api/attendee-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aboutYou, interests }),
      })
      const responseBody = (await response.json().catch(() => null)) as {
        message?: string
        ticket?: AttendeeTicket
      } | null

      if (response.status === 409 && responseBody?.message) {
        setFieldErrors({ "aboutYou.email": responseBody.message })
        setActiveStep(1)
        toast.error(responseBody.message)
        return
      }

      if (!response.ok || !responseBody?.ticket) {
        throw new Error(responseBody?.message || submissionErrorMessage)
      }

      toast.success(
        responseBody.message || "Registration submitted successfully."
      )

      try {
        sessionStorage.setItem(
          ticketStorageKey,
          JSON.stringify(responseBody.ticket)
        )
      } catch {
        // Without storage the ticket can't reach the next page, so the
        // ticket ID is shown on the confirmation page instead.
        router.replace(
          `/2026/attendee/success?id=${encodeURIComponent(responseBody.ticket.ticketId)}`
        )
        return
      }

      router.replace("/2026/attendee/ticket")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : submissionErrorMessage
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="mx-auto flex h-dvh w-full grow flex-col overflow-hidden"
      noValidate
      onKeyDown={preventImplicitSubmit}
      onSubmit={handleSubmit}
    >
      <Stepper
        className="flex h-full min-h-0 w-full flex-1 flex-col lg:flex-row"
        defaultValue={1}
        value={activeStep}
        orientation="vertical"
        onValueChange={changeStep}
        indicators={{
          loading: <LoaderCircleIcon className="size-4 animate-spin" />,
          completed: (
            <motion.span
              key="completed-indicator"
              className="flex items-center justify-center"
              initial={false}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 440, damping: 28 }
              }
            >
              <CheckIcon strokeWidth={2.75} />
            </motion.span>
          ),
        }}
      >
        <RegistrationSidebar
          activeStep={activeStep}
          mobileStepPicker={mobileStepPicker}
          onMobileStepPickerChange={setMobileStepPicker}
          onStepChange={changeStep}
          shouldReduceMotion={shouldReduceMotion}
        />
        <RegistrationPanel
          aboutYou={aboutYou}
          activeStep={activeStep}
          fieldErrors={fieldErrors}
          interests={interests}
          isSubmitting={isSubmitting}
          onAboutYouChange={updateAboutYou}
          onContinue={continueToNextStep}
          onInterestsChange={updateInterests}
          onStepChange={changeStep}
          shouldReduceMotion={shouldReduceMotion}
        />
      </Stepper>
    </form>
  )
}
