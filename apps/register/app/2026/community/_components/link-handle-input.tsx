import type { Icon } from "@tabler/icons-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { FieldError } from "@workspace/ui/components/reui/field"

import { extractLinkHandle } from "./community-data"

type LinkHandleInputProps = {
  error?: string
  icon: Icon
  id: string
  label?: string
  onValueChange: (value: string) => void
  placeholder: string
  prefix: string
  value: string
}

export function LinkHandleInput({
  error,
  icon: LinkIcon,
  id,
  label,
  onValueChange,
  placeholder,
  prefix,
  value,
}: LinkHandleInputProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>
            <LinkIcon aria-hidden="true" stroke={1.8} />
            {prefix}
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          name={id}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          maxLength={120}
          onChange={(event) =>
            onValueChange(event.target.value.replace(/^@/, ""))
          }
          onPaste={(event) => {
            const handle = extractLinkHandle(
              event.clipboardData.getData("text"),
              prefix
            )

            if (handle !== undefined) {
              event.preventDefault()
              onValueChange(handle)
            }
          }}
          aria-label={label}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
      </InputGroup>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
