import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: process.env.SECUREDOCS_STANDALONE === "1" ? "standalone" : undefined,
  outputFileTracingExcludes: { "/*": ["./.data/**/*", "./.env*", "./tidecloak.json"] },
};

export default nextConfig;
