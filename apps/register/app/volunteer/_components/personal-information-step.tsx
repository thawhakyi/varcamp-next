import type { Dispatch, ReactNode, SetStateAction } from "react"
import type { Country } from "react-phone-number-input"

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
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/reui/field"
import { PhoneInput } from "@workspace/ui/components/reui/phone-input"
import { TimezoneSelect } from "@workspace/ui/components/reui/timezone-select"
import { Textarea } from "@workspace/ui/components/textarea"

type PersonalInformationStepProps = {
  country: Country | undefined
  onCountryChange: Dispatch<SetStateAction<Country | undefined>>
  timezone: string
  onTimezoneChange: Dispatch<SetStateAction<string>>
}

type RegistrationFieldProps = {
  children: ReactNode
  contentClassName?: string
  description: string
  htmlFor?: string
  label: string
}

function RegistrationField({
  children,
  contentClassName,
  description,
  htmlFor,
  label,
}: RegistrationFieldProps) {
  return (
    <Field>
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </div>
      <FieldContent className={contentClassName}>{children}</FieldContent>
    </Field>
  )
}

export function PersonalInformationStep({
  country,
  onCountryChange,
  timezone,
  onTimezoneChange,
}: PersonalInformationStepProps) {
  return (
    <FieldGroup>
      <RegistrationField
        htmlFor="fullName"
        label="Full Name"
        description="Enter the name you would like us to use."
        contentClassName="w-full sm:max-w-xs"
      >
        <Input id="fullName" placeholder="John Doe" />
      </RegistrationField>

      <RegistrationField
        htmlFor="username"
        label="Username"
        description="Choose how your name will appear."
        contentClassName="w-full sm:max-w-xs"
      >
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="username" placeholder="johndoe" />
        </InputGroup>
      </RegistrationField>

      <RegistrationField
        htmlFor="email"
        label="Email"
        description="We will use this for registration updates."
        contentClassName="w-full sm:max-w-xs"
      >
        <Input id="email" type="email" placeholder="john@example.com" />
      </RegistrationField>

      <RegistrationField
        htmlFor="phone"
        label="Phone Number"
        description="Include a number where the team can reach you."
        contentClassName="w-full sm:max-w-xs"
      >
        <PhoneInput id="phone" defaultCountry="MM" />
      </RegistrationField>

      <RegistrationField
        label="Country"
        description="Select the country where you currently live."
        contentClassName="w-full sm:max-w-xs"
      >
        <CountrySelect value={country} onChange={onCountryChange} />
      </RegistrationField>

      <RegistrationField
        htmlFor="city"
        label="City"
        description="Enter your current city."
        contentClassName="w-full sm:max-w-xs"
      >
        <Input id="city" placeholder="Yangon" />
      </RegistrationField>

      <RegistrationField
        label="Timezone"
        description="Helps us coordinate meetings and volunteer work."
        contentClassName="w-full sm:max-w-sm"
      >
        <TimezoneSelect value={timezone} onChange={onTimezoneChange} />
      </RegistrationField>

      <RegistrationField
        htmlFor="bio"
        label="Short Bio"
        description="Share a brief introduction about yourself."
      >
        <Textarea
          id="bio"
          placeholder="Tell us a little bit about yourself..."
          className="resize-none"
          rows={4}
        />
      </RegistrationField>
    </FieldGroup>
  )
}
