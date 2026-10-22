import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  outputFileTracingExcludes: { "/*": ["./.data/**/*", "./.env*"] },
};

export default nextConfig;
