import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@workspace/ui/components/reui/field"

import type { RegistrationFieldErrors } from "@/lib/volunteer-registration-schema"

import { BorderDecorations } from "./border-decorations"
import {
  commitmentAgreementFields,
  type CommitmentAgreementKey,
  type CommitmentAgreements,
} from "./volunteer-data"

const agreementDescriptionId = "required-agreements-description"

type CommitmentAgreementStepProps = {
  agreements: CommitmentAgreements
  errors: RegistrationFieldErrors
  onAgreementChange: (
    agreement: CommitmentAgreementKey,
    accepted: boolean
  ) => void
}

export function CommitmentAgreementStep({
  agreements,
  errors,
  onAgreementChange,
}: CommitmentAgreementStepProps) {
  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldSet>
        <FieldLegend>Required agreements</FieldLegend>
        <FieldDescription id={agreementDescriptionId}>
          You must accept every agreement before completing registration.
        </FieldDescription>
        <FieldGroup data-slot="checkbox-group">
          {commitmentAgreementFields.map((agreement) => {
            const checkboxId = `agreement-${agreement.key}`
            const error = errors[`commitmentAgreements.${agreement.key}`]
            const errorId = `${checkboxId}-error`

            return (
              <FieldLabel key={agreement.key} htmlFor={checkboxId}>
                <Field orientation="horizontal" data-invalid={Boolean(error)}>
                  <Checkbox
                    id={checkboxId}
                    name={agreement.key}
                    value="accepted"
                    checked={agreements[agreement.key]}
                    onCheckedChange={(checked) =>
                      onAgreementChange(agreement.key, checked === true)
                    }
                    aria-describedby={agreementDescriptionId}
                    aria-invalid={Boolean(error)}
                    aria-errormessage={error ? errorId : undefined}
                  />
                  <FieldContent>
                    <FieldTitle>{agreement.label}</FieldTitle>
                    <FieldError id={errorId}>{error}</FieldError>
                  </FieldContent>
                </Field>
              </FieldLabel>
            )
          })}
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
