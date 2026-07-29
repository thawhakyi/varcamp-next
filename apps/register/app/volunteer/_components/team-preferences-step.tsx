import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/reui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import {
  teamPriorityFields,
  type TeamPriorities,
  type TeamPriorityKey,
  volunteerTeams,
} from "./volunteer-data"

type TeamPreferencesStepProps = {
  priorities: TeamPriorities
  onPriorityChange: (key: TeamPriorityKey, value: string) => void
}

export function TeamPreferencesStep({
  priorities,
  onPriorityChange,
}: TeamPreferencesStepProps) {
  return (
    <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <FieldGroup className="gap-5 rounded-2xl border bg-card/60 p-5 shadow-xs sm:p-6">
        {teamPriorityFields.map((field) => (
          <Field key={field.key} orientation="vertical">
            <FieldLabel htmlFor={`${field.key}Priority`}>
              {field.label}
            </FieldLabel>
            <FieldContent>
              <Select
                value={priorities[field.key]}
                onValueChange={(value) => onPriorityChange(field.key, value)}
              >
                <SelectTrigger id={`${field.key}Priority`} className="w-full">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {volunteerTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        ))}
        <FieldDescription>
          Pick up to three teams in the order you would most like to help. The
          same team list is shown on the right for reference.
        </FieldDescription>
      </FieldGroup>

      <TeamReference />
    </div>
  )
}

function TeamReference() {
  return (
    <section
      aria-labelledby="teamReferenceTitle"
      className="min-w-0 rounded-2xl border bg-muted/20 p-4 sm:p-5"
    >
      <div className="mb-2 flex flex-col gap-1">
        <h3
          id="teamReferenceTitle"
          className="font-heading text-base font-semibold text-foreground"
        >
          Team reference
        </h3>
        <p className="text-sm text-muted-foreground">
          Review responsibilities before ranking your preferences.
        </p>
      </div>
      <Accordion
        type="single"
        collapsible
        defaultValue={volunteerTeams[0]?.id}
        className="rounded-xl border bg-background/70"
      >
        {volunteerTeams.map((team) => (
          <AccordionItem
            key={team.id}
            value={team.id}
            className="px-4 last:border-b-0"
          >
            <AccordionTrigger className="gap-4 py-4 text-left hover:no-underline">
              <span className="text-sm font-medium text-foreground">
                {team.name}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                <p>{team.summary}</p>
                {team.sections.map((section) => (
                  <div key={section.title} className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium text-foreground">
                      {section.title}
                    </h4>
                    <ul className="flex list-disc flex-col gap-1 pl-5">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
