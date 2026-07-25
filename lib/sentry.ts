/**
 * Thin helpers for manual Sentry reporting across the Vriksh platform.
 * Safe no-ops when DSN is not configured.
 */
import * as Sentry from "@sentry/nextjs";

export function captureError(
  error: unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: Sentry.SeverityLevel;
  }
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([k, v]) => scope.setTag(k, v));
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([k, v]) => scope.setExtra(k, v));
    }
    if (context?.level) {
      scope.setLevel(context.level);
    }
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(String(error)));
    }
  });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  extra?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    if (extra) {
      Object.entries(extra).forEach(([k, v]) => scope.setExtra(k, v));
    }
    Sentry.captureMessage(message, level);
  });
}

/** Attach logged-in nursery user context for better issue grouping */
export function setUserContext(user?: {
  id?: string;
  name?: string | null;
  phone?: string | null;
  nursery_name?: string | null;
} | null) {
  if (!user?.id) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({
    id: user.id,
    username: user.name || undefined,
    // Avoid sending full phone as PII if not needed; keep partial for support
    data: {
      nursery_name: user.nursery_name || undefined,
    },
  });
}

export { Sentry };
