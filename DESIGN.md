# Design System — Harsh Commerce Academy

## Visual Identity
- **Primary Color:** Deep Indigo `#3730A3` — conveys trust, academic credibility
- **Accent Color:** Amber `#F59E0B` — warmth, energy, highlights CTAs and badges
- **Success:** Emerald `#10B981`
- **Background:** Soft White `#F8FAFC` (light mode default)
- **Surface / Card:** White `#FFFFFF` with subtle shadow
- **Text Primary:** Slate `#1E293B`
- **Text Secondary:** Slate `#64748B`
- **Border:** Slate `#E2E8F0`

## Typography
- **Font Family:** Inter (sans-serif) — clean, highly legible at all sizes
- **Headings:** Inter Bold (700) — sizes: 32 / 24 / 20 / 18 px
- **Body:** Inter Regular (400) — 15–16 px, line-height 1.6
- **Labels / Captions:** Inter Medium (500) — 12–13 px

## Elevation & Shadows
- **Card shadow:** `0 1px 4px rgba(0,0,0,0.08)` — subtle, not dramatic
- **Elevated modal:** `0 8px 24px rgba(0,0,0,0.12)`
- No heavy drop shadows; keep surfaces feeling clean and flat-ish

## Spacing & Layout
- **Grid:** 12-column, 24 px gutter, max-width 1280 px
- **Component padding:** 16 / 24 px consistently
- **Border radius:** 12 px cards, 8 px buttons, 6 px inputs
- **Dense sidebar** on desktop (240 px); bottom tab bar on mobile

## Component Style
- **Buttons:** Filled primary (indigo bg, white text), outlined secondary, ghost for tertiary actions; 40 px height standard
- **Course Cards:** Thumbnail (16:9), title, instructor name, free/paid badge (amber for paid, green for free), progress bar for enrolled courses
- **Video Player:** Full-width embed, clean minimal controls, chapter/topic list on the right (desktop) or collapsible below (mobile)
- **Quiz UI:** One question at a time with large tap-friendly option tiles; progress indicator at top; instant feedback after submission
- **Chat / Query Board:** WhatsApp-inspired thread view — bubbles for messages, clear answer acceptance button
- **Notification Bell:** Icon in top nav with unread count badge (red dot)
- **Content Lock Overlay:** Semi-transparent blur overlay on locked content with a clear "Unlock / Enrol" CTA

## Key UX Principles
1. **Student-first navigation** — most common actions (resume lesson, open quiz, check notifications) reachable in ≤ 2 taps
2. **Progress visibility** — always show the student how far they are in a course / module
3. **Clear free vs. paid signals** — badges and lock icons must be immediately obvious without feeling aggressive
4. **Mobile-first** — the majority of students will access via mobile; desktop is a plus
5. **Accessibility** — minimum 4.5:1 contrast ratio on all body text; focusable interactive elements

## Screens / Pages
1. **Landing / Home (logged-out)** — Hero, feature highlights, sample course listings, CTA to sign up
2. **Auth** — Sign Up + Login forms (tabbed or separate routes)
3. **Student Dashboard** — Enrolled courses with progress, recent notifications, quick-access shortcuts
4. **Course Catalogue** — Browse all courses, filter by free/paid/category, search
5. **Course Detail Page** — Overview, curriculum accordion (topics + lessons), enrol/unlock button
6. **Lesson View** — Video player (or notes reader), sidebar topic list, mark-complete button
7. **PDF Viewer** — Inline viewer with download option
8. **MCQ Quiz** — Question flow, timer (optional), result summary
9. **Query / Chat Board** — Thread list + thread detail with reply input
10. **Notifications Centre** — List of all alerts with read/unread state
11. **Profile / Account** — Student profile, enrolled courses, password change
