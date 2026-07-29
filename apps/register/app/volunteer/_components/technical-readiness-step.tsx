import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/reui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"

import {
  technicalReadinessQuestions,
  type TechnicalReadinessAnswers,
  type TechnicalReadinessKey,
  type YesNoAnswer,
} from "./volunteer-data"

const yesNoOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
] as const

type TechnicalReadinessStepProps = {
  answers: TechnicalReadinessAnswers
  onAnswerChange: (question: TechnicalReadinessKey, answer: YesNoAnswer) => void
}

export function TechnicalReadinessStep({
  answers,
  onAnswerChange,
}: TechnicalReadinessStepProps) {
  return (
    <FieldGroup className="gap-6">
      {technicalReadinessQuestions.map((question) => {
        const questionLabelId = `${question.key}-label`

        return (
          <Field key={question.key}>
            <div className="flex flex-col gap-1">
              <FieldLabel id={questionLabelId}>{question.label}</FieldLabel>
            </div>
            <FieldContent className="w-full md:max-w-xs">
              <RadioGroup
                aria-labelledby={questionLabelId}
                name={question.key}
                value={answers[question.key]}
                onValueChange={(value) => {
                  if (value === "yes" || value === "no") {
                    onAnswerChange(question.key, value)
                  }
                }}
                className="flex w-fit flex-nowrap gap-6"
              >
                {yesNoOptions.map((option) => {
                  const optionId = `${question.key}-${option.value}`

                  return (
                    <Field
                      key={option.value}
                      orientation="horizontal"
                      className="w-auto"
                    >
                      <RadioGroupItem id={optionId} value={option.value} />
                      <FieldLabel htmlFor={optionId} className="font-normal">
                        {option.label}
                      </FieldLabel>
                    </Field>
                  )
                })}
              </RadioGroup>
            </FieldContent>
          </Field>
        )
      })}
    </FieldGroup>
  )
}
