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
