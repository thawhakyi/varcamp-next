import { motion } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  StepperContent,
  StepperPanel,
} from "@workspace/ui/components/reui/stepper"

import { BorderDecorations } from "@/app/_components/border-decorations"
import type { RegistrationFieldErrors } from "@/lib/attendee-registration-schema"

import { AboutYouStep } from "./about-you-step"
import {
  registrationSteps,
  type AboutYou,
  type Interests,
} from "./attendee-data"
import { InterestsStep } from "./interests-step"

type RegistrationPanelProps = {
  aboutYou: AboutYou
  activeStep: number
  fieldErrors: RegistrationFieldErrors
  interests: Interests
  isSubmitting: boolean
  onAboutYouChange: <Key extends keyof AboutYou>(
    key: Key,
    value: AboutYou[Key]
  ) => void
  onContinue: () => void
  onInterestsChange: <Key extends keyof Interests>(
    key: Key,
    value: Interests[Key]
  ) => void
  onStepChange: (step: number) => void
  shouldReduceMotion: boolean | null
}

export function RegistrationPanel({
  aboutYou,
  activeStep,
  fieldErrors,
  interests,
  isSubmitting,
  onAboutYouChange,
  onContinue,
  onInterestsChange,
  onStepChange,
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
                    <AboutYouStep
                      errors={fieldErrors}
                      aboutYou={aboutYou}
                      onAboutYouChange={onAboutYouChange}
                    />
                  ) : (
                    <InterestsStep
                      errors={fieldErrors}
                      interests={interests}
                      onInterestsChange={onInterestsChange}
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
