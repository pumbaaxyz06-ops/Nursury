// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment tag (development / production)
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,

  // Capture 100% of traces in dev, 10% in production (adjust for traffic)
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Enable structured logs in Sentry
  enableLogs: true,

  // Session Replay: 10% of sessions + 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],

  // Only send events when DSN is configured
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Useful for local debugging of the SDK itself
  debug: process.env.NODE_ENV === "development" && process.env.SENTRY_DEBUG === "true",
});

// Instrument App Router navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
