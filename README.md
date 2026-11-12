# Blu Junior Cards — 3D carousel

A 3D carousel of the seven Blu Junior card designs. Click anywhere to glide to the next card; move the mouse to tilt it.

**Live:** https://blu-bank-cards-animation-2.vercel.app

- **Front:** the official Blu Junior artwork.
- **Back:** modelled on a real Saman Bank card — colour taken from each design, brushed magnetic stripe, a random Persian name, card number (valid Luhn check digit), expiry and CVV2 on every load, "Powered by Saman Bank".
- **3D:** layered card edge, moving gloss, light shading and soft shadows — pure CSS 3D transforms, no 3D library.
- **Extras:** light floating particles and a confetti burst on click.

## Run it

```bash
npm install
npm run dev
```

## Stack

Vite · React 18 · TypeScript · Tailwind CSS v4 · `requestAnimationFrame` (no animation libraries).

- `src/App.tsx` — carousel motion, card faces, card back layout, random holder data
- `src/Particles.tsx` — background particles and click confetti (one canvas)

## Credits

Card artwork and the blu and Saman Bank logos belong to their owners; used here for a non-commercial design concept. All card details are randomly generated and not real.

Design experiment by [Hamzeh](https://hamzeh.framer.ai/?utm_source=blu-bank-cards-animation-2&utm_medium=referral) · Built with Claude.
