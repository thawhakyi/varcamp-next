import { motion } from "framer-motion"
import { CheckIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Button } from "@workspace/ui/components/button"
import {
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@workspace/ui/components/reui/stepper"
import { cn } from "@workspace/ui/lib/utils"

import { registrationSteps } from "./volunteer-data"

type RegistrationSidebarProps = {
  activeStep: number
  mobileStepPicker: string
  onMobileStepPickerChange: (value: string) => void
  onStepChange: (step: number) => void
  shouldReduceMotion: boolean | null
}

export function RegistrationSidebar({
  activeStep,
  mobileStepPicker,
  onMobileStepPickerChange,
  onStepChange,
  shouldReduceMotion,
}: RegistrationSidebarProps) {
  const activeStepData =
    registrationSteps[activeStep - 1] ?? registrationSteps[0]

  return (
    <div className="relative z-10 flex w-full shrink-0 px-4 py-4 sm:px-5 sm:py-5 lg:h-full lg:w-[22rem] lg:overflow-y-auto lg:px-5 lg:py-5">
      <div className="dark relative isolate flex w-full flex-col overflow-hidden rounded-2xl bg-card px-4 py-4 text-foreground ring-1 ring-border sm:px-5 sm:py-5 lg:min-h-full">
        <header className="flex min-h-9 items-start justify-between gap-3">
          <VolunteerBrand />
          <span className="max-w-36 text-right text-[13px] font-medium text-muted-foreground sm:max-w-none sm:text-sm">
            Volunteer Registration
          </span>
        </header>

        <MobileStepPicker
          activeStep={activeStep}
          activeStepTitle={activeStepData.title}
          activeStepDescription={activeStepData.description}
          openItem={mobileStepPicker}
          onOpenItemChange={onMobileStepPickerChange}
          onStepChange={onStepChange}
          shouldReduceMotion={shouldReduceMotion}
        />

        <DesktopStepNavigation
          activeStep={activeStep}
          shouldReduceMotion={shouldReduceMotion}
        />
      </div>
    </div>
  )
}

function VolunteerBrand() {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 [&_span]:text-slate-50 [&>div]:bg-slate-50 [&>div]:text-slate-950">
      <div
        className="flex size-7 shrink-0 items-center justify-center bg-primary p-1.5 text-primary-foreground"
        aria-hidden="true"
      >
        <svg
          viewBox="25.668 25.1352 49.6644 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-[0.95rem]"
        >
          <circle cx="70.634" cy="29.8334" r="4.69799" fill="currentColor" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M25.668 57.0144V29.8332C25.668 27.2386 27.7713 25.1352 30.366 25.1352C32.9606 25.1352 35.0639 27.2386 35.0639 29.8332V57.0144C35.0639 61.833 38.9702 65.7392 43.7888 65.7392H57.2116C62.0302 65.7392 65.9364 61.833 65.9364 57.0144V43.7258C65.9364 41.1312 68.0398 39.0278 70.6344 39.0278C73.229 39.0278 75.3324 41.1312 75.3324 43.7258V57.0144C75.3324 67.0222 67.2194 75.1352 57.2116 75.1352H43.7888C33.7809 75.1352 25.668 67.0222 25.668 57.0144Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span className="text-[0.9375rem] font-medium">VarCamp2026</span>
    </div>
  )
}

type MobileStepPickerProps = {
  activeStep: number
  activeStepTitle: string
  activeStepDescription: string
  openItem: string
  onOpenItemChange: (value: string) => void
  onStepChange: (step: number) => void
  shouldReduceMotion: boolean | null
}

function MobileStepPicker({
  activeStep,
  activeStepTitle,
  activeStepDescription,
  openItem,
  onOpenItemChange,
  onStepChange,
  shouldReduceMotion,
}: MobileStepPickerProps) {
  return (
    <Accordion
      type="single"
      collapsible
      value={openItem}
      onValueChange={onOpenItemChange}
      className="mt-5 rounded-xl border border-border/70 bg-muted/20 lg:hidden"
    >
      <AccordionItem value="steps" className="border-b-0">
        <AccordionTrigger className="min-h-14 items-center px-3 py-3 hover:no-underline">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground ring-4 ring-primary/15 transition-[background-color,border-color,box-shadow] duration-300">
              <motion.span
                className="size-2 rounded-full bg-primary-foreground"
                initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
              />
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-medium text-primary">
                {activeStepTitle}
              </span>
              <span className="block truncate text-[13px] text-muted-foreground">
                {activeStep} of {registrationSteps.length} -{" "}
                {activeStepDescription}
              </span>
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <div className="flex flex-col gap-1">
            {registrationSteps.map((step, index) => {
              const stepNumber = index + 1
              const isActive = activeStep === stepNumber
              const isPast = activeStep > stepNumber

              return (
                <Button
                  key={step.title}
                  type="button"
                  variant={isActive ? "secondary" : "ghost"}
                  size="lg"
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => {
                    onStepChange(stepNumber)
                    onOpenItemChange("")
                  }}
                  className="h-auto w-full justify-start gap-3 rounded-lg px-3 py-3 text-left whitespace-normal"
                >
                  <StepStatus
                    isActive={isActive}
                    isPast={isPast}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-sm transition-colors",
                        isActive && "text-primary"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="block truncate text-[13px] text-muted-foreground">
                      {step.description}
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

type StepStatusProps = {
  isActive: boolean
  isPast: boolean
  shouldReduceMotion: boolean | null
}

function StepStatus({ isActive, isPast, shouldReduceMotion }: StepStatusProps) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,box-shadow,scale] duration-300 ease-out",
        isActive
          ? "scale-105 border-primary bg-primary text-primary-foreground ring-4 ring-primary/15"
          : isPast
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/50 bg-transparent text-transparent"
      )}
    >
      {isPast ? (
        <motion.span
          initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
        >
          <CheckIcon strokeWidth={2.75} />
        </motion.span>
      ) : (
        <motion.span
          className={cn(
            "size-1.5 rounded-full bg-primary-foreground",
            !isActive && "opacity-0"
          )}
          initial={
            shouldReduceMotion || !isActive ? false : { scale: 0, opacity: 0 }
          }
          animate={{
            scale: isActive ? 1 : 0,
            opacity: isActive ? 1 : 0,
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
        />
      )}
    </span>
  )
}

function DesktopStepNavigation({
  activeStep,
  shouldReduceMotion,
}: Pick<RegistrationSidebarProps, "activeStep" | "shouldReduceMotion">) {
  return (
    <div className="hidden flex-1 items-center justify-center px-2 py-10 sm:px-3 sm:py-12 lg:flex lg:px-2 lg:py-16">
      <div className="relative flex min-h-full w-full flex-col">
        <StepperNav className="w-full">
          {registrationSteps.map((step, index) => {
            const isActive = activeStep === index + 1
            const isPast = activeStep > index + 1

            return (
              <StepperItem
                key={step.title}
                step={index + 1}
                className="relative items-start not-last:flex-1"
              >
                <StepperTrigger
                  className={cn(
                    "group flex items-start gap-3 pb-8 transition-all duration-300 last:pb-0",
                    isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <StepperIndicator
                    className={cn(
                      "relative z-10 mt-0.5 size-4 border shadow-none transition-[background-color,border-color,color,box-shadow,scale] duration-300 ease-out",
                      isActive
                        ? "scale-110 border-primary bg-primary text-primary-foreground ring-4 ring-primary/15 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        : isPast
                          ? "border-primary bg-primary text-primary-foreground data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground"
                          : "border-muted-foreground/50 bg-transparent text-transparent group-hover:border-muted-foreground data-[state=inactive]:bg-transparent"
                    )}
                  >
                    <motion.span
                      className="size-1.5 rounded-full bg-primary-foreground"
                      initial={
                        shouldReduceMotion || !isActive
                          ? false
                          : { scale: 0, opacity: 0 }
                      }
                      animate={{
                        scale: isActive ? 1 : 0,
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
                    />
                  </StepperIndicator>
                  <div className="flex flex-col gap-1 text-left">
                    <StepperTitle
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isActive ? "text-primary" : "text-foreground/70"
                      )}
                    >
                      {step.title}
                    </StepperTitle>
                    <span className="block text-[13px] text-muted-foreground">
                      {step.description}
                    </span>
                  </div>
                </StepperTrigger>

                {index < registrationSteps.length - 1 && (
                  <StepperSeparator
                    className={cn(
                      "absolute inset-y-0 top-6 left-2 -order-1 m-0 w-px -translate-x-1/2 overflow-hidden bg-muted-foreground/30 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2rem)] after:absolute after:inset-0 after:origin-top after:bg-primary after:transition-transform after:duration-500 after:ease-out after:content-[''] motion-reduce:after:transition-none",
                      isPast ? "after:scale-y-100" : "after:scale-y-0"
                    )}
                  />
                )}
              </StepperItem>
            )
          })}
        </StepperNav>
      </div>
    </div>
  )
}
