import { useRef } from "react"
import {
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandYoutube,
  type Icon,
} from "@tabler/icons-react"
import { ImageUpIcon, XIcon } from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@workspace/ui/components/attachment"
import { Input } from "@workspace/ui/components/input"
import { FieldGroup } from "@workspace/ui/components/reui/field"
import { Textarea } from "@workspace/ui/components/textarea"

import { BorderDecorations } from "@/app/_components/border-decorations"
import type { RegistrationFieldErrors } from "@/lib/community-registration-schema"

import {
  logoAcceptedTypes,
  socialLinkFields,
  type CommunityLogo,
  type CommunityProfile,
  type SocialLinkKey,
} from "./community-data"
import { LinkHandleInput } from "./link-handle-input"
import { RegistrationField } from "./registration-field"

const socialLinkIcons: Record<SocialLinkKey, Icon> = {
  facebook: IconBrandFacebook,
  linkedin: IconBrandLinkedin,
  x: IconBrandX,
  youtube: IconBrandYoutube,
}

const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

type CommunityProfileStepProps = {
  errors: RegistrationFieldErrors
  logo: CommunityLogo | null
  onLogoChange: (file: File | null) => void
  onProfileChange: (key: keyof CommunityProfile, value: string) => void
  profile: CommunityProfile
}

export function CommunityProfileStep({
  errors,
  logo,
  onLogoChange,
  onProfileChange,
  profile,
}: CommunityProfileStepProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const getError = (field: string) => errors[`profile.${field}`]

  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        <RegistrationField
          htmlFor="communityName"
          label="Name of Community/Organization"
          required
          contentClassName="sm:max-w-xs"
          error={getError("name")}
          errorId="communityName-error"
        >
          <Input
            id="communityName"
            name="communityName"
            autoComplete="organization"
            value={profile.name}
            maxLength={150}
            onChange={(event) => onProfileChange("name", event.target.value)}
            required
            aria-invalid={Boolean(getError("name"))}
            aria-describedby={
              getError("name") ? "communityName-error" : undefined
            }
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="about"
          label="About the Community/Organization"
          required
          description="What your community does and who it serves. 2–4 sentences."
          error={getError("about")}
          errorId="about-error"
        >
          <Textarea
            id="about"
            name="about"
            className="resize-y"
            rows={6}
            value={profile.about}
            maxLength={1500}
            onChange={(event) => onProfileChange("about", event.target.value)}
            required
            aria-invalid={Boolean(getError("about"))}
            aria-describedby={getError("about") ? "about-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          label="Logo"
          required
          description="A square logo on a plain background works best."
          labelId="logo-label"
          error={getError("logo")}
          errorId="logo-error"
        >
          <input
            ref={logoInputRef}
            type="file"
            name="logo"
            accept={logoAcceptedTypes.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              onLogoChange(event.target.files?.[0] ?? null)
              event.target.value = ""
            }}
          />
          {logo ? (
            <Attachment state="done" className="w-full sm:max-w-xs">
              <AttachmentMedia variant="image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.previewUrl} alt="" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{logo.file.name}</AttachmentTitle>
                <AttachmentDescription>
                  {formatFileSize(logo.file.size)}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  type="button"
                  aria-label="Remove logo"
                  onClick={() => onLogoChange(null)}
                >
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ) : (
            <Attachment
              state={getError("logo") ? "error" : "idle"}
              className="w-full sm:max-w-xs"
            >
              <AttachmentMedia>
                <ImageUpIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>Choose a logo</AttachmentTitle>
                <AttachmentDescription>
                  JPG, PNG, or WebP, up to 5 MB
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentTrigger
                aria-labelledby="logo-label"
                aria-describedby={getError("logo") ? "logo-error" : undefined}
                onClick={() => logoInputRef.current?.click()}
              />
            </Attachment>
          )}
        </RegistrationField>

        <RegistrationField
          htmlFor="website"
          label="Website"
          contentClassName="sm:max-w-xs"
          error={getError("website")}
          errorId="website-error"
        >
          <Input
            id="website"
            name="website"
            type="url"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="example.com"
            value={profile.website}
            maxLength={300}
            onChange={(event) => onProfileChange("website", event.target.value)}
            aria-invalid={Boolean(getError("website"))}
            aria-describedby={getError("website") ? "website-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          label="Social Profiles"
          contentClassName="gap-2 sm:max-w-sm"
        >
          {socialLinkFields.map((field) => (
            <LinkHandleInput
              key={field.key}
              id={field.key}
              label={field.label}
              icon={socialLinkIcons[field.key]}
              prefix={field.prefix}
              placeholder={field.placeholder}
              value={profile[field.key]}
              error={getError(field.key)}
              onValueChange={(value) => onProfileChange(field.key, value)}
            />
          ))}
        </RegistrationField>
      </FieldGroup>
    </div>
  )
}
