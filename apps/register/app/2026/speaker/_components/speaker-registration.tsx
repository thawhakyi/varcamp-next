"use client"

import { type FormEvent, type KeyboardEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Stepper } from "@workspace/ui/components/reui/stepper"

import {
  type RegistrationFieldErrors,
  registrationSections,
  speakerRegistrationSchema,
  validateProfilePhoto,
} from "@/lib/speaker-registration-schema"

import { RegistrationPanel } from "./registration-panel"
import { RegistrationSidebar } from "./registration-sidebar"
import {
  type GeneralInformation,
  type ProfilePhoto,
  type SessionDetails,
  type SpeakerProfile,
} from "./speaker-data"

const initialGeneralInformation: GeneralInformation = {
  name: "",
  email: "",
  phone: "",
  telegram: "",
  country: "",
}

const initialProfile: SpeakerProfile = {
  jobTitle: "",
  company: "",
  biography: "",
  aiWorkflow: "",
  linkedin: "",
  facebook: "",
  youtube: "",
  github: "",
}

const initialSession: SessionDetails = {
  title: "",
  description: "",
  preferredTime: "",
  needsTechnicalSupport: "",
  technicalSupport: "",
  recordingConsent: "",
  hasSpecialRequest: "",
  specialRequest: "",
  codeOfConduct: false,
}

const profilePhotoErrorPath = "profile.photo"
const submissionErrorMessage =
  "We couldn't submit your registration. Check your connection and try again."

export function SpeakerRegistration() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const [activeStep, setActiveStep] = useState(1)
  const [mobileStepPicker, setMobileStepPicker] = useState("")
  const [generalInformation, setGeneralInformation] =
    useState<GeneralInformation>(initialGeneralInformation)
  const [profile, setProfile] = useState<SpeakerProfile>(initialProfile)
  const [profilePhoto, setProfilePhoto] = useState<ProfilePhoto | null>(null)
  const [session, setSession] = useState<SessionDetails>(initialSession)
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
    const validation = speakerRegistrationSchema.safeParse({
      generalInformation,
      profile,
      session,
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

  const updateGeneralInformation = (
    key: keyof GeneralInformation,
    value: string
  ) => {
    setGeneralInformation((current) => ({ ...current, [key]: value }))
    clearFieldErrors(`generalInformation.${key}`)
  }

  const updateProfile = (key: keyof SpeakerProfile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }))
    clearFieldErrors(`profile.${key}`)
  }

  const updateProfilePhoto = (file: File | null) => {
    const error = file ? validateProfilePhoto(file) : undefined

    if (error) {
      setFieldErrors((current) => ({
        ...current,
        [profilePhotoErrorPath]: error,
      }))
      return
    }

    if (profilePhoto) {
      URL.revokeObjectURL(profilePhoto.previewUrl)
    }

    setProfilePhoto(
      file ? { file, previewUrl: URL.createObjectURL(file) } : null
    )
    clearFieldErrors(profilePhotoErrorPath)
  }

  const updateSession = <Key extends keyof SessionDetails>(
    key: Key,
    value: SessionDetails[Key]
  ) => {
    setSession((current) => ({ ...current, [key]: value }))
    clearFieldErrors(`session.${key}`)
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
      const formData = new FormData()

      formData.append("data", JSON.stringify(data))

      if (profilePhoto) {
        formData.append("photo", profilePhoto.file)
      }

      const response = await fetch("/api/speaker-registrations", {
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
      router.replace("/2026/speaker/success")
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
          fieldErrors={fieldErrors}
          generalInformation={generalInformation}
          isSubmitting={isSubmitting}
          onContinue={continueToNextStep}
          onGeneralInformationChange={updateGeneralInformation}
          onProfileChange={updateProfile}
          onProfilePhotoChange={updateProfilePhoto}
          onSessionChange={updateSession}
          onStepChange={changeStep}
          profile={profile}
          profilePhoto={profilePhoto}
          session={session}
          shouldReduceMotion={shouldReduceMotion}
        />
      </Stepper>
    </form>
  )
}
