"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import type { Country } from "react-phone-number-input"
import { motion, useReducedMotion } from "framer-motion"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Stepper } from "@workspace/ui/components/reui/stepper"

import {
  type PersonalInformation,
  type RegistrationFieldErrors,
  volunteerRegistrationSchema,
} from "@/lib/volunteer-registration-schema"

import { RegistrationPanel } from "./registration-panel"
import { RegistrationSidebar } from "./registration-sidebar"
import {
  type CommitmentAgreementKey,
  type CommitmentAgreements,
  type TechnicalReadinessAnswers,
  type TechnicalReadinessKey,
  type TechnicalReadinessValue,
  type TeamPriorities,
  type TeamPriorityKey,
  type VolunteerSkillId,
} from "./volunteer-data"

const initialTeamPriorities: TeamPriorities = {
  first: "",
  second: "",
  third: "",
}

const initialPersonalInformation: PersonalInformation = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  city: "",
  bio: "",
}

const initialTechnicalReadiness: TechnicalReadinessAnswers = {
  computerAccess: "",
  stableInternet: "",
  operatingSystem: "",
  browser: "",
  workAdventureExperience: "",
}

const initialCommitmentAgreements: CommitmentAgreements = {
  responsibilityCommitment: false,
  availabilityCommunication: false,
  codeOfConduct: false,
  orientationAttendance: false,
  placementUnderstanding: false,
  informationConsent: false,
}

export function VolunteerRegistration() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const [activeStep, setActiveStep] = useState(1)
  const [mobileStepPicker, setMobileStepPicker] = useState("")
  const [country, setCountry] = useState<Country>()
  const [timezone, setTimezone] = useState("")
  const [personalInformation, setPersonalInformation] =
    useState<PersonalInformation>(initialPersonalInformation)
  const [teamPriorities, setTeamPriorities] = useState<TeamPriorities>(
    initialTeamPriorities
  )
  const [selectedSkills, setSelectedSkills] = useState<VolunteerSkillId[]>([])
  const [technicalReadiness, setTechnicalReadiness] =
    useState<TechnicalReadinessAnswers>(initialTechnicalReadiness)
  const [commitmentAgreements, setCommitmentAgreements] =
    useState<CommitmentAgreements>(initialCommitmentAgreements)
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

  const createSubmission = () => ({
    personalInformation: {
      ...personalInformation,
      country: country || "",
      timezone,
    },
    teamPriorities,
    selectedSkills,
    technicalReadiness,
    commitmentAgreements,
  })

  const setValidationIssues = (
    issues: readonly { message: string; path: PropertyKey[] }[],
    prefix?: string
  ) => {
    const nextErrors = issues.reduce<RegistrationFieldErrors>(
      (errors, issue) => {
        const issuePath = issue.path.map(String).join(".")
        const path = [prefix, issuePath].filter(Boolean).join(".")

        if (!(path in errors)) {
          errors[path] = issue.message
        }

        return errors
      },
      {}
    )

    setFieldErrors((current) => ({ ...current, ...nextErrors }))
  }

  const changeStep = (step: number) => {
    setActiveStep(step)
  }

  const updatePersonalInformation = (
    key: keyof PersonalInformation,
    value: string
  ) => {
    setPersonalInformation((current) => ({ ...current, [key]: value }))
    clearFieldErrors(`personalInformation.${key}`)
  }

  const updateTeamPriority = (key: TeamPriorityKey, value: string) => {
    setTeamPriorities((current) => ({ ...current, [key]: value }))
    clearFieldErrors(
      "teamPriorities.first",
      "teamPriorities.second",
      "teamPriorities.third"
    )
  }

  const updateSelectedSkill = (skill: VolunteerSkillId, selected: boolean) => {
    setSelectedSkills((current) =>
      selected
        ? current.includes(skill)
          ? current
          : [...current, skill]
        : current.filter((currentSkill) => currentSkill !== skill)
    )
    clearFieldErrors("selectedSkills")
  }

  const updateTechnicalReadiness = (
    question: TechnicalReadinessKey,
    answer: TechnicalReadinessValue
  ) => {
    setTechnicalReadiness((current) => ({ ...current, [question]: answer }))
    clearFieldErrors(`technicalReadiness.${question}`)
  }

  const updateCommitmentAgreement = (
    agreement: CommitmentAgreementKey,
    accepted: boolean
  ) => {
    setCommitmentAgreements((current) => ({
      ...current,
      [agreement]: accepted,
    }))
    clearFieldErrors(`commitmentAgreements.${agreement}`)
  }

  const updateCountry = (value: Country) => {
    setCountry(value)
    clearFieldErrors("personalInformation.country")
  }

  const updateTimezone = (value: string) => {
    setTimezone(value)
    clearFieldErrors("personalInformation.timezone")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const submission = createSubmission()
    const validation = volunteerRegistrationSchema.safeParse(submission)

    if (!validation.success) {
      const firstIssue = validation.error.issues[0]
      const issueSection = firstIssue?.path[0]
      const issueStep =
        issueSection === "personalInformation"
          ? 1
          : issueSection === "teamPriorities"
            ? 2
            : issueSection === "selectedSkills"
              ? 3
              : issueSection === "technicalReadiness"
                ? 4
                : 5

      setFieldErrors({})
      setValidationIssues(validation.error.issues)
      setActiveStep(issueStep)
      toast.error(firstIssue?.message || "Check your registration details.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/volunteer-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      })
      const responseBody = (await response.json().catch(() => null)) as {
        message?: string
      } | null

      if (!response.ok) {
        throw new Error(
          responseBody?.message || "Registration could not be submitted."
        )
      }

      toast.success(
        responseBody?.message || "Registration submitted successfully."
      )
      router.replace("/2026/volunteer/success")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Registration could not be submitted."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="mx-auto flex h-dvh w-full grow flex-col overflow-hidden xl:px-2"
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
          commitmentAgreements={commitmentAgreements}
          country={country}
          fieldErrors={fieldErrors}
          isSubmitting={isSubmitting}
          onCommitmentAgreementChange={updateCommitmentAgreement}
          onCountryChange={updateCountry}
          onPersonalInformationChange={updatePersonalInformation}
          onStepChange={changeStep}
          onSkillChange={updateSelectedSkill}
          onTeamPriorityChange={updateTeamPriority}
          onTechnicalReadinessChange={updateTechnicalReadiness}
          onTimezoneChange={updateTimezone}
          personalInformation={personalInformation}
          shouldReduceMotion={shouldReduceMotion}
          selectedSkills={selectedSkills}
          teamPriorities={teamPriorities}
          technicalReadiness={technicalReadiness}
          timezone={timezone}
        />
      </Stepper>
    </form>
  )
}
