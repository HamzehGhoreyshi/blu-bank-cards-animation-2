First read ~/Desktop/AI/ai-os/AGENTS.md

# AGENTS.md — blu-bank-cards-animation-2

## First
This project belongs to Hamzeh's AI OS.
Read `~/Desktop/AI/ai-os/AGENTS.md` and follow its session routine.
If you cannot reach that path, ask Hamzeh to also connect the `ai-os` folder.
Project summary lives in: `~/Desktop/AI/ai-os/10_context/projects/blu-bank-cards-animation-2.md`

## This project
- What it is: a 3D vertical card carousel of 7 famous-bank cards (Chase, HSBC, Citi, Bank of America, Barclays, Goldman Sachs, Deutsche Bank) on a white page — fronts and backs drawn in code, random English holder name, Visa/Mastercard number, expiry, CVV. Particles + click confetti.
- Tech stack: Vite + React 18 + TypeScript + Tailwind v4 (`@tailwindcss/vite`). CSS 3D transforms + requestAnimationFrame; particles on one `<canvas>`.
- How to run it: `npm install`, then `npm run dev -- --port 5184` (also in `.claude/launch.json` as `card-carousel`).
- How to deploy it: push to main on GitHub (HamzehGhoreyshi/blu-bank-cards-animation-2, public) — Vercel auto-deploys to https://blu-bank-cards-animation-2.vercel.app. Manual: `vercel --prod`.
- Files: `src/App.tsx` (carousel math, 3D card body, lighting), `src/cards.tsx` (the 7 bank designs, front/back faces, random holder data), `src/Particles.tsx` (background particles + click burst).
- Rules specific to this project:
  - Portfolio link (Hamzeh's own public projects, not client sites): the published page must show a visible link to `https://hamzeh.framer.ai/?utm_source=blu-bank-cards-animation-2&utm_medium=referral`. Check it is there before every deploy.
  - Bank names and logo motifs belong to their owners — concept use only; logos are simple code-drawn nods, not the official files.
  - On macOS, `sips --cropOffset 0 0` is treated as "centre": use offset 1 for the first column/row.

## Session end (in addition to the AI OS routine)
- Commit (and push once a remote exists) this project's changes.
- Update the project page in ai-os/10_context/projects/blu-bank-cards-animation-2.md directly: state, decisions, next actions.
