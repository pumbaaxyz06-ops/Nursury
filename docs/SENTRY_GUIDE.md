# Vriksh Platform — Sentry Integration & Alerting Guide

This document explains **how Sentry is integrated** in this nursery management platform, **how to check any error or important action**, and **how to send alerts to Slack** (or other channels).

Official reference: [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

## Table of contents

1. [What Sentry gives us](#1-what-sentry-gives-us)
2. [What is already set up in this repo](#2-what-is-already-set-up-in-this-repo)
3. [Step-by-step: connect your Sentry project](#3-step-by-step-connect-your-sentry-project)
4. [How to verify errors & actions](#4-how-to-verify-errors--actions)
5. [How to check errors in the Sentry dashboard](#5-how-to-check-errors-in-the-sentry-dashboard)
6. [How to log errors/actions from code](#6-how-to-log-errorsactions-from-code)
7. [Send alerts to Slack](#7-send-alerts-to-slack)
8. [Other channels (Email, Discord, Microsoft Teams, PagerDuty)](#8-other-channels-email-discord-microsoft-teams-pagerduty)
9. [Recommended alert rules for Vriksh](#9-recommended-alert-rules-for-vriksh)
10. [Production checklist](#10-production-checklist)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. What Sentry gives us

| Feature | What it does for Vriksh |
|--------|-------------------------|
| **Error Monitoring (Issues)** | Crashes, uncaught exceptions, API 500s appear with stack traces |
| **Logs** | Structured logs (`info` / `warn` / `error`) from app code |
| **Tracing** | Slow pages/API routes, request timelines |
| **Session Replay** | Video-like replay of the user session when an error happens (text/inputs masked) |
| **Alerts** | Push notifications to Slack, email, Discord, etc. when something breaks |

Sentry is **not** a full product analytics tool. Use it for **failures, exceptions, and operational signals**, not normal button-click marketing analytics.

---

## 2. What is already set up in this repo

We use the official **Next.js App Router** manual setup (`@sentry/nextjs`).

### Key files

| File | Role |
|------|------|
| `instrumentation-client.ts` | Browser (client) SDK — UI errors, replay, router transitions |
| `sentry.server.config.ts` | Node.js server SDK — API routes, server components |
| `sentry.edge.config.ts` | Edge runtime SDK |
| `instrumentation.ts` | Registers server/edge configs + `onRequestError` |
| `next.config.ts` | `withSentryConfig` — source maps, tunnel `/sentry-tunnel` |
| `app/global-error.tsx` | Captures React root render crashes |
| `lib/sentry.ts` | Helpers: `captureError`, `captureMessage`, `setUserContext` |
| `app/sentry-example-page/page.tsx` | Manual test UI |
| `app/api/sentry-example-api/route.ts` | Manual test API error |

### Already wired examples

- MongoDB connection failures → `captureError` in `lib/db.ts`
- Register API failures → `captureError` in `app/api/auth/register/route.ts`
- Logged-in user context → synced in `components/SessionProvider.tsx`

### Environment variables

Configured in `.env.example` / `.env.local`:

```env
# Required for events to leave the machine
NEXT_PUBLIC_SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>
SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>

# Labels events in Sentry (filter by environment)
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
SENTRY_ENVIRONMENT=development

# Optional: readable stack traces on production builds
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_...

# Optional: verbose SDK debug logs in terminal
# SENTRY_DEBUG=true
```

> **Important:** Until `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` are set, the SDK stays **disabled** and does not send events. That is intentional so local dev without Sentry does not fail.

---

## 3. Step-by-step: connect your Sentry project

### Step 1 — Create a Sentry account & project

1. Go to [https://sentry.io](https://sentry.io) and sign up / log in.
2. Create an **Organization** (if new).
3. Create a **Project**:
   - Platform: **Next.js**
   - Name example: `vriksh-nursery` or `nursury-latest`
4. After creation, open:

   **Settings → Projects → [Your Project] → Client Keys (DSN)**

5. Copy the **DSN** URL. It looks like:

   ```text
   https://abc123def@o450000000.ingest.sentry.io/450000000
   ```

### Step 2 — Add DSN to the app

Edit `.env.local` in the project root:

```env
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@oYOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
SENTRY_DSN=https://YOUR_KEY@oYOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
SENTRY_ENVIRONMENT=development
```

Use the **same DSN** for both variables (client + server).

### Step 3 — Restart the Next.js server

Env vars are read at process start:

```bash
# Stop the running server (Ctrl+C), then:
npm run dev
```

### Step 4 — (Optional) Source maps for production

For readable production stack traces:

1. In Sentry: **Settings → Auth Tokens** → create a token with `project:releases` / source maps scopes.
2. Set in CI / production build env only (never commit):

```env
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_...
```

`next.config.ts` already passes these into `withSentryConfig`.

---

## 4. How to verify errors & actions

### A. Use the built-in test page (recommended)

1. Start the app: `npm run dev`
2. Open: [http://localhost:3000/sentry-example-page](http://localhost:3000/sentry-example-page)
3. Confirm the green banner: **“DSN detected — events will be sent to Sentry.”**  
   If amber/warning: DSN is missing or server not restarted.
4. Click:

| Button | What it tests |
|--------|----------------|
| **Throw client error** | Browser / React client-side crash |
| **Trigger API error** | Server API exception (`/api/sentry-example-api`) |
| **Send sample logs / message** | Structured logs + captureMessage |

### B. Do not test only from browser DevTools console

Errors thrown only in the browser console are **sandboxed** and often **do not** reach Sentry. Always use the test page buttons or real app code.

### C. Wait a few seconds

Events usually appear in Sentry within **~10–60 seconds**. Refresh Issues if needed.

### D. Trigger a real platform failure (optional)

Examples that already report (when DSN is set):

- Invalid MongoDB URI → DB connect error tagged `area=database`
- Register API unexpected 500 → tagged `area=auth`

---

## 5. How to check errors in the Sentry dashboard

Log in at [https://sentry.io](https://sentry.io) and open your project.

### Issues (errors & exceptions)

**Path:** Project → **Issues**

You will see:

- Error title (e.g. `Error: Sentry Test Error (client)`)
- Count, first/last seen
- Environment (`development` / `production`)
- Stack trace (file + line when source maps work)
- Breadcrumbs (clicks, navigations, network)
- User context (if logged in — id / nursery)
- Tags (`area`, `action`, etc.)

Click an issue → **Activity**, **Tags**, **Breadcrumbs**, **Replay** (if available).

### Logs

**Path:** **Explore → Logs** (or project Logs)

Shows:

```text
Sentry.logger.info(...)
Sentry.logger.warn(...)
Sentry.logger.error(...)
```

Useful for “something happened” without a full crash (e.g. sale completed, stock low).

### Traces / Performance

**Path:** **Explore → Traces** (or Performance)

Shows page loads and API request spans. Helps find slow `/api/sales` or `/api/stock` calls.

### Session Replay

**Path:** **Replays**

Video-like session around the error (privacy masks enabled in our client config).

### Filter tips for Vriksh

| Want to see… | Filter / tip |
|--------------|--------------|
| Only production | Environment = `production` |
| Only DB issues | Tag `area:database` |
| Only auth | Tag `area:auth` |
| Today’s spikes | Issues sorted by last seen / event count |
| One user | User id on the issue (when logged in) |

---

## 6. How to log errors/actions from code

Use helpers from `lib/sentry.ts` so reporting stays consistent.

### Capture an exception (API / try-catch)

```ts
import { captureError } from "@/lib/sentry";

try {
  // business logic
} catch (e) {
  captureError(e, {
    tags: { area: "sales", action: "create" },
    extra: { customerName: body.customer_name },
  });
  return NextResponse.json({ error: "Failed" }, { status: 500 });
}
```

### Capture a non-crash message / action

```ts
import { captureMessage, Sentry } from "@/lib/sentry";

// Simple message → appears under Issues (level info/warning/error)
captureMessage("Large sale completed", "info", {
  bill_number: sale.bill_number,
  amount: sale.final_amount,
});

// Structured logs → Explore → Logs
Sentry.logger.info("Sale completed", {
  bill: sale.bill_number,
  amount: sale.final_amount,
});
Sentry.logger.warn("Low stock after sale", { stockId, remaining });
Sentry.logger.error("Payment step failed", { reason: "timeout" });
```

### Suggested `area` tags for this app

| area | Examples |
|------|----------|
| `auth` | login, register |
| `database` | Mongo connect, query failures |
| `stock` | add/edit/delete stock |
| `sales` | create sale, bill PDF |
| `bookings` | booking create/dispatch |
| `categories` | category CRUD |

### When to use what

| Situation | Use |
|-----------|-----|
| Unexpected exception / 500 | `captureError` / `captureException` |
| Important business event (optional) | `Sentry.logger.info` or `captureMessage` |
| Slow path you care about | `Sentry.startSpan({ name, op }, async () => { ... })` |

Do **not** log passwords, full payment secrets, or raw OTPs to Sentry.

---

## 7. Send alerts to Slack

Sentry does **not** hard-code Slack inside our Next.js code.  
You connect Slack in the **Sentry UI**, then create **Alert Rules** that push to a channel when Issues match.

Docs: [Sentry Slack integration](https://docs.sentry.io/organization/integrations/notification-incidents/slack/)

### Step 1 — Install Slack integration

1. Open Sentry → **Settings → Integrations → Slack**
2. Click **Add Workspace**
3. Approve the Slack workspace permissions
4. For **private** channels: invite the bot in Slack:

   ```text
   @sentry
   ```

   (or add the Sentry app from channel settings → Integrations)

### Step 2 — Link your personal Slack (optional)

In any Slack channel:

```text
/sentry link
```

This enables personal DMs and better identity mapping.

### Step 3 — Create an Issue Alert that posts to Slack

1. Go to your project → **Alerts → Create Alert** (or **Settings → Alerts**)
2. Choose **Issues** alert (error-based)
3. Example conditions (good defaults):

   - **When:** A new issue is created  
     **OR** An issue changes state from resolved to unresolved  
     **OR** Number of events in an issue is more than `10` in `1 hour`
   - **Filter (optional):** Environment is `production`
   - **Then:** **Send a Slack notification**
     - Workspace: your Slack workspace  
     - Channel: `#vriksh-alerts` (or your channel)  
     - Optional tags to show: `area`, `environment`, `url`

4. Click **Send Test Notification** to verify Slack receives a sample message.
5. Save the rule.

### Step 4 — What you get in Slack

Typical Slack card includes:

- Error title
- Project + environment
- Link to open the full issue in Sentry
- Actions like **Resolve** / **Archive** / **Assign** (from Slack)

### Private channel checklist

If alert save fails with “channel does not exist or has not been granted access”:

1. Open the Slack channel → **Integrations** → ensure **Sentry** is listed  
2. Or type `@sentry` in the channel and invite the app  
3. Retry selecting the channel in the alert rule  

---

## 8. Other channels (Email, Discord, Microsoft Teams, PagerDuty)

Same pattern: **Integrations → install → Alert Rule → Action**.

| Channel | Where in Sentry | Notes |
|---------|-----------------|-------|
| **Email** | Built-in action on alert rules | Easiest; no integration install for team emails |
| **Discord** | Settings → Integrations → Discord | Pick server + channel in alert action |
| **Microsoft Teams** | Integrations → MS Teams | Similar channel selection |
| **PagerDuty** | Integrations → PagerDuty | Good for on-call / critical only |
| **Webhook** | Alert action → Webhook | Custom systems (internal bots, custom apps) |

### Email-only quick path (no Slack)

1. **Alerts → Create Alert → Issues**
2. Condition: new issue / high frequency
3. Action: **Send a notification via email**
4. Add team members’ emails or project members

---

## 9. Recommended alert rules for Vriksh

Create these in Sentry after Slack (or email) is connected.

### Rule A — Production crash (high priority)

- **Environment:** `production`
- **When:** New issue created
- **Then:** Slack `#vriksh-alerts` + email owners
- **Why:** Any new crash in live app

### Rule B — Spike / regression

- **When:** Number of events in an issue is more than **20** in **30 minutes**
- **Environment:** `production`
- **Then:** Slack
- **Why:** Login/DB outage patterns (e.g. Mongo `bad auth` flood)

### Rule C — Critical areas only (optional)

- **Filter:** Tag `area` is one of `database`, `auth`, `sales`
- **When:** New issue
- **Then:** Slack
- **Why:** Money + access paths first

### Rule D — Quiet development (optional)

- Either **do not** alert on `development`, or use a separate low-priority channel `#vriksh-dev-sentry`
- Keep production alerts noise-free

### Suggested Slack channels

| Channel | Purpose |
|---------|---------|
| `#vriksh-alerts` | Production errors only |
| `#vriksh-dev-sentry` | Optional local/staging noise |

---

## 10. Production checklist

- [ ] `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` set on host (Vercel / server)
- [ ] `SENTRY_ENVIRONMENT` / `NEXT_PUBLIC_SENTRY_ENVIRONMENT` = `production`
- [ ] Slack (or email) integration installed
- [ ] At least one **production** alert rule active
- [ ] Test notification received in Slack
- [ ] Source maps: `SENTRY_AUTH_TOKEN` + org + project on CI build
- [ ] Decide whether to keep `/sentry-example-page` public (disable or protect in prod if needed)
- [ ] Sample rates: prod uses lower `tracesSampleRate` (already `0.1` in config)

Deploy env example:

```env
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_ENVIRONMENT=production
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...
```

---

## 11. Troubleshooting

| Problem | Fix |
|---------|-----|
| No events in Sentry | Set DSN in `.env.local`, restart `npm run dev` |
| Test page shows DSN not set | `NEXT_PUBLIC_*` missing or server not restarted |
| Console `throw` not appearing | Use `/sentry-example-page` buttons instead |
| Slack alert not delivering | Invite `@sentry` to channel; re-test alert |
| Too many alerts | Filter by `production` only; raise thresholds |
| Stack traces minified | Set `SENTRY_AUTH_TOKEN` + org/project on build |
| Ad-blocker blocking browser events | Tunnel is enabled: `/sentry-tunnel` in `next.config.ts` |
| SDK debug | Set `SENTRY_DEBUG=true` temporarily |

---

## Quick reference commands

```bash
# Install (already done in this repo)
npm install @sentry/nextjs --save

# Run app
npm run dev

# Open test page
# http://localhost:3000/sentry-example-page

# Open Sentry
# https://sentry.io → Issues / Logs / Traces / Replays
```

---

## Architecture overview

```text
┌─────────────────────┐     ┌──────────────────────┐
│  Browser (UI)       │     │  Next.js Server/API  │
│  instrumentation-   │     │  sentry.server.config│
│  client.ts          │     │  instrumentation.ts  │
└──────────┬──────────┘     └──────────┬───────────┘
           │                           │
           │     DSN + tunnel          │
           └───────────┬───────────────┘
                       ▼
              ┌─────────────────┐
              │  Sentry.io      │
              │  Issues/Logs/   │
              │  Traces/Replay  │
              └────────┬────────┘
                       │  Alert Rules
           ┌───────────┼───────────┐
           ▼           ▼           ▼
        Slack       Email       Discord / PD
```

---

## Summary

1. **Integration** is already in the codebase; you only need a **DSN** in `.env.local`.
2. **Check errors** in Sentry → **Issues**, **Logs**, **Traces**, **Replays**.
3. **Verify** with `/sentry-example-page`.
4. **Slack alerts** = Sentry Integration + Alert Rule → channel (no extra app code required).
5. Use `lib/sentry.ts` helpers to report custom failures with tags like `area=sales`.

For deeper SDK options, see:

- [Next.js setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Manual setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Slack integration](https://docs.sentry.io/organization/integrations/notification-incidents/slack/)
- [Alerts product docs](https://docs.sentry.io/product/alerts/)
