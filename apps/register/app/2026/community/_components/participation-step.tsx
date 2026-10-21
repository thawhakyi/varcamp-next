import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/reui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Textarea } from "@workspace/ui/components/textarea"

import { BorderDecorations } from "@/app/_components/border-decorations"
import type { RegistrationFieldErrors } from "@/lib/community-registration-schema"

import { yesNoOptions, type Participation } from "./community-data"
import { RegistrationField } from "./registration-field"

type ParticipationStepProps = {
  errors: RegistrationFieldErrors
  onParticipationChange: <Key extends keyof Participation>(
    key: Key,
    value: Participation[Key]
  ) => void
  participation: Participation
}

export function ParticipationStep({
  errors,
  onParticipationChange,
  participation,
}: ParticipationStepProps) {
  const getError = (field: string) => errors[`participation.${field}`]
  const nonProfitError = getError("isNonProfit")

  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        <RegistrationField
          htmlFor="purpose"
          label="Purpose of Community Participation"
          required
          description="What your community hopes to share, gain, or do at VarCamp."
          error={getError("purpose")}
          errorId="purpose-error"
        >
          <Textarea
            id="purpose"
            name="purpose"
            className="resize-y"
            rows={6}
            value={participation.purpose}
            maxLength={1500}
            onChange={(event) =>
              onParticipationChange("purpose", event.target.value)
            }
            required
            aria-invalid={Boolean(getError("purpose"))}
            aria-describedby={getError("purpose") ? "purpose-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          label="Is your Community/Organization non-profit?"
          required
          labelId="isNonProfit-label"
          contentClassName="w-full md:max-w-xs"
          error={nonProfitError}
          errorId="isNonProfit-error"
        >
          <RadioGroup
            required
            aria-labelledby="isNonProfit-label"
            name="isNonProfit"
            value={participation.isNonProfit}
            onValueChange={(nextValue) => {
              const option = yesNoOptions.find(
                (currentOption) => currentOption.value === nextValue
              )

              if (option) {
                onParticipationChange("isNonProfit", option.value)
              }
            }}
            className="flex w-fit flex-nowrap"
          >
            {yesNoOptions.map((option) => {
              const optionId = `isNonProfit-${option.value}`

              return (
                <Field
                  key={option.value}
                  orientation="horizontal"
                  className="w-auto"
                >
                  <RadioGroupItem
                    id={optionId}
                    value={option.value}
                    aria-invalid={Boolean(nonProfitError)}
                    aria-describedby={
                      nonProfitError ? "isNonProfit-error" : undefined
                    }
                  />
                  <FieldLabel htmlFor={optionId} className="font-normal">
                    {option.label}
                  </FieldLabel>
                </Field>
              )
            })}
          </RadioGroup>
        </RegistrationField>
      </FieldGroup>
    </div>
  )
}
