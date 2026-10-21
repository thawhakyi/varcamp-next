import { IconBrandTelegram } from "@tabler/icons-react"

import { Input } from "@workspace/ui/components/input"
import { FieldGroup } from "@workspace/ui/components/reui/field"

import { BorderDecorations } from "@/app/_components/border-decorations"
import type { RegistrationFieldErrors } from "@/lib/community-registration-schema"

import type { ContactPerson } from "./community-data"
import { LinkHandleInput } from "./link-handle-input"
import { RegistrationField } from "./registration-field"

type ContactPersonStepProps = {
  contact: ContactPerson
  errors: RegistrationFieldErrors
  onContactChange: (key: keyof ContactPerson, value: string) => void
}

export function ContactPersonStep({
  contact,
  errors,
  onContactChange,
}: ContactPersonStepProps) {
  const getError = (field: string) => errors[`contact.${field}`]

  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        <RegistrationField
          htmlFor="contactName"
          label="Contact Person Name"
          required
          contentClassName="sm:max-w-xs"
          error={getError("name")}
          errorId="contactName-error"
        >
          <Input
            id="contactName"
            name="contactName"
            autoComplete="name"
            placeholder="John Doe"
            value={contact.name}
            maxLength={120}
            onChange={(event) => onContactChange("name", event.target.value)}
            required
            aria-invalid={Boolean(getError("name"))}
            aria-describedby={
              getError("name") ? "contactName-error" : undefined
            }
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
            value={contact.email}
            maxLength={254}
            onChange={(event) => onContactChange("email", event.target.value)}
            required
            aria-invalid={Boolean(getError("email"))}
            aria-describedby={getError("email") ? "email-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="telegram"
          label="Telegram"
          required
          contentClassName="sm:max-w-xs"
        >
          <LinkHandleInput
            id="telegram"
            icon={IconBrandTelegram}
            prefix="t.me/"
            placeholder="username"
            value={contact.telegram}
            error={getError("telegram")}
            onValueChange={(value) => onContactChange("telegram", value)}
          />
        </RegistrationField>
      </FieldGroup>
    </div>
  )
}
