import { XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/reui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import type { RegistrationFieldErrors } from "@/lib/organizer-registration-schema"

import { BorderDecorations } from "./border-decorations"
import {
  technicalReadinessFields,
  type TechnicalReadinessAnswers,
  type TechnicalReadinessKey,
  type TechnicalReadinessValue,
} from "./organizer-data"

const yesNoOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
] as const

type TechnicalReadinessStepProps = {
  answers: TechnicalReadinessAnswers
  errors: RegistrationFieldErrors
  onAnswerChange: (
    question: TechnicalReadinessKey,
    answer: TechnicalReadinessValue
  ) => void
}

export function TechnicalReadinessStep({
  answers,
  errors,
  onAnswerChange,
}: TechnicalReadinessStepProps) {
  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        {technicalReadinessFields.map((field) => {
          const fieldLabelId = `${field.key}-label`
          const error = errors[`technicalReadiness.${field.key}`]
          const errorId = `${field.key}-error`

          return (
            <Field key={field.key} data-invalid={Boolean(error)}>
              <FieldContent>
                <FieldLabel id={fieldLabelId}>{field.label}</FieldLabel>
              </FieldContent>
              <FieldContent className="w-full md:max-w-xs">
                {field.type === "yes-no" ? (
                  <RadioGroup
                    aria-labelledby={fieldLabelId}
                    name={field.key}
                    value={answers[field.key]}
                    onValueChange={(value) => {
                      if (value === "yes" || value === "no") {
                        onAnswerChange(field.key, value)
                      }
                    }}
                    className="flex w-fit flex-nowrap"
                  >
                    {yesNoOptions.map((option) => {
                      const optionId = `${field.key}-${option.value}`

                      return (
                        <Field
                          key={option.value}
                          orientation="horizontal"
                          className="w-auto"
                        >
                          <RadioGroupItem
                            id={optionId}
                            value={option.value}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? errorId : undefined}
                          />
                          <FieldLabel
                            htmlFor={optionId}
                            className="font-normal"
                          >
                            {option.label}
                          </FieldLabel>
                        </Field>
                      )
                    })}
                  </RadioGroup>
                ) : (
                  <ButtonGroup
                    className="w-full"
                    aria-label={`${field.label} selection`}
                  >
                    <Select
                      value={answers[field.key]}
                      onValueChange={(value) =>
                        onAnswerChange(
                          field.key,
                          value as TechnicalReadinessValue
                        )
                      }
                    >
                      <SelectTrigger
                        id={field.key}
                        className="min-w-0 flex-1"
                        aria-labelledby={fieldLabelId}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? errorId : undefined}
                      >
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectGroup>
                          {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {answers[field.key] && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Clear ${field.label.toLowerCase()}`}
                        onClick={() => onAnswerChange(field.key, "")}
                      >
                        <XIcon />
                      </Button>
                    )}
                  </ButtonGroup>
                )}
                <FieldError id={errorId}>{error}</FieldError>
              </FieldContent>
            </Field>
          )
        })}
      </FieldGroup>
    </div>
  )
}
