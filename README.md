# VIRASAT — The India Civilization Quest

SIH 26208 · AICTE · MIC-Student Innovation · Software · Toys & Games

This is a fresh, modular prototype built around your supplied 3D assets and a real Three.js/WebXR architecture.

## Features

- Third-person Hampi exploration with WASD, mouse orbit, zoom and jump physics
- Fixed, large Stone Chariot landmark using the supplied GLB model
- Procedural Hampi environment with temple structures, ruins, boulders, courtyard, water court, vegetation, lighting and collisions
- Mission system: The Lost Blueprint
- Stone Chariot discovery and inspection
- Architecture reconstruction game
- XP, ranks, achievements and Heritage Passport persistence
- India world map
- 3D museum using the supplied Stone Chariot, Ram Temple, Ellora and Horse Chariot assets
- Real WebXR AR artifact placement using hit testing where supported
- Real WebXR VR gallery using the same artifact assets where supported
- English, Hindi and Kannada UI labels
- Browser SpeechSynthesis-ready architecture
- Node/Express backend with local JSON persistence and Supabase-compatible SQL schema
- Offline/demo fallback using localStorage
- Konark wheel and Rajasthan pattern mini-games as expandable modules

## Run

1. Install dependencies:

```bash
npm install
```

2. Start frontend:

```bash
npm run dev
```

3. Start backend in a second terminal:

```bash
npm run backend
```

Frontend: http://localhost:5173/
Backend: http://localhost:4000/api/health

## AR / VR

Immersive WebXR requires a compatible browser/device and secure context (HTTPS or localhost where supported). The UI intentionally does not fake AR/VR when unsupported; it exposes the normal 3D experience instead.

## Supabase

Use the included `supabase.sql` as the starter schema. The local JSON backend works without cloud credentials so the hackathon demo is not blocked by setup.

## Asset paths

- `/public/models/stone-chariot/model.glb`
- `/public/models/ram-temple/model.glb`
- `/public/models/ellora-caves/ellora.fbx`
- `/public/models/horse-chariot/HorseChariotMain.fbx`

## Recommended submission demo

Home → Start Journey → Hampi → explore → Stone Chariot → inspect → reconstruction puzzle → artifact/passport → 3D museum → AR/VR compatibility demo → world map expansion.
