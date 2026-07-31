import { XIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@workspace/ui/components/combobox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/reui/field"

import type { RegistrationFieldErrors } from "@/lib/volunteer-registration-schema"

import { BorderDecorations } from "./border-decorations"
import {
  teamPriorityFields,
  type TeamPriorities,
  type TeamPriorityKey,
  volunteerTeams,
} from "./volunteer-data"

type TeamPreferencesStepProps = {
  errors: RegistrationFieldErrors
  priorities: TeamPriorities
  onPriorityChange: (key: TeamPriorityKey, value: string) => void
}

export function TeamPreferencesStep({
  errors,
  priorities,
  onPriorityChange,
}: TeamPreferencesStepProps) {
  return (
    <div className="relative flex w-full flex-col justify-between gap-8 p-6 md:p-8">
      <BorderDecorations />
      <FieldSet>
        <FieldLegend>Rank your preferred teams</FieldLegend>
        <FieldDescription>
          Pick up to three teams in the order you would most like to help. The
          tasks for each team is shown below.
        </FieldDescription>
        <FieldGroup
          data-layout="columns"
          className="grid grid-cols-1 lg:grid-cols-3"
        >
          {teamPriorityFields.map((field) => {
            const selectedTeam = volunteerTeams.find(
              (team) => team.id === priorities[field.key]
            )

            return (
              <Field
                key={field.key}
                orientation="vertical"
                data-invalid={Boolean(errors[`teamPriorities.${field.key}`])}
              >
                <FieldLabel htmlFor={`${field.key}Priority`}>
                  {field.label}
                </FieldLabel>
                <FieldContent>
                  <ButtonGroup
                    className="w-full"
                    aria-label={`${field.label} team selection`}
                  >
                    <Combobox
                      items={volunteerTeams.map((team) => team.id)}
                      value={priorities[field.key] || null}
                      onValueChange={(value) =>
                        onPriorityChange(field.key, value ?? "")
                      }
                    >
                      <ComboboxTrigger
                        render={
                          <Button
                            id={`${field.key}Priority`}
                            variant="outline"
                            className="min-w-0 flex-1 justify-between bg-transparent px-3 font-normal hover:bg-transparent"
                            aria-invalid={Boolean(
                              errors[`teamPriorities.${field.key}`]
                            )}
                            aria-describedby={
                              errors[`teamPriorities.${field.key}`]
                                ? `${field.key}Priority-error`
                                : undefined
                            }
                          >
                            {selectedTeam ? (
                              <span className="truncate text-left">
                                {selectedTeam.name}
                              </span>
                            ) : (
                              <span className="truncate text-left text-muted-foreground">
                                {field.placeholder}
                              </span>
                            )}
                          </Button>
                        }
                      />
                      <ComboboxContent>
                        <ComboboxList>
                          {volunteerTeams.map((team) => {
                            const selectedInAnotherPriority = Object.entries(
                              priorities
                            ).some(
                              ([priorityKey, selectedTeam]) =>
                                priorityKey !== field.key &&
                                selectedTeam === team.id
                            )

                            return (
                              <ComboboxItem
                                key={team.id}
                                value={team.id}
                                disabled={selectedInAnotherPriority}
                              >
                                {team.name}
                              </ComboboxItem>
                            )
                          })}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {priorities[field.key] && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Clear ${field.label.toLowerCase()}`}
                        onClick={() => onPriorityChange(field.key, "")}
                      >
                        <XIcon />
                      </Button>
                    )}
                  </ButtonGroup>
                  <FieldError id={`${field.key}Priority-error`}>
                    {errors[`teamPriorities.${field.key}`]}
                  </FieldError>
                </FieldContent>
              </Field>
            )
          })}
        </FieldGroup>
      </FieldSet>

      <TeamReference />
    </div>
  )
}

function TeamReference() {
  return (
    <section aria-labelledby="teamReferenceTitle" className="min-w-0">
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
        className="rounded-xl border bg-background/70"
      >
        {volunteerTeams.map((team) => (
          <AccordionItem
            key={team.id}
            value={team.id}
            className="px-4 last:border-b-0"
          >
            <AccordionTrigger className="gap-4 py-4 text-left hover:no-underline">
              <span className="text-sm font-medium text-foreground md:text-base">
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
