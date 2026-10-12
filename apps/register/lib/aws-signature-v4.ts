import { createHash, createHmac } from "node:crypto"

type AwsAuthorizationInput = {
  accessKeyId: string
  // Compact ISO 8601 timestamp, for example 20260101T000000Z.
  amzDate: string
  // Every header sent with the request that should be signed, including host.
  headers: Record<string, string>
  method: string
  // Already URI-encoded, without a query string.
  path: string
  payloadHash: string
  region: string
  secretAccessKey: string
  service: string
}

export function sha256Hex(data: string | Uint8Array) {
  return createHash("sha256").update(data).digest("hex")
}

// AWS Signature Version 4, which Cloudflare R2 accepts on its S3 API.
export function createAwsAuthorization({
  accessKeyId,
  amzDate,
  headers,
  method,
  path,
  payloadHash,
  region,
  secretAccessKey,
  service,
}: AwsAuthorizationInput) {
  const dateStamp = amzDate.slice(0, 8)
  const sortedHeaders = Object.entries(headers)
    .map(([name, value]) => [name.toLowerCase(), value.trim()] as const)
    .sort(([first], [second]) => (first < second ? -1 : 1))
  const signedHeaders = sortedHeaders.map(([name]) => name).join(";")
  const canonicalRequest = [
    method,
    path,
    "",
    sortedHeaders.map(([name, value]) => `${name}:${value}\n`).join(""),
    signedHeaders,
    payloadHash,
  ].join("\n")
  const scope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256Hex(canonicalRequest),
  ].join("\n")
  const signingKey = [dateStamp, region, service, "aws4_request"].reduce<
    string | Buffer
  >(
    (key, part) => createHmac("sha256", key).update(part).digest(),
    `AWS4${secretAccessKey}`
  )
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex")

  return `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}
