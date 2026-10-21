"use client"

import { type FormEvent, type KeyboardEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Stepper } from "@workspace/ui/components/reui/stepper"

import {
  communityRegistrationSchema,
  logoRequiredMessage,
  type RegistrationFieldErrors,
  registrationSections,
  validateLogo,
} from "@/lib/community-registration-schema"

import {
  type CommunityLogo,
  type CommunityProfile,
  type ContactPerson,
  type Participation,
} from "./community-data"
import { RegistrationPanel } from "./registration-panel"
import { RegistrationSidebar } from "./registration-sidebar"

const initialProfile: CommunityProfile = {
  name: "",
  about: "",
  website: "",
  facebook: "",
  linkedin: "",
  x: "",
  youtube: "",
}

const initialContact: ContactPerson = {
  name: "",
  email: "",
  telegram: "",
}

const initialParticipation: Participation = {
  purpose: "",
  isNonProfit: "",
}

const logoErrorPath = "profile.logo"
const submissionErrorMessage =
  "We couldn't submit your registration. Check your connection and try again."

export function CommunityRegistration() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const [activeStep, setActiveStep] = useState(1)
  const [mobileStepPicker, setMobileStepPicker] = useState("")
  const [profile, setProfile] = useState<CommunityProfile>(initialProfile)
  const [logo, setLogo] = useState<CommunityLogo | null>(null)
  const [contact, setContact] = useState<ContactPerson>(initialContact)
  const [participation, setParticipation] =
    useState<Participation>(initialParticipation)
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
    const validation = communityRegistrationSchema.safeParse({
      profile,
      contact,
      participation,
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

    if (!logo) {
      errors[logoErrorPath] = logoRequiredMessage
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

  const updateProfile = (key: keyof CommunityProfile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }))
    clearFieldErrors(`profile.${key}`)
  }

  const updateLogo = (file: File | null) => {
    const error = file ? validateLogo(file) : undefined

    if (error) {
      setFieldErrors((current) => ({
        ...current,
        [logoErrorPath]: error,
      }))
      return
    }

    if (logo) {
      URL.revokeObjectURL(logo.previewUrl)
    }

    setLogo(file ? { file, previewUrl: URL.createObjectURL(file) } : null)
    clearFieldErrors(logoErrorPath)
  }

  const updateContact = (key: keyof ContactPerson, value: string) => {
    setContact((current) => ({ ...current, [key]: value }))
    clearFieldErrors(`contact.${key}`)
  }

  const updateParticipation = <Key extends keyof Participation>(
    key: Key,
    value: Participation[Key]
  ) => {
    setParticipation((current) => ({ ...current, [key]: value }))
    clearFieldErrors(`participation.${key}`)
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

    if (!data || !logo || errorStep > 0) {
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
      const formData = new FormData()

      formData.append("data", JSON.stringify(data))
      formData.append("logo", logo.file)

      const response = await fetch("/api/community-registrations", {
        method: "POST",
        body: formData,
      })
      const responseBody = (await response.json().catch(() => null)) as {
        message?: string
      } | null

      if (!response.ok) {
        throw new Error(responseBody?.message || submissionErrorMessage)
      }

      toast.success(
        responseBody?.message || "Registration submitted successfully."
      )
      router.replace("/2026/community/success")
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
          activeStep={activeStep}
          contact={contact}
          fieldErrors={fieldErrors}
          isSubmitting={isSubmitting}
          logo={logo}
          onContactChange={updateContact}
          onContinue={continueToNextStep}
          onLogoChange={updateLogo}
          onParticipationChange={updateParticipation}
          onProfileChange={updateProfile}
          onStepChange={changeStep}
          participation={participation}
          profile={profile}
          shouldReduceMotion={shouldReduceMotion}
        />
      </Stepper>
    </form>
  )
}
