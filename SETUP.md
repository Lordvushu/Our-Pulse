# Our Pulse — Setup Guide

## Local Development

```bash
npm install
# Fill in your Supabase credentials in .env.local
npm run dev         # → http://localhost:3000
```

---

## 1. Supabase Setup (required)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial.sql`
3. Go to **Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL` in `.env.local`
   - `anon` key → `VITE_SUPABASE_ANON_KEY` in `.env.local`
4. Go to **Authentication → Providers** and confirm Email is enabled
5. (Optional for dev) Disable email confirmation under **Auth → Settings**

---

## 2. Email Notifications (Resend)

Contacts receive an email every time you send a pulse.

1. Create a free account at [resend.com](https://resend.com)
2. Add and verify your sending domain (or use `onboarding@resend.dev` for dev/testing)
3. Create an API key
4. Update the `FROM_ADDRESS` in `supabase/functions/send-pulse-email/index.ts` with your verified email
5. Install Supabase CLI: `npm install -g supabase`
6. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
7. Set the secret: `supabase secrets set RESEND_API_KEY=re_your_key_here`
8. Deploy the function: `supabase functions deploy send-pulse-email`

---

## 3. Vercel Deployment

1. Push the repo to GitHub
2. Import in [vercel.com](https://vercel.com) — Vercel will auto-detect the Vite config
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

The `vercel.json` already handles SPA routing (all paths → index.html).

---

## 4. PWA / Mobile Install

Once deployed, visit the URL on your phone:
- **Android (Chrome):** tap "Add to Home Screen" in the browser menu
- **iOS (Safari):** tap the Share button → "Add to Home Screen"

For full iOS icon support, replace `public/icons/icon.svg` with a `192×192` PNG
and update the manifest and `<link rel="apple-touch-icon">` in `index.html`.

---

## Architecture

```
Frontend:     React 19 + Vite + Tailwind v4
Backend:      Supabase (Auth + Postgres)
Email:        Resend via Supabase Edge Function
Geocoding:    BigDataCloud (free, no key)
PWA:          vite-plugin-pwa + Workbox
Hosting:      Vercel (static SPA)
```
