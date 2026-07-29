"use client"

import { useEffect, useState } from "react"
import type { Country } from "react-phone-number-input"
import { motion, useReducedMotion } from "framer-motion"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"

import { Stepper } from "@workspace/ui/components/reui/stepper"

import { RegistrationPanel } from "./registration-panel"
import { RegistrationSidebar } from "./registration-sidebar"
import {
  type CommitmentAgreementKey,
  type CommitmentAgreements,
  registrationSteps,
  type TechnicalReadinessAnswers,
  type TechnicalReadinessKey,
  type TeamPriorities,
  type TeamPriorityKey,
  type VolunteerSkillId,
  type YesNoAnswer,
} from "./volunteer-data"

const initialTeamPriorities: TeamPriorities = {
  first: "",
  second: "",
  third: "",
}

const initialTechnicalReadiness: TechnicalReadinessAnswers = {
  computerAccess: "",
  stableInternet: "",
  workingMicrophone: "",
  workingCamera: "",
  operatingSystem: "",
  browserTesting: "",
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
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [mobileStepPicker, setMobileStepPicker] = useState("")
  const [country, setCountry] = useState<Country>()
  const [timezone, setTimezone] = useState("")
  const [teamPriorities, setTeamPriorities] = useState<TeamPriorities>(
    initialTeamPriorities
  )
  const [selectedSkills, setSelectedSkills] = useState<VolunteerSkillId[]>([])
  const [technicalReadiness, setTechnicalReadiness] =
    useState<TechnicalReadinessAnswers>(initialTechnicalReadiness)
  const [commitmentAgreements, setCommitmentAgreements] =
    useState<CommitmentAgreements>(initialCommitmentAgreements)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const updateTeamPriority = (key: TeamPriorityKey, value: string) => {
    setTeamPriorities((current) => ({ ...current, [key]: value }))
  }

  const updateSelectedSkill = (skill: VolunteerSkillId, selected: boolean) => {
    setSelectedSkills((current) =>
      selected
        ? current.includes(skill)
          ? current
          : [...current, skill]
        : current.filter((currentSkill) => currentSkill !== skill)
    )
  }

  const updateTechnicalReadiness = (
    question: TechnicalReadinessKey,
    answer: YesNoAnswer
  ) => {
    setTechnicalReadiness((current) => ({ ...current, [question]: answer }))
  }

  const updateCommitmentAgreement = (
    agreement: CommitmentAgreementKey,
    accepted: boolean
  ) => {
    setCommitmentAgreements((current) => ({
      ...current,
      [agreement]: accepted,
    }))
  }

  return (
    <div className="mx-auto flex h-dvh w-full grow flex-col overflow-hidden xl:px-2">
      <Stepper
        className="flex h-full min-h-0 w-full flex-1 flex-col lg:flex-row"
        defaultValue={1}
        value={activeStep}
        orientation="vertical"
        onValueChange={setActiveStep}
        indicators={{
          loading: <LoaderCircleIcon className="size-4 animate-spin" />,
          completed: (
            <motion.span
              initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
            >
              <CheckIcon className="size-3" strokeWidth={2.75} />
            </motion.span>
          ),
        }}
      >
        <RegistrationSidebar
          activeStep={activeStep}
          mobileStepPicker={mobileStepPicker}
          onMobileStepPickerChange={setMobileStepPicker}
          onStepChange={setActiveStep}
          shouldReduceMotion={shouldReduceMotion}
        />
        <RegistrationPanel
          activeStep={activeStep}
          commitmentAgreements={commitmentAgreements}
          country={country}
          onCommitmentAgreementChange={updateCommitmentAgreement}
          onCountryChange={setCountry}
          onStepChange={setActiveStep}
          onSkillChange={updateSelectedSkill}
          onTeamPriorityChange={updateTeamPriority}
          onTechnicalReadinessChange={updateTechnicalReadiness}
          onTimezoneChange={setTimezone}
          shouldReduceMotion={shouldReduceMotion}
          selectedSkills={selectedSkills}
          teamPriorities={teamPriorities}
          technicalReadiness={technicalReadiness}
          timezone={timezone}
        />
      </Stepper>
    </div>
  )
}
