import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@workspace/ui/components/reui/field"

import { BorderDecorations } from "./border-decorations"
import { organizerSkillOptions, type OrganizerSkillId } from "./organizer-data"

type SkillsExperienceStepProps = {
  error?: string
  selectedSkills: OrganizerSkillId[]
  onSkillChange: (skill: OrganizerSkillId, selected: boolean) => void
}

export function SkillsExperienceStep({
  error,
  selectedSkills,
  onSkillChange,
}: SkillsExperienceStepProps) {
  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldSet data-invalid={Boolean(error)}>
        <FieldLegend>Areas you can contribute</FieldLegend>
        <FieldDescription>
          Select every area where you have experience or would feel comfortable
          contributing.
        </FieldDescription>
        <FieldGroup
          data-slot="checkbox-group"
          className="grid grid-cols-1 data-[slot=checkbox-group]:gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {organizerSkillOptions.map((skill) => {
            const checkboxId = `skill-${skill.id}`

            return (
              <FieldLabel key={skill.id} htmlFor={checkboxId}>
                <Field orientation="horizontal">
                  <Checkbox
                    id={checkboxId}
                    name="skills"
                    value={skill.id}
                    checked={selectedSkills.includes(skill.id)}
                    onCheckedChange={(checked) =>
                      onSkillChange(skill.id, checked === true)
                    }
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error ? "selectedSkills-error" : undefined
                    }
                  />
                  <FieldTitle>{skill.label}</FieldTitle>
                </Field>
              </FieldLabel>
            )
          })}
        </FieldGroup>
        <FieldError id="selectedSkills-error">{error}</FieldError>
      </FieldSet>
    </div>
  )
}
