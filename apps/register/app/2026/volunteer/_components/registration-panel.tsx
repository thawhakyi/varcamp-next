import type { Country } from "react-phone-number-input"
import { motion } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  StepperContent,
  StepperPanel,
} from "@workspace/ui/components/reui/stepper"

import { BorderDecorations } from "./border-decorations"
import { CommitmentAgreementStep } from "./commitment-agreement-step"
import { PersonalInformationStep } from "./personal-information-step"
import { SkillsExperienceStep } from "./skills-experience-step"
import { TeamPreferencesStep } from "./team-preferences-step"
import { TechnicalReadinessStep } from "./technical-readiness-step"
import type {
  PersonalInformation,
  RegistrationFieldErrors,
} from "@/lib/volunteer-registration-schema"
import {
  type CommitmentAgreementKey,
  type CommitmentAgreements,
  registrationSteps,
  type TechnicalReadinessAnswers,
  type TechnicalReadinessKey,
  type TechnicalReadinessValue,
  type TeamPriorities,
  type TeamPriorityKey,
  type VolunteerSkillId,
} from "./volunteer-data"

type RegistrationPanelProps = {
  activeStep: number
  commitmentAgreements: CommitmentAgreements
  country: Country | undefined
  fieldErrors: RegistrationFieldErrors
  isSubmitting: boolean
  onCommitmentAgreementChange: (
    agreement: CommitmentAgreementKey,
    accepted: boolean
  ) => void
  onCountryChange: (country: Country) => void
  onPersonalInformationChange: (
    key: keyof PersonalInformation,
    value: string
  ) => void
  onSkillChange: (skill: VolunteerSkillId, selected: boolean) => void
  onStepChange: (step: number) => void
  onTeamPriorityChange: (key: TeamPriorityKey, value: string) => void
  onTechnicalReadinessChange: (
    question: TechnicalReadinessKey,
    answer: TechnicalReadinessValue
  ) => void
  onTimezoneChange: (timezone: string) => void
  personalInformation: PersonalInformation
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
  fieldErrors,
  isSubmitting,
  onCommitmentAgreementChange,
  onCountryChange,
  onPersonalInformationChange,
  onSkillChange,
  onStepChange,
  onTeamPriorityChange,
  onTechnicalReadinessChange,
  onTimezoneChange,
  personalInformation,
  shouldReduceMotion,
  selectedSkills,
  teamPriorities,
  technicalReadiness,
  timezone,
}: RegistrationPanelProps) {
  return (
    <main
      aria-labelledby="registration-step-heading"
      className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col items-center lg:py-5"
    >
      <StepperPanel className="flex h-full max-w-5xl flex-col overflow-hidden">
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
          <div className="mx-auto w-full max-w-3xl">
            {registrationSteps.map((step, index) => (
              <StepperContent
                key={step.title}
                value={index + 1}
                className="h-full"
              >
                <motion.div
                  initial={
                    shouldReduceMotion ? false : { opacity: 0.72, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.36,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex min-h-full flex-col"
                >
                  <StepHeading currentStep={index + 1} title={step.title} />

                  {index === 0 ? (
                    <PersonalInformationStep
                      country={country}
                      errors={fieldErrors}
                      information={personalInformation}
                      onCountryChange={onCountryChange}
                      onInformationChange={onPersonalInformationChange}
                      timezone={timezone}
                      onTimezoneChange={onTimezoneChange}
                    />
                  ) : index === 1 ? (
                    <TeamPreferencesStep
                      errors={fieldErrors}
                      priorities={teamPriorities}
                      onPriorityChange={onTeamPriorityChange}
                    />
                  ) : index === 2 ? (
                    <SkillsExperienceStep
                      error={fieldErrors.selectedSkills}
                      selectedSkills={selectedSkills}
                      onSkillChange={onSkillChange}
                    />
                  ) : index === 3 ? (
                    <TechnicalReadinessStep
                      answers={technicalReadiness}
                      errors={fieldErrors}
                      onAnswerChange={onTechnicalReadinessChange}
                    />
                  ) : (
                    <CommitmentAgreementStep
                      agreements={commitmentAgreements}
                      errors={fieldErrors}
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
          isSubmitting={isSubmitting}
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
    <section
      aria-live="polite"
      className="relative mb-8 bg-muted/20 px-5 py-6 sm:mb-10 sm:px-7 sm:py-8"
    >
      <BorderDecorations />

      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Step {currentStep} of {registrationSteps.length}
        </span>
        <h1
          id="registration-step-heading"
          className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Please fill out the information below.
        </p>
      </div>
    </section>
  )
}

function RegistrationActions({
  activeStep,
  isSubmitting,
  onStepChange,
}: Pick<RegistrationPanelProps, "activeStep" | "onStepChange"> & {
  isSubmitting: boolean
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
          disabled={isFirstStep || isSubmitting}
          className="min-w-20 px-3 sm:min-w-24 sm:px-4"
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <Button
          type={isLastStep ? "submit" : "button"}
          size="lg"
          onClick={
            isLastStep
              ? undefined
              : () =>
                  onStepChange(
                    Math.min(registrationSteps.length, activeStep + 1)
                  )
          }
          disabled={isSubmitting}
          className="min-w-28 px-4 shadow-lg shadow-primary/20 sm:min-w-40 sm:px-6"
        >
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {isSubmitting
            ? "Submitting..."
            : isLastStep
              ? "Complete Registration"
              : "Continue"}
          {!isLastStep && <ChevronRightIcon data-icon="inline-end" />}
        </Button>
      </div>
    </div>
  )
}
