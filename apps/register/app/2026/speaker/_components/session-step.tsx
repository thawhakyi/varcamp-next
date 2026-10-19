import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
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
import type { RegistrationFieldErrors } from "@/lib/speaker-registration-schema"

import { CodeOfConductLink } from "./code-of-conduct"
import { RegistrationField } from "./registration-field"
import {
  preferredTimeOptions,
  yesNoOptions,
  type SessionDetails,
} from "./speaker-data"

type SessionStepProps = {
  errors: RegistrationFieldErrors
  onSessionChange: <Key extends keyof SessionDetails>(
    key: Key,
    value: SessionDetails[Key]
  ) => void
  session: SessionDetails
}

type ChoiceFieldProps<Value extends string> = {
  description?: string
  error?: string
  label: string
  name: string
  onValueChange: (value: Value) => void
  options: readonly { label: string; value: Value }[]
  value: Value | ""
}

function ChoiceField<Value extends string>({
  description,
  error,
  label,
  name,
  onValueChange,
  options,
  value,
}: ChoiceFieldProps<Value>) {
  const labelId = `${name}-label`
  const errorId = `${name}-error`

  return (
    <RegistrationField
      label={label}
      required
      labelId={labelId}
      description={description}
      contentClassName="w-full md:max-w-xs"
      error={error}
      errorId={errorId}
    >
      <RadioGroup
        required
        aria-labelledby={labelId}
        name={name}
        value={value}
        onValueChange={(nextValue) => {
          const option = options.find(
            (currentOption) => currentOption.value === nextValue
          )

          if (option) {
            onValueChange(option.value)
          }
        }}
        className="flex w-fit flex-nowrap"
      >
        {options.map((option) => {
          const optionId = `${name}-${option.value}`

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
              <FieldLabel htmlFor={optionId} className="font-normal">
                {option.label}
              </FieldLabel>
            </Field>
          )
        })}
      </RadioGroup>
    </RegistrationField>
  )
}

export function SessionStep({
  errors,
  onSessionChange,
  session,
}: SessionStepProps) {
  const getError = (field: string) => errors[`session.${field}`]

  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        <RegistrationField
          htmlFor="sessionTitle"
          label="Title"
          required
          error={getError("title")}
          errorId="sessionTitle-error"
        >
          <Input
            id="sessionTitle"
            name="sessionTitle"
            value={session.title}
            maxLength={150}
            onChange={(event) => onSessionChange("title", event.target.value)}
            required
            aria-invalid={Boolean(getError("title"))}
            aria-describedby={
              getError("title") ? "sessionTitle-error" : undefined
            }
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="sessionDescription"
          label="Description"
          required
          description="What will attendees learn? 2–4 sentences."
          error={getError("description")}
          errorId="sessionDescription-error"
        >
          <Textarea
            id="sessionDescription"
            name="sessionDescription"
            className="resize-y"
            rows={6}
            value={session.description}
            maxLength={1500}
            onChange={(event) =>
              onSessionChange("description", event.target.value)
            }
            required
            aria-invalid={Boolean(getError("description"))}
            aria-describedby={
              getError("description") ? "sessionDescription-error" : undefined
            }
          />
        </RegistrationField>

        <ChoiceField
          name="preferredTime"
          label="Preferred Time"
          description="Myanmar time (MMT)."
          options={preferredTimeOptions}
          value={session.preferredTime}
          error={getError("preferredTime")}
          onValueChange={(value) => onSessionChange("preferredTime", value)}
        />

        <ChoiceField
          name="needsTechnicalSupport"
          label="Do you need technical support for your session?"
          options={yesNoOptions}
          value={session.needsTechnicalSupport}
          error={getError("needsTechnicalSupport")}
          onValueChange={(value) =>
            onSessionChange("needsTechnicalSupport", value)
          }
        />

        {session.needsTechnicalSupport === "yes" && (
          <RegistrationField
            htmlFor="technicalSupport"
            label="What support do you need?"
            required
            error={getError("technicalSupport")}
            errorId="technicalSupport-error"
          >
            <Textarea
              id="technicalSupport"
              name="technicalSupport"
              className="resize-y"
              rows={4}
              value={session.technicalSupport}
              maxLength={1500}
              onChange={(event) =>
                onSessionChange("technicalSupport", event.target.value)
              }
              required
              aria-invalid={Boolean(getError("technicalSupport"))}
              aria-describedby={
                getError("technicalSupport")
                  ? "technicalSupport-error"
                  : undefined
              }
            />
          </RegistrationField>
        )}

        <ChoiceField
          name="recordingConsent"
          label="Do you agree to be recorded and have your session shared publicly after the event?"
          description="We may publish the recording on YouTube, Facebook, and X."
          options={yesNoOptions}
          value={session.recordingConsent}
          error={getError("recordingConsent")}
          onValueChange={(value) => onSessionChange("recordingConsent", value)}
        />

        <ChoiceField
          name="hasSpecialRequest"
          label="Do you have any other requests?"
          options={yesNoOptions}
          value={session.hasSpecialRequest}
          error={getError("hasSpecialRequest")}
          onValueChange={(value) => onSessionChange("hasSpecialRequest", value)}
        />

        {session.hasSpecialRequest === "yes" && (
          <RegistrationField
            htmlFor="specialRequest"
            label="Your request"
            required
            error={getError("specialRequest")}
            errorId="specialRequest-error"
          >
            <Textarea
              id="specialRequest"
              name="specialRequest"
              className="resize-y"
              rows={4}
              value={session.specialRequest}
              maxLength={1500}
              onChange={(event) =>
                onSessionChange("specialRequest", event.target.value)
              }
              required
              aria-invalid={Boolean(getError("specialRequest"))}
              aria-describedby={
                getError("specialRequest") ? "specialRequest-error" : undefined
              }
            />
          </RegistrationField>
        )}

        <RegistrationField
          label="Consent & Code of Conduct"
          required
          labelId="codeOfConduct-label"
          error={getError("codeOfConduct")}
          errorId="codeOfConduct-error"
        >
          <Field orientation="horizontal">
            <Checkbox
              id="codeOfConduct"
              name="codeOfConduct"
              value="accepted"
              checked={session.codeOfConduct}
              onCheckedChange={(checked) =>
                onSessionChange("codeOfConduct", checked === true)
              }
              required
              aria-invalid={Boolean(getError("codeOfConduct"))}
              aria-describedby={
                getError("codeOfConduct") ? "codeOfConduct-error" : undefined
              }
            />
            <FieldLabel htmlFor="codeOfConduct" className="block font-normal">
              I have read and agree to follow the <CodeOfConductLink />.
            </FieldLabel>
          </Field>
        </RegistrationField>
      </FieldGroup>
    </div>
  )
}
