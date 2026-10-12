import { IconBrandTelegram } from "@tabler/icons-react"

import { Input } from "@workspace/ui/components/input"
import { FieldGroup } from "@workspace/ui/components/reui/field"
import { PhoneInput } from "@workspace/ui/components/reui/phone-input"

import { BorderDecorations } from "@/app/_components/border-decorations"
import type { RegistrationFieldErrors } from "@/lib/speaker-registration-schema"

import { LinkHandleInput } from "./link-handle-input"
import { RegistrationField } from "./registration-field"
import type { GeneralInformation } from "./speaker-data"

type GeneralInformationStepProps = {
  errors: RegistrationFieldErrors
  information: GeneralInformation
  onInformationChange: (key: keyof GeneralInformation, value: string) => void
}

export function GeneralInformationStep({
  errors,
  information,
  onInformationChange,
}: GeneralInformationStepProps) {
  const getError = (field: string) => errors[`generalInformation.${field}`]

  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        <RegistrationField
          htmlFor="name"
          label="Name"
          required
          description="As it should appear on the schedule."
          contentClassName="sm:max-w-xs"
          error={getError("name")}
          errorId="name-error"
        >
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="John Doe"
            value={information.name}
            maxLength={120}
            onChange={(event) =>
              onInformationChange("name", event.target.value)
            }
            required
            aria-invalid={Boolean(getError("name"))}
            aria-describedby={getError("name") ? "name-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="email"
          label="Email"
          required
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
          label="Phone"
          required
          contentClassName="sm:max-w-xs"
          error={getError("phone")}
          errorId="phone-error"
        >
          <PhoneInput
            id="phone"
            name="phone"
            autoComplete="tel"
            defaultCountry="MM"
            placeholder="9 123 456 789"
            value={information.phone}
            onChange={(value) => onInformationChange("phone", value)}
            required
            aria-invalid={Boolean(getError("phone"))}
            aria-describedby={getError("phone") ? "phone-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="telegram"
          label="Telegram"
          contentClassName="sm:max-w-xs"
        >
          <LinkHandleInput
            id="telegram"
            icon={IconBrandTelegram}
            prefix="t.me/"
            placeholder="username"
            value={information.telegram}
            error={getError("telegram")}
            onValueChange={(value) => onInformationChange("telegram", value)}
          />
        </RegistrationField>
      </FieldGroup>
    </div>
  )
}
