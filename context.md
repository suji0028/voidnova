# खालीपन (Khaalipan) Project Context

## 1) Project Overview

This project is a Vite + React ambient music player landing page titled **खालीपन** (formerly *Void Nova*). It presents an immersive, cinematic full-screen experience featuring:

- **Cinematic Visuals**: A looping background video / playlist-themed backgrounds with dynamic visual overlays (`sky`, `grain`, `vignette`).
- **Glassmorphism Music Player**: Premium neutral dark glassmorphic audio player interface with playback controls, progress timeline seeking, and artwork display.
- **Apple-Style Contact Book Playlist Selector**: Full glassmorphism list popup for switching playlists (e.g., Emraan Hashmi hits, Hrithik Roshan hits), complete with GSAP entry/exit animations.
- **Playlist & Metadata Engine**: Multi-playlist support with state synchronization using `useRef` to avoid stale metadata closures during playback pause/resume.
- **Onboarding Pill**: Dynamic hint pill above the player encouraging users to click track titles to switch playlists.
- **Live User & Visit Counter**: Integrated Supabase Realtime Presence (for live concurrent user tracking) and a Supabase RPC counter (for total site visits) — running 100% serverless on Vercel + Supabase.
- **Trademark Signature**: Light cursive watermark signature "**SACHIN**" in the bottom-right corner using Google Font *Dancing Script*.
- **Responsive System**: 3-tier mobile responsive system accommodating tablets (≤768px), standard phones (≤480px), and small phones (≤360px), with safe area inset optimization.

---

## 2) Tech Stack

- **React 18**: UI component framework.
- **Vite**: Ultra-fast build tool and dev server.
- **GSAP (GreenSock)**: Micro-interactions, ease-in/out staggered animations for the playlist modal and UI elements.
- **@supabase/supabase-js**: Supabase client for Realtime Presence and RPC database calls.
- **Vanilla CSS**: Custom design system in `styles.css` utilizing dark glassmorphism, flex layout, and CSS variables.
- **Google Fonts**: Gajraj One, Libre Caslon Display, Playfair, Poppins, Roboto, and Dancing Script.
- **YouTube iFrame API / Opus Audio**: Background audio / video sync and asset loader.

---

## 3) Core Features & Architecture

### Playback & Restricted Playlist Interaction
- To prevent seek conflicts, clicking the progress bar timeline strictly controls song position.
- Playlist switching is triggered exclusively by clicking the **Track Title / Artist area** or the **Hint Pill** above the player.

### Live Presence & Visit Tracking
- **Live Users**: Uses Supabase Realtime Presence channel (`khaalipan-presence`). Each client tracks a unique session UUID and syncs active member count in real-time.
- **Total Visit Count**: Calls `increment_visits()` RPC function in Supabase on initial render, incrementing and returning the lifetime visit count.
- **No External Server Required**: Replaced the legacy WebSocket server (`server/presence-server.js`) with serverless Supabase Realtime.

---

## 4) Key File Structure

- **`index.html`**: HTML shell loading external fonts and setting viewport meta tags with `viewport-fit=cover`.
- **`src/App.jsx`**: Core state machine managing song playback, playlist modal state, clock timer, GSAP animations, and layout rendering.
- **`src/LiveUsers.jsx`**: Supabase-powered glassmorphism badge showing real-time active user count and total lifetime site visits.
- **`src/main.jsx`**: React entry point mounting `<App />`.
- **`styles.css`**: Unified design system containing theme CSS variables, glassmorphism utilities, GSAP target styles, typography, and responsive media queries.
- **`.env.local`**: Local environment secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_YOUTUBE_API_KEY`).

---

## 5) Deployment Checklist (Vercel)

When deploying to Vercel:

1. Push code to GitHub repository.
2. Import project in **Vercel Dashboard**.
3. Add the following **Environment Variables** in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_YOUTUBE_API_KEY` (if YouTube playback is active)
4. Deploy! No separate backend process or WebSocket server is required.
