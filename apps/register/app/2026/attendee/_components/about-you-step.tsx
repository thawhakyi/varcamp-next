import type { Country } from "react-phone-number-input"

import { Input } from "@workspace/ui/components/input"
import { CountrySelect } from "@workspace/ui/components/reui/country-select"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/reui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"

import { BorderDecorations } from "@/app/_components/border-decorations"
import type { RegistrationFieldErrors } from "@/lib/attendee-registration-schema"

import { yesNoOptions, type AboutYou } from "./attendee-data"
import { RegistrationField } from "./registration-field"

type AboutYouStepProps = {
  aboutYou: AboutYou
  errors: RegistrationFieldErrors
  onAboutYouChange: <Key extends keyof AboutYou>(
    key: Key,
    value: AboutYou[Key]
  ) => void
}

export function AboutYouStep({
  aboutYou,
  errors,
  onAboutYouChange,
}: AboutYouStepProps) {
  const getError = (field: string) => errors[`aboutYou.${field}`]
  const livesInMyanmarError = getError("livesInMyanmar")

  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        <RegistrationField
          htmlFor="fullName"
          label="Full Name"
          required
          contentClassName="sm:max-w-xs"
          error={getError("fullName")}
          errorId="fullName-error"
        >
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="John Doe"
            value={aboutYou.fullName}
            maxLength={120}
            onChange={(event) =>
              onAboutYouChange("fullName", event.target.value)
            }
            required
            aria-invalid={Boolean(getError("fullName"))}
            aria-describedby={
              getError("fullName") ? "fullName-error" : undefined
            }
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="email"
          label="Email"
          required
          description="We'll send your registration details and event updates here."
          contentClassName="sm:max-w-xs"
          error={getError("email")}
          errorId="email-error"
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={aboutYou.email}
            maxLength={254}
            onChange={(event) => onAboutYouChange("email", event.target.value)}
            required
            aria-invalid={Boolean(getError("email"))}
            aria-describedby={getError("email") ? "email-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          label="Are you currently living in Myanmar?"
          required
          labelId="livesInMyanmar-label"
          contentClassName="w-full md:max-w-xs"
          error={livesInMyanmarError}
          errorId="livesInMyanmar-error"
        >
          <RadioGroup
            required
            aria-labelledby="livesInMyanmar-label"
            name="livesInMyanmar"
            value={aboutYou.livesInMyanmar}
            onValueChange={(nextValue) => {
              const option = yesNoOptions.find(
                (currentOption) => currentOption.value === nextValue
              )

              if (option) {
                onAboutYouChange("livesInMyanmar", option.value)
              }
            }}
            className="flex w-fit flex-nowrap"
          >
            {yesNoOptions.map((option) => {
              const optionId = `livesInMyanmar-${option.value}`

              return (
                <Field
                  key={option.value}
                  orientation="horizontal"
                  className="w-auto"
                >
                  <RadioGroupItem
                    id={optionId}
                    value={option.value}
                    aria-invalid={Boolean(livesInMyanmarError)}
                    aria-describedby={
                      livesInMyanmarError ? "livesInMyanmar-error" : undefined
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

        {aboutYou.livesInMyanmar === "no" && (
          <RegistrationField
            label="Country"
            required
            description="The country you're living in now."
            contentClassName="sm:max-w-xs"
            error={getError("country")}
            errorId="country-error"
          >
            <CountrySelect
              value={(aboutYou.country || undefined) as Country | undefined}
              onChange={(country) => onAboutYouChange("country", country ?? "")}
              aria-invalid={Boolean(getError("country"))}
              aria-describedby={
                getError("country") ? "country-error" : undefined
              }
            />
          </RegistrationField>
        )}
      </FieldGroup>
    </div>
  )
}
