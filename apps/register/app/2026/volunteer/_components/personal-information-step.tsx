import type { ReactNode } from "react"
import type {
  Country,
  Value as PhoneNumberValue,
} from "react-phone-number-input"

import { Input } from "@workspace/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { CountrySelect } from "@workspace/ui/components/reui/country-select"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/reui/field"
import { PhoneInput } from "@workspace/ui/components/reui/phone-input"
import { TimezoneSelect } from "@workspace/ui/components/reui/timezone-select"
import { Textarea } from "@workspace/ui/components/textarea"

import type {
  PersonalInformation,
  RegistrationFieldErrors,
} from "@/lib/volunteer-registration-schema"

import { BorderDecorations } from "./border-decorations"

type PersonalInformationStepProps = {
  country: Country | undefined
  errors: RegistrationFieldErrors
  information: PersonalInformation
  onCountryChange: (country: Country) => void
  onInformationChange: (key: keyof PersonalInformation, value: string) => void
  timezone: string
  onTimezoneChange: (timezone: string) => void
}

type RegistrationFieldProps = {
  children: ReactNode
  contentClassName?: string
  description: string
  error?: string
  errorId?: string
  htmlFor?: string
  label: string
}

function RegistrationField({
  children,
  contentClassName,
  description,
  error,
  errorId,
  htmlFor,
  label,
}: RegistrationFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldContent>
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      <FieldContent className={contentClassName}>
        {children}
        <FieldError id={errorId}>{error}</FieldError>
      </FieldContent>
    </Field>
  )
}

export function PersonalInformationStep({
  country,
  errors,
  information,
  onCountryChange,
  onInformationChange,
  timezone,
  onTimezoneChange,
}: PersonalInformationStepProps) {
  const getError = (field: string) => errors[`personalInformation.${field}`]

  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        <RegistrationField
          htmlFor="fullName"
          label="Full Name"
          description="Enter the name you would like us to use."

          error={getError("fullName")}
          errorId="fullName-error"
        >
          <Input
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            value={information.fullName}
            maxLength={120}
            onChange={(event) =>
              onInformationChange("fullName", event.target.value)
            }
            required
            aria-invalid={Boolean(getError("fullName"))}
            aria-describedby={
              getError("fullName") ? "fullName-error" : undefined
            }
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="username"
          label="Username"
          description="Choose how your name will appear."

          error={getError("username")}
          errorId="username-error"
        >
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>@</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="username"
              name="username"
              placeholder="johndoe"
              value={information.username}
              maxLength={60}
              onChange={(event) =>
                onInformationChange("username", event.target.value)
              }
              required
              aria-invalid={Boolean(getError("username"))}
              aria-describedby={
                getError("username") ? "username-error" : undefined
              }
            />
          </InputGroup>
        </RegistrationField>

        <RegistrationField
          htmlFor="email"
          label="Email"
          description="We will use this for registration updates."

          error={getError("email")}
          errorId="email-error"
        >
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={information.email}
            maxLength={254}
            onChange={(event) =>
              onInformationChange("email", event.target.value)
            }
            required
            aria-invalid={Boolean(getError("email"))}
            aria-describedby={getError("email") ? "email-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="phone"
          label="Phone Number"
          description="Include a number where the team can reach you."

          error={getError("phone")}
          errorId="phone-error"
        >
          <PhoneInput
            id="phone"
            name="phone"
            defaultCountry="MM"
            value={information.phone as PhoneNumberValue}
            onChange={(value) => onInformationChange("phone", value)}
            required
            aria-invalid={Boolean(getError("phone"))}
            aria-describedby={getError("phone") ? "phone-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          label="Country"
          description="Select the country where you currently live."

          error={getError("country")}
          errorId="country-error"
        >
          <CountrySelect
            value={country}
            onChange={onCountryChange}
            aria-invalid={Boolean(getError("country"))}
            aria-describedby={getError("country") ? "country-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="city"
          label="City"
          description="Enter your current city."

          error={getError("city")}
          errorId="city-error"
        >
          <Input
            id="city"
            name="city"
            placeholder="Yangon"
            value={information.city}
            maxLength={100}
            onChange={(event) =>
              onInformationChange("city", event.target.value)
            }
            required
            aria-invalid={Boolean(getError("city"))}
            aria-describedby={getError("city") ? "city-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          label="Timezone"
          description="Helps us coordinate meetings and volunteer work."
          contentClassName="w-full sm:max-w-sm"
          error={getError("timezone")}
          errorId="timezone-error"
        >
          <TimezoneSelect
            value={timezone}
            onChange={onTimezoneChange}
            aria-invalid={Boolean(getError("timezone"))}
            aria-describedby={
              getError("timezone") ? "timezone-error" : undefined
            }
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="bio"
          label="Short Bio (Optional)"
          description="Share a brief introduction about yourself."
          error={getError("bio")}
          errorId="bio-error"
        >
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell us a little bit about yourself..."
            className="resize-y"
            rows={6}
            value={information.bio}
            maxLength={1500}
            onChange={(event) => onInformationChange("bio", event.target.value)}
            aria-invalid={Boolean(getError("bio"))}
            aria-describedby={getError("bio") ? "bio-error" : undefined}
          />
        </RegistrationField>
      </FieldGroup>
    </div>
  )
}
