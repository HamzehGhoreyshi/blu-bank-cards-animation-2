# World Bank Cards — 3D carousel

A 3D carousel of seven cards from some of the world's best-known banks: JPMorgan Chase, HSBC, Citi, Bank of America, Barclays, Goldman Sachs and Deutsche Bank. Click anywhere to glide to the next card; move the mouse to tilt it.

**Live:** https://blu-bank-cards-animation-2.vercel.app

<p align="center">
  <a href="https://blu-bank-cards-animation-2.vercel.app"><img src="docs/demo.gif" alt="A mouse clicks through the cards; each click glides to the next card with a burst of confetti" width="560"></a>
</p>

▶️ Full-quality video (1920×1080, 60 fps, loops): [docs/demo.mp4](docs/demo.mp4) — recorded with the earlier Blu Junior designs.

- **Front:** drawn in code, no image files — bank wordmark and a simple nod to its logo, product name, gold chip, contactless mark, holder name, Visa or Mastercard.
- **Back:** magnetic stripe, signature panel with CVV, card number (Visa 4… / Mastercard 51–55…, valid Luhn check digit), holder name and expiry — random on every load.
- **3D:** layered card edge, moving gloss, light shading and soft shadows — pure CSS 3D transforms, no 3D library.
- **Extras:** light floating particles and a confetti burst on click.

## Run it

```bash
npm install
npm run dev
```

## Record the demo video

Filmed frame by frame on a virtual clock (no dropped frames): the macOS pointing-hand cursor rests on the card and clicks through all seven cards with real clicks, ending where it started so the video loops.

```bash
npm i --no-save puppeteer-core
npm run build
node tools/record.mjs demo-4k.mp4            # 1280×720 page → 3840×2160 video
```

Needs Google Chrome and ffmpeg.

## Stack

Vite · React 18 · TypeScript · Tailwind CSS v4 · `requestAnimationFrame` (no animation libraries).

- `src/App.tsx` — carousel motion, 3D card body and lighting
- `src/cards.tsx` — the seven bank designs, front and back faces, random holder data
- `src/Particles.tsx` — background particles and click confetti (one canvas)

## Credits

Bank names, logos and card products belong to their owners; the designs here are loose, non-commercial concept versions, not the real cards. All card details are randomly generated and not real.

Design experiment by [Hamzeh](https://hamzeh.framer.ai/?utm_source=blu-bank-cards-animation-2&utm_medium=referral) · Built with Claude.
