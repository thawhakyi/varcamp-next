import { motion } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  StepperContent,
  StepperPanel,
} from "@workspace/ui/components/reui/stepper"

import { BorderDecorations } from "@/app/_components/border-decorations"
import type { RegistrationFieldErrors } from "@/lib/community-registration-schema"

import {
  registrationSteps,
  type CommunityLogo,
  type CommunityProfile,
  type ContactPerson,
  type Participation,
} from "./community-data"
import { CommunityProfileStep } from "./community-profile-step"
import { ContactPersonStep } from "./contact-person-step"
import { ParticipationStep } from "./participation-step"

type RegistrationPanelProps = {
  activeStep: number
  contact: ContactPerson
  fieldErrors: RegistrationFieldErrors
  isSubmitting: boolean
  logo: CommunityLogo | null
  onContactChange: (key: keyof ContactPerson, value: string) => void
  onContinue: () => void
  onLogoChange: (file: File | null) => void
  onParticipationChange: <Key extends keyof Participation>(
    key: Key,
    value: Participation[Key]
  ) => void
  onProfileChange: (key: keyof CommunityProfile, value: string) => void
  onStepChange: (step: number) => void
  participation: Participation
  profile: CommunityProfile
  shouldReduceMotion: boolean | null
}

export function RegistrationPanel({
  activeStep,
  contact,
  fieldErrors,
  isSubmitting,
  logo,
  onContactChange,
  onContinue,
  onLogoChange,
  onParticipationChange,
  onProfileChange,
  onStepChange,
  participation,
  profile,
  shouldReduceMotion,
}: RegistrationPanelProps) {
  return (
    <main
      aria-labelledby="registration-step-heading"
      className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col items-center"
    >
      <StepperPanel className="flex h-full flex-col overflow-hidden">
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl">
            {registrationSteps.map((step, index) => (
              <StepperContent
                key={step.title}
                value={index + 1}
                className="h-full p-4"
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
                  <StepHeading
                    currentStep={index + 1}
                    title={step.title}
                    introduction={step.introduction}
                  />

                  {index === 0 ? (
                    <CommunityProfileStep
                      errors={fieldErrors}
                      profile={profile}
                      logo={logo}
                      onProfileChange={onProfileChange}
                      onLogoChange={onLogoChange}
                    />
                  ) : index === 1 ? (
                    <ContactPersonStep
                      errors={fieldErrors}
                      contact={contact}
                      onContactChange={onContactChange}
                    />
                  ) : (
                    <ParticipationStep
                      errors={fieldErrors}
                      participation={participation}
                      onParticipationChange={onParticipationChange}
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
          onContinue={onContinue}
          onStepChange={onStepChange}
        />
      </StepperPanel>
    </main>
  )
}

type StepHeadingProps = {
  currentStep: number
  introduction: string
  title: string
}

function StepHeading({ currentStep, introduction, title }: StepHeadingProps) {
  return (
    <section
      aria-live="polite"
      className="relative mb-8 bg-muted/20 px-5 py-6 sm:mb-10 sm:px-7 sm:py-8"
    >
      <BorderDecorations />

      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep} of {registrationSteps.length}
        </span>
        <h1
          id="registration-step-heading"
          className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {introduction}
        </p>
      </div>
    </section>
  )
}

function RegistrationActions({
  activeStep,
  isSubmitting,
  onContinue,
  onStepChange,
}: Pick<
  RegistrationPanelProps,
  "activeStep" | "isSubmitting" | "onContinue" | "onStepChange"
>) {
  const isFirstStep = activeStep === 1
  const isLastStep = activeStep === registrationSteps.length

  return (
    <div className="mx-auto w-full max-w-5xl shrink-0 border-t border-border/60 bg-background/75 px-4 py-4 backdrop-blur-xl sm:px-8 lg:px-6">
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
        {/* Keyed so Continue is replaced rather than turned into the submit
            button mid-click, which would submit the form straight away. */}
        <Button
          key={isLastStep ? "submit" : "continue"}
          type={isLastStep ? "submit" : "button"}
          size="lg"
          onClick={isLastStep ? undefined : onContinue}
          disabled={isSubmitting}
          className="min-w-28 px-4 shadow-lg shadow-primary/20 sm:min-w-40 sm:px-6"
        >
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {isSubmitting
            ? "Submitting..."
            : isLastStep
              ? "Submit Registration"
              : "Continue"}
          {!isLastStep && <ChevronRightIcon data-icon="inline-end" />}
        </Button>
      </div>
    </div>
  )
}
