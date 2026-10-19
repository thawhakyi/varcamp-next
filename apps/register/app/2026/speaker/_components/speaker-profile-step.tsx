import { useRef } from "react"
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandLinkedin,
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
import type { RegistrationFieldErrors } from "@/lib/speaker-registration-schema"

import { LinkHandleInput } from "./link-handle-input"
import { RegistrationField } from "./registration-field"
import {
  profilePhotoAcceptedTypes,
  socialLinkFields,
  type ProfilePhoto,
  type SocialLinkKey,
  type SpeakerProfile,
} from "./speaker-data"

const socialLinkIcons: Record<SocialLinkKey, Icon> = {
  linkedin: IconBrandLinkedin,
  facebook: IconBrandFacebook,
  youtube: IconBrandYoutube,
  github: IconBrandGithub,
}

const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

type SpeakerProfileStepProps = {
  errors: RegistrationFieldErrors
  onProfileChange: (key: keyof SpeakerProfile, value: string) => void
  onProfilePhotoChange: (file: File | null) => void
  profile: SpeakerProfile
  profilePhoto: ProfilePhoto | null
}

export function SpeakerProfileStep({
  errors,
  onProfileChange,
  onProfilePhotoChange,
  profile,
  profilePhoto,
}: SpeakerProfileStepProps) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const getError = (field: string) => errors[`profile.${field}`]

  return (
    <div className="relative w-full p-6 md:p-8">
      <BorderDecorations />
      <FieldGroup>
        <RegistrationField
          htmlFor="jobTitle"
          label="Job Title"
          contentClassName="sm:max-w-xs"
          error={getError("jobTitle")}
          errorId="jobTitle-error"
        >
          <Input
            id="jobTitle"
            name="jobTitle"
            autoComplete="organization-title"
            value={profile.jobTitle}
            maxLength={120}
            onChange={(event) =>
              onProfileChange("jobTitle", event.target.value)
            }
            aria-invalid={Boolean(getError("jobTitle"))}
            aria-describedby={
              getError("jobTitle") ? "jobTitle-error" : undefined
            }
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="company"
          label="Company/Organization"
          contentClassName="sm:max-w-xs"
          error={getError("company")}
          errorId="company-error"
        >
          <Input
            id="company"
            name="company"
            autoComplete="organization"
            value={profile.company}
            maxLength={120}
            onChange={(event) => onProfileChange("company", event.target.value)}
            aria-invalid={Boolean(getError("company"))}
            aria-describedby={getError("company") ? "company-error" : undefined}
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="biography"
          label="Biography"
          description="2–4 sentences about you, written in third person."
          error={getError("biography")}
          errorId="biography-error"
        >
          <Textarea
            id="biography"
            name="biography"
            className="resize-y"
            rows={6}
            value={profile.biography}
            maxLength={1500}
            onChange={(event) =>
              onProfileChange("biography", event.target.value)
            }
            aria-invalid={Boolean(getError("biography"))}
            aria-describedby={
              getError("biography") ? "biography-error" : undefined
            }
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="aiWorkflow"
          label="How are you using AI/Tech in your daily workflow?"
          description="Tools, habits, or projects — a few sentences is enough."
          error={getError("aiWorkflow")}
          errorId="aiWorkflow-error"
        >
          <Textarea
            id="aiWorkflow"
            name="aiWorkflow"
            className="resize-y"
            rows={4}
            value={profile.aiWorkflow}
            maxLength={1500}
            onChange={(event) =>
              onProfileChange("aiWorkflow", event.target.value)
            }
            aria-invalid={Boolean(getError("aiWorkflow"))}
            aria-describedby={
              getError("aiWorkflow") ? "aiWorkflow-error" : undefined
            }
          />
        </RegistrationField>

        <RegistrationField
          label="Profile Photo"
          description="A square photo of your face works best."
          labelId="profilePhoto-label"
          error={getError("photo")}
          errorId="profilePhoto-error"
        >
          <input
            ref={photoInputRef}
            type="file"
            name="profilePhoto"
            accept={profilePhotoAcceptedTypes.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              onProfilePhotoChange(event.target.files?.[0] ?? null)
              event.target.value = ""
            }}
          />
          {profilePhoto ? (
            <Attachment state="done" className="w-full sm:max-w-xs">
              <AttachmentMedia variant="image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profilePhoto.previewUrl} alt="" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{profilePhoto.file.name}</AttachmentTitle>
                <AttachmentDescription>
                  {formatFileSize(profilePhoto.file.size)}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  type="button"
                  aria-label="Remove profile photo"
                  onClick={() => onProfilePhotoChange(null)}
                >
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ) : (
            <Attachment
              state={getError("photo") ? "error" : "idle"}
              className="w-full sm:max-w-xs"
            >
              <AttachmentMedia>
                <ImageUpIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>Choose a photo</AttachmentTitle>
                <AttachmentDescription>
                  JPG, PNG, or WebP, up to 5 MB
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentTrigger
                aria-labelledby="profilePhoto-label"
                aria-describedby={
                  getError("photo") ? "profilePhoto-error" : undefined
                }
                onClick={() => photoInputRef.current?.click()}
              />
            </Attachment>
          )}
        </RegistrationField>

        <RegistrationField
          label="Social Links"
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
