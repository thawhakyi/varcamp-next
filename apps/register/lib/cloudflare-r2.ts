import "server-only"

import { createAwsAuthorization, sha256Hex } from "@/lib/aws-signature-v4"

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  const bucket = process.env.R2_BUCKET?.trim()
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim()

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Cloudflare R2 environment variables are not configured.")
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl }
}

type ImageUpload = {
  contentType: string
  extension: string
  image: Blob
}

type SpeakerProfilePhotoUpload = Omit<ImageUpload, "image"> & {
  photo: Blob
}

type CommunityLogoUpload = Omit<ImageUpload, "image"> & {
  logo: Blob
}

export async function uploadSpeakerProfilePhoto({
  photo,
  ...upload
}: SpeakerProfilePhotoUpload) {
  return uploadImage("speaker-photos", { ...upload, image: photo })
}

export async function uploadCommunityLogo({
  logo,
  ...upload
}: CommunityLogoUpload) {
  return uploadImage("community-logos", { ...upload, image: logo })
}

// Returns the public link to the uploaded image, or its object key when the
// bucket has no public URL configured.
async function uploadImage(
  folder: string,
  { contentType, extension, image }: ImageUpload
) {
  const { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl } =
    getR2Config()
  const body = new Uint8Array(await image.arrayBuffer())
  const now = new Date()
  // Only URL-safe characters, so the key needs no encoding when signing.
  const key = `${folder}/${now
    .toISOString()
    .replace(/[:.]/g, "-")}-${crypto.randomUUID()}.${extension}`
  const host = `${accountId}.r2.cloudflarestorage.com`
  const path = `/${bucket}/${key}`
  const signedHeaders = {
    "content-type": contentType,
    "x-amz-content-sha256": sha256Hex(body),
    "x-amz-date": now.toISOString().replace(/[-:]|\.\d{3}/g, ""),
  }
  const response = await fetch(`https://${host}${path}`, {
    method: "PUT",
    headers: {
      ...signedHeaders,
      Authorization: createAwsAuthorization({
        accessKeyId,
        amzDate: signedHeaders["x-amz-date"],
        headers: { ...signedHeaders, host },
        method: "PUT",
        path,
        payloadHash: signedHeaders["x-amz-content-sha256"],
        region: "auto",
        secretAccessKey,
        service: "s3",
      }),
    },
    body,
  })

  if (!response.ok) {
    throw new Error(
      `Cloudflare R2 upload failed with status ${response.status}: ${await response.text()}`
    )
  }

  return publicBaseUrl ? `${publicBaseUrl.replace(/\/+$/, "")}/${key}` : key
}
