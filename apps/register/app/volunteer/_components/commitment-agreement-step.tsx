import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/reui/field"

import {
  commitmentAgreementFields,
  type CommitmentAgreementKey,
  type CommitmentAgreements,
} from "./volunteer-data"

const agreementDescriptionId = "required-agreements-description"

type CommitmentAgreementStepProps = {
  agreements: CommitmentAgreements
  onAgreementChange: (
    agreement: CommitmentAgreementKey,
    accepted: boolean
  ) => void
}

export function CommitmentAgreementStep({
  agreements,
  onAgreementChange,
}: CommitmentAgreementStepProps) {
  return (
    <FieldSet>
      <FieldLegend>Required agreements</FieldLegend>
      <FieldDescription id={agreementDescriptionId}>
        You must accept every agreement before completing registration.
      </FieldDescription>
      <FieldGroup className="gap-4">
        {commitmentAgreementFields.map((agreement) => {
          const checkboxId = `agreement-${agreement.key}`

          return (
            <Field key={agreement.key} orientation="horizontal">
              <Checkbox
                id={checkboxId}
                name={agreement.key}
                value="accepted"
                checked={agreements[agreement.key]}
                onCheckedChange={(checked) =>
                  onAgreementChange(agreement.key, checked === true)
                }
                aria-describedby={agreementDescriptionId}
                required
              />
              <FieldLabel htmlFor={checkboxId} className="font-normal">
                {agreement.label}
              </FieldLabel>
            </Field>
          )
        })}
      </FieldGroup>
    </FieldSet>
  )
}
