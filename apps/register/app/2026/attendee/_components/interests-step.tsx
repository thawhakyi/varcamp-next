import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/reui/field"

import { BorderDecorations } from "@/app/_components/border-decorations"
import { CodeOfConductLink } from "@/app/_components/code-of-conduct"
import { PrivacyPolicyLink } from "@/app/_components/privacy-policy"
import type { RegistrationFieldErrors } from "@/lib/attendee-registration-schema"

import { topicOptions, type Interests, type TopicId } from "./attendee-data"
import { RegistrationField } from "./registration-field"

type InterestsStepProps = {
  errors: RegistrationFieldErrors
  interests: Interests
  onInterestsChange: <Key extends keyof Interests>(
    key: Key,
    value: Interests[Key]
  ) => void
}

export function InterestsStep({
  errors,
  interests,
  onInterestsChange,
}: InterestsStepProps) {
  const getError = (field: string) => errors[`interests.${field}`]
  const topicsError = getError("topics")

  const toggleTopic = (topic: TopicId, selected: boolean) => {
    onInterestsChange(
      "topics",
      selected
        ? [...interests.topics, topic]
        : interests.topics.filter((currentTopic) => currentTopic !== topic)
    )
  }

  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        <RegistrationField
          label="Topics You're Interested In"
          required
          description="Select all that apply."
          labelId="topics-label"
          error={topicsError}
          errorId="topics-error"
        >
          <FieldGroup
            role="group"
            aria-labelledby="topics-label"
            data-slot="checkbox-group"
            className="grid grid-cols-1 data-[slot=checkbox-group]:gap-3 sm:grid-cols-2"
          >
            {topicOptions.map((topic) => {
              const checkboxId = `topic-${topic.id}`

              return (
                <FieldLabel key={topic.id} htmlFor={checkboxId}>
                  <Field orientation="horizontal">
                    <Checkbox
                      id={checkboxId}
                      name="topics"
                      value={topic.id}
                      checked={interests.topics.includes(topic.id)}
                      onCheckedChange={(checked) =>
                        toggleTopic(topic.id, checked === true)
                      }
                      aria-invalid={Boolean(topicsError)}
                      aria-describedby={
                        topicsError ? "topics-error" : undefined
                      }
                    />
                    <FieldTitle>{topic.label}</FieldTitle>
                  </Field>
                </FieldLabel>
              )
            })}
          </FieldGroup>
        </RegistrationField>

        {interests.topics.includes("others") && (
          <RegistrationField
            htmlFor="otherTopics"
            label="Other Topics"
            required
            contentClassName="sm:max-w-sm"
            error={getError("otherTopics")}
            errorId="otherTopics-error"
          >
            <Input
              id="otherTopics"
              name="otherTopics"
              placeholder="e.g. Fintech, Embedded Systems"
              value={interests.otherTopics}
              maxLength={200}
              onChange={(event) =>
                onInterestsChange("otherTopics", event.target.value)
              }
              required
              aria-invalid={Boolean(getError("otherTopics"))}
              aria-describedby={
                getError("otherTopics") ? "otherTopics-error" : undefined
              }
            />
          </RegistrationField>
        )}

        <RegistrationField
          label="Consent"
          required
          labelId="agreement-label"
          error={getError("agreement")}
          errorId="agreement-error"
          contentClassName="gap-4"
        >
          <Field orientation="horizontal">
            <Checkbox
              id="agreement"
              name="agreement"
              value="accepted"
              checked={interests.agreement}
              onCheckedChange={(checked) =>
                onInterestsChange("agreement", checked === true)
              }
              required
              aria-invalid={Boolean(getError("agreement"))}
              aria-describedby={
                getError("agreement") ? "agreement-error" : undefined
              }
            />
            <FieldLabel htmlFor="agreement" className="block font-normal">
              I have read and agree to the VarCamp{" "}
              <PrivacyPolicyLink label="Privacy Policy" /> and{" "}
              <CodeOfConductLink label="Code of Conduct" />.
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="newsletter"
              name="newsletter"
              value="subscribed"
              checked={interests.newsletter}
              onCheckedChange={(checked) =>
                onInterestsChange("newsletter", checked === true)
              }
            />
            <FieldLabel htmlFor="newsletter" className="block font-normal">
              Subscribe me to event updates and newsletter.
            </FieldLabel>
          </Field>
        </RegistrationField>
      </FieldGroup>
    </div>
  )
}
