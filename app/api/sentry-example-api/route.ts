import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Test API that always throws — used to verify server-side Sentry capture.
 * Visit: POST /api/sentry-example-api
 */
export async function GET() {
  Sentry.logger.info("sentry-example-api hit", { route: "/api/sentry-example-api" });

  try {
    throw new Error("Sentry Example API Error");
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Example API error was captured by Sentry (if DSN is configured). Check Issues in your Sentry project.",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
