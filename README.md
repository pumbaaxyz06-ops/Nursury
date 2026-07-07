# 🌱 Nursery Manager

Mobile-first nursery management platform for farmers (Gujarati-first).

**All screens are designed exclusively for mobile** — 420px container, 56px+ touch targets, big text, Gujarati + English.

## Quick Start

1. Copy environment variables:
```bash
cp .env.example .env.local
```

2. Add your MongoDB URI in `.env.local`

3. Seed demo data (highly recommended for testing):

```bash
npm run seed
```

This creates:
- Farmer login: Phone `9876543210` / Password `123456`
- 6 plant categories + 10 stock items

4. Run the dev server:
```bash
npm run dev
```

4. Seed demo user (from Login page):
   - Tap **"Create Demo Account (9876543210 / 123456)"**
   - Phone: `9876543210`
   - Password: `123456`

## Login Credentials (Demo Farmer)

**Use these to test as a farmer:**

- **Phone:** `9876543210`
- **Password:** `123456`

Run `npm run seed` first to populate categories and stock.

## Mobile Experience
- Fixed max-width container = phone size
- Large tap areas
- Bottom navigation
- Gujarati first language
- Works great on Android phones

## Key Screens (All mobile)
- Login
- Home (Category grid)
- Stock + Add/Edit
- New Sale + PDF Bill
- Bookings + Dispatch flow

See full spec in `NURSERY_MANAGEMENT_PLAN.md`.

Built exactly following the plan.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
