# Elvis Hot Seat (PWA / HTML5)

This is a **pure HTML5 PWA** that can be installed on iPhone/Android as a home-screen app.
No Mac required.

## Run locally (quick)
You need to serve it (service worker requires http/https, not file://).

### Option A: Python
```bash
python3 -m http.server 8080
```
Open: http://localhost:8080

### Option B: Node
```bash
npx http-server -p 8080
```

## Deploy (recommended)
- GitHub Pages
- Netlify
- Cloudflare Pages

Then open the URL on your iPhone → Safari Share → “Add to Home Screen”.

## Notes about iOS
- Web TTS (SpeechSynthesis) works on many devices but depends on installed voices and Safari policies.
- Audio/TTS typically needs a user tap to unlock. Press any button once if it’s silent.

## Making it “really endless”
Add more records and templates:
- Extend DB in app.js (or load JSON via fetch)
- Add more generator recipes under `Recipes` in app.js
The combinations explode quickly (data × templates × synonyms × distractors).

## Legal note
Avoid copying protected TV branding and ensure rights for any Elvis imagery/branding you distribute.


## Daten bearbeiten (ohne Code)
Bearbeite **elvis-db.json** direkt im GitHub-Repo (Web Editor). Danach ist es live.


## Global Highscore (shared across iPhones) – Supabase (optional)

### A) Create table + policies
In Supabase → SQL Editor, run:

```sql
create table if not exists public.scores (
  id bigserial primary key,
  created_at timestamptz default now(),
  name text not null,
  score int not null,
  mode text not null,
  completed_levels int not null
);

alter table public.scores enable row level security;

drop policy if exists "public read" on public.scores;
create policy "public read" on public.scores
for select using (true);

drop policy if exists "public insert" on public.scores;
create policy "public insert" on public.scores
for insert with check (
  char_length(name) between 1 and 20 and
  score between 0 and 1000000 and
  completed_levels between 0 and 999 and
  mode in ('classic','endless')
);
```

### B) Put keys into config.js
Edit **config.js** in your GitHub repo:
- SUPABASE_URL (Project URL)
- SUPABASE_ANON_KEY (anon public key)

Commit changes.

### C) Use it in the app
Open 🏆 → tap **Global** → ↻ refresh.
Scores will be shared across all iPhones using the same GitHub Pages site.
