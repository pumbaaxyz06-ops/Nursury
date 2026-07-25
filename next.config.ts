import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Sentry organization & project (set in env / CI)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps (never commit this)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser events through your Next.js server (avoids ad-blockers)
  tunnelRoute: "/sentry-tunnel",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Tree-shake Sentry logger statements in production builds
  disableLogger: true,
});
