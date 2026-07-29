import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/reui/field"

import { volunteerSkillOptions, type VolunteerSkillId } from "./volunteer-data"

type SkillsExperienceStepProps = {
  selectedSkills: VolunteerSkillId[]
  onSkillChange: (skill: VolunteerSkillId, selected: boolean) => void
}

export function SkillsExperienceStep({
  selectedSkills,
  onSkillChange,
}: SkillsExperienceStepProps) {
  return (
    <FieldSet>
      <FieldLegend>Areas you can contribute</FieldLegend>
      <FieldDescription>
        Select every area where you have experience or would feel comfortable
        contributing.
      </FieldDescription>
      <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {volunteerSkillOptions.map((skill) => {
          const checkboxId = `skill-${skill.id}`

          return (
            <Field key={skill.id} orientation="horizontal">
              <Checkbox
                id={checkboxId}
                name="skills"
                value={skill.id}
                checked={selectedSkills.includes(skill.id)}
                onCheckedChange={(checked) =>
                  onSkillChange(skill.id, checked === true)
                }
              />
              <FieldLabel htmlFor={checkboxId} className="font-normal">
                {skill.label}
              </FieldLabel>
            </Field>
          )
        })}
      </FieldGroup>
    </FieldSet>
  )
}
