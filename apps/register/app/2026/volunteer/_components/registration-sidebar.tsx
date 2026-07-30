import { motion } from "framer-motion"
import { CheckIcon } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Button } from "@workspace/ui/components/button"
import { VarCampLogoHorizontal } from "@workspace/ui/components/varcamp-logo"
import {
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@workspace/ui/components/reui/stepper"
import { Progress } from "@workspace/ui/components/progress"
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
    <div className="relative z-10 flex w-full shrink-0 px-4 py-4 sm:px-5 sm:py-5 lg:h-full lg:w-88 lg:overflow-y-auto lg:px-5 lg:py-5">
      <div className="relative isolate flex w-full flex-col overflow-hidden rounded-2xl bg-card px-4 py-4 text-foreground ring-1 ring-border sm:px-5 sm:py-5 lg:min-h-full">
        <header className="flex min-h-9 items-center justify-between gap-3">
          <VarCampLogoHorizontal
            className="h-6 w-auto text-foreground"
            title="VarCamp"
          />
          <ThemeToggle />
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

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle dark and light theme"
      title="Toggle dark and light theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4.5"
        aria-hidden="true"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 3l0 18" />
        <path d="M12 9l4.65 -4.65" />
        <path d="M12 14.3l7.37 -7.37" />
        <path d="M12 19.6l8.85 -8.85" />
      </svg>
    </Button>
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
  const progress = (activeStep / registrationSteps.length) * 100

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
            <StepStatus
              isActive
              isPast={false}
              shouldReduceMotion={shouldReduceMotion}
              size="lg"
            />
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
        <div className="px-3 pb-3">
          <Progress
            value={progress}
            aria-label={`Registration progress: step ${activeStep} of ${registrationSteps.length}`}
          />
        </div>
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
  size?: "sm" | "lg"
}

function StepStatus({
  isActive,
  isPast,
  shouldReduceMotion,
  size = "sm",
}: StepStatusProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative isolate flex shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,box-shadow,scale] duration-300 ease-out [&_svg]:size-3",
        size === "lg" ? "size-7" : "size-5",
        isActive
          ? "scale-105 border-primary bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/15"
          : isPast
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground"
      )}
    >
      {isActive && (
        <motion.span
          key="active-halo"
          className="absolute -inset-1.5 -z-10 rounded-full border border-primary/20 bg-primary/5"
          initial={shouldReduceMotion ? false : { scale: 0.72, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      )}
      {isPast ? (
        <motion.span
          key="completed-check"
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
      ) : (
        <motion.span
          key="status-dot"
          className={cn(
            "rounded-full",
            isActive
              ? size === "lg"
                ? "size-2 bg-primary-foreground"
                : "size-1.5 bg-primary-foreground"
              : "size-1 bg-muted-foreground/60"
          )}
          initial={shouldReduceMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
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
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "group flex items-start gap-3 pb-8 transition-opacity duration-300 last:pb-0",
                    !isActive && !isPast && "opacity-70 hover:opacity-100"
                  )}
                >
                  <StepperIndicator
                    className={cn(
                      "relative z-10 mt-0.5 size-5 overflow-visible border-2 shadow-none transition-[background-color,border-color,color,box-shadow,scale] duration-300 ease-out",
                      isActive
                        ? "scale-105 border-primary bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/15 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        : isPast
                          ? "border-primary bg-primary text-primary-foreground data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground"
                          : "border-border bg-background text-muted-foreground group-hover:border-muted-foreground/70 data-[state=inactive]:bg-background"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        key="active-halo"
                        className="absolute -inset-2 -z-10 rounded-full border border-primary/20 bg-primary/5"
                        initial={
                          shouldReduceMotion
                            ? false
                            : { scale: 0.72, opacity: 0 }
                        }
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    )}
                    <motion.span
                      key="status-dot"
                      className={cn(
                        "rounded-full",
                        isActive
                          ? "size-1.5 bg-primary-foreground"
                          : "size-1 bg-muted-foreground/60"
                      )}
                      initial={
                        shouldReduceMotion ? false : { scale: 0.6, opacity: 0 }
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </StepperIndicator>
                  <motion.div
                    className="flex flex-col gap-1 text-left"
                    animate={{ x: isActive && !shouldReduceMotion ? 2 : 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <StepperTitle
                      className={cn(
                        "text-sm transition-colors duration-300",
                        isActive
                          ? "font-semibold text-foreground dark:text-primary"
                          : isPast
                            ? "font-medium text-foreground"
                            : "font-medium text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </StepperTitle>
                    <span
                      className={cn(
                        "block text-[13px] transition-colors duration-300",
                        isActive
                          ? "text-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.description}
                    </span>
                  </motion.div>
                </StepperTrigger>

                {index < registrationSteps.length - 1 && (
                  <StepperSeparator
                    className={cn(
                      "absolute inset-y-0 top-7 left-2.5 -order-1 m-0 w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-border/80 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2.25rem)] after:absolute after:inset-0 after:origin-top after:rounded-full after:bg-primary after:transition-transform after:duration-700 after:ease-[cubic-bezier(0.22,1,0.36,1)] after:content-[''] motion-reduce:after:transition-none",
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
