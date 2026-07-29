import type { Dispatch, SetStateAction } from "react"
import type { Country } from "react-phone-number-input"
import { motion } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  StepperContent,
  StepperPanel,
} from "@workspace/ui/components/reui/stepper"

import { CommitmentAgreementStep } from "./commitment-agreement-step"
import { PersonalInformationStep } from "./personal-information-step"
import { SkillsExperienceStep } from "./skills-experience-step"
import { TeamPreferencesStep } from "./team-preferences-step"
import { TechnicalReadinessStep } from "./technical-readiness-step"
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

type RegistrationPanelProps = {
  activeStep: number
  commitmentAgreements: CommitmentAgreements
  country: Country | undefined
  onCommitmentAgreementChange: (
    agreement: CommitmentAgreementKey,
    accepted: boolean
  ) => void
  onCountryChange: Dispatch<SetStateAction<Country | undefined>>
  onSkillChange: (skill: VolunteerSkillId, selected: boolean) => void
  onStepChange: (step: number) => void
  onTeamPriorityChange: (key: TeamPriorityKey, value: string) => void
  onTechnicalReadinessChange: (
    question: TechnicalReadinessKey,
    answer: YesNoAnswer
  ) => void
  onTimezoneChange: Dispatch<SetStateAction<string>>
  shouldReduceMotion: boolean | null
  selectedSkills: VolunteerSkillId[]
  teamPriorities: TeamPriorities
  technicalReadiness: TechnicalReadinessAnswers
  timezone: string
}

export function RegistrationPanel({
  activeStep,
  commitmentAgreements,
  country,
  onCommitmentAgreementChange,
  onCountryChange,
  onSkillChange,
  onStepChange,
  onTeamPriorityChange,
  onTechnicalReadinessChange,
  onTimezoneChange,
  shouldReduceMotion,
  selectedSkills,
  teamPriorities,
  technicalReadiness,
  timezone,
}: RegistrationPanelProps) {
  return (
    <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col lg:py-5">
      <StepperPanel className="flex h-full max-w-5xl flex-col overflow-hidden">
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10 xl:px-12">
          <div className="mx-auto w-full max-w-5xl">
            {registrationSteps.map((step, index) => (
              <StepperContent
                key={step.title}
                value={index + 1}
                className="h-full"
              >
                <motion.div
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, y: 20, filter: "blur(8px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.5,
                    ease: "easeOut",
                  }}
                  className="flex min-h-full flex-col"
                >
                  <StepHeading currentStep={index + 1} title={step.title} />

                  {index === 0 ? (
                    <PersonalInformationStep
                      country={country}
                      onCountryChange={onCountryChange}
                      timezone={timezone}
                      onTimezoneChange={onTimezoneChange}
                    />
                  ) : index === 1 ? (
                    <TeamPreferencesStep
                      priorities={teamPriorities}
                      onPriorityChange={onTeamPriorityChange}
                    />
                  ) : index === 2 ? (
                    <SkillsExperienceStep
                      selectedSkills={selectedSkills}
                      onSkillChange={onSkillChange}
                    />
                  ) : index === 3 ? (
                    <TechnicalReadinessStep
                      answers={technicalReadiness}
                      onAnswerChange={onTechnicalReadinessChange}
                    />
                  ) : (
                    <CommitmentAgreementStep
                      agreements={commitmentAgreements}
                      onAgreementChange={onCommitmentAgreementChange}
                    />
                  )}
                </motion.div>
              </StepperContent>
            ))}
          </div>
        </div>

        <RegistrationActions
          activeStep={activeStep}
          canCompleteRegistration={Object.values(commitmentAgreements).every(
            Boolean
          )}
          onStepChange={onStepChange}
        />
      </StepperPanel>
    </main>
  )
}

type StepHeadingProps = {
  currentStep: number
  title: string
}

function StepHeading({ currentStep, title }: StepHeadingProps) {
  return (
    <div className="mb-8 flex items-start justify-between gap-6 border-b border-border/60 pb-6 sm:mb-10 sm:pb-7">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Please fill out the information below.
        </p>
      </div>
      <span className="shrink-0 pt-1 text-sm font-medium text-muted-foreground">
        {currentStep} / {registrationSteps.length}
      </span>
    </div>
  )
}

function RegistrationActions({
  activeStep,
  canCompleteRegistration,
  onStepChange,
}: Pick<RegistrationPanelProps, "activeStep" | "onStepChange"> & {
  canCompleteRegistration: boolean
}) {
  const isFirstStep = activeStep === 1
  const isLastStep = activeStep === registrationSteps.length

  return (
    <div className="w-full shrink-0 border-t border-border/60 bg-background px-5 py-4 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => onStepChange(Math.max(1, activeStep - 1))}
          disabled={isFirstStep}
          className="min-w-20 px-3 sm:min-w-24 sm:px-4"
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={() =>
            onStepChange(Math.min(registrationSteps.length, activeStep + 1))
          }
          disabled={isLastStep && !canCompleteRegistration}
          className="min-w-28 px-4 shadow-lg shadow-primary/20 sm:min-w-40 sm:px-6"
        >
          {isLastStep ? "Complete Registration" : "Continue"}
          {!isLastStep && <ChevronRightIcon data-icon="inline-end" />}
        </Button>
      </div>
    </div>
  )
}
