import type { ReactNode } from "react"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/reui/field"

type RegistrationFieldProps = {
  children: ReactNode
  contentClassName?: string
  description?: string
  error?: string
  errorId?: string
  htmlFor?: string
  label: string
  labelId?: string
  required?: boolean
}

export function RegistrationField({
  children,
  contentClassName,
  description,
  error,
  errorId,
  htmlFor,
  label,
  labelId,
  required,
}: RegistrationFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldContent>
        <FieldLabel id={labelId} htmlFor={htmlFor}>
          <span>
            {label}
            {required && (
              <span aria-hidden="true" className="text-destructive">
                {" "}
                *
              </span>
            )}
          </span>
        </FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <FieldContent className={contentClassName}>
        {children}
        <FieldError id={errorId}>{error}</FieldError>
      </FieldContent>
    </Field>
  )
}
