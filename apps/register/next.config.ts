import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["google-auth-library"],
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig
