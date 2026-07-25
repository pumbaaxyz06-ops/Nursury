"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Captures React render errors that bubble to the root of the App Router.
 * Required for Sentry to report unhandled UI crashes.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F1F8F4] px-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-lg p-8 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-extrabold text-neutral-900">Something went wrong</h1>
          <p className="text-sm text-neutral-600">
            An unexpected error occurred. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-neutral-400">Ref: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #306D29, #4CAF50)" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
