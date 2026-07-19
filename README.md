# Sona

Sona is a Spotify-powered Music DNA dashboard. It connects through Supabase Spotify OAuth, syncs top tracks and recent listening data, then builds a visual profile of listening habits, top artists, albums, tracks, and genre-weighted taste metrics.

## Features

- Spotify OAuth via Supabase
- Top tracks, artists, albums, and recently played views
- Artist images with album-art fallback
- Track-level genre weighting for Music DNA
- Local simulator fallback when Supabase env vars are not configured
- Next.js app ready for Vercel deployment

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth
- Spotify Web API
- pnpm

## Local Development

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://127.0.0.1:3000`.

## Environment Variables

Create `frontend/.env.local` for Spotify OAuth-backed sync:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

In Supabase, enable Spotify as an auth provider and include these Spotify scopes:

```text
user-read-email user-top-read user-read-recently-played
```

Without these variables, Sona runs in local simulator mode.

## Scripts

```bash
cd frontend
pnpm dev
pnpm lint
pnpm build
pnpm start
```

`pnpm lint` currently runs TypeScript validation.

## Deploy

The repo includes `vercel.json`, so Vercel can deploy from the repository root while building the `frontend` app.

Before deploying, set the same Supabase environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then deploy normally from Vercel or push to the connected GitHub repository.
