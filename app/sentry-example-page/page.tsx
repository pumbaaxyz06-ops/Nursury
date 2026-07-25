"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

/**
 * Verification page for Sentry integration.
 * Open http://localhost:3000/sentry-example-page after setting NEXT_PUBLIC_SENTRY_DSN.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
export default function SentryExamplePage() {
  const [apiResult, setApiResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const dsnConfigured = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

  const throwClientError = () => {
    Sentry.logger.info("User clicked client test error button");
    throw new Error("Sentry Test Error (client)");
  };

  const testApiError = async () => {
    setLoading(true);
    setApiResult("");
    try {
      const res = await fetch("/api/sentry-example-api");
      const data = await res.json();
      setApiResult(JSON.stringify(data, null, 2));
    } catch (e) {
      Sentry.captureException(e);
      setApiResult(String(e));
    }
    setLoading(false);
  };

  const sendLog = () => {
    Sentry.logger.info("Manual log from sentry-example-page", {
      source: "manual",
      ts: new Date().toISOString(),
    });
    Sentry.logger.warn("Sample warning log");
    Sentry.captureMessage("Sentry example message from Vriksh", "info");
    setApiResult("Logs + message sent (check Sentry Logs / Issues).");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FFF8] to-[#F1F8F4] px-6 py-10">
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-neutral-200 shadow-lg p-6 space-y-5">
        <div>
          <Link href="/home" className="text-sm font-semibold text-[#306D29] hover:underline">
            ← Back
          </Link>
          <h1 className="text-2xl font-extrabold text-neutral-900 mt-3">Sentry Test Page</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Use this page to verify error monitoring, logs, and API capture for Vriksh.
          </p>
        </div>

        <div
          className={`rounded-xl px-4 py-3 text-sm font-semibold border ${
            dsnConfigured
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          {dsnConfigured
            ? "DSN detected — events will be sent to Sentry."
            : "DSN not set. Add NEXT_PUBLIC_SENTRY_DSN (and SENTRY_DSN) in .env.local, then restart dev server."}
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={throwClientError}
            className="w-full h-12 rounded-xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #306D29, #4CAF50)" }}
          >
            Throw client error
          </button>

          <button
            type="button"
            onClick={testApiError}
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold border-2 border-[#306D29] text-[#306D29] bg-white disabled:opacity-60"
          >
            {loading ? "Calling API…" : "Trigger API error"}
          </button>

          <button
            type="button"
            onClick={sendLog}
            className="w-full h-12 rounded-xl font-bold border border-neutral-200 text-neutral-800 bg-neutral-50"
          >
            Send sample logs / message
          </button>
        </div>

        {apiResult && (
          <pre className="text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-3 overflow-auto max-h-48 text-neutral-700">
            {apiResult}
          </pre>
        )}

        <ol className="text-xs text-neutral-600 space-y-1 list-decimal list-inside">
          <li>Set DSN in <code className="font-mono">.env.local</code></li>
          <li>Restart <code className="font-mono">npm run dev</code></li>
          <li>Click the buttons above</li>
          <li>
            Open Sentry → <strong>Issues</strong> / <strong>Logs</strong> / <strong>Traces</strong>
          </li>
        </ol>
      </div>
    </div>
  );
}
