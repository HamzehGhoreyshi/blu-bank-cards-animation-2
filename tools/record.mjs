// Records the demo video: a hand on the mouse tilts the cards and clicks through them.
//
// Frame by frame: the page's clock is replaced, so every frame is exactly 1/60 s after the
// last and nothing ever drops. Each frame the script sends a genuine mouse move to Chrome,
// so the tilt reacts exactly as it does for a visitor; clicks are real clicks (glide +
// confetti). Headless Chrome films no system cursor, so a macOS-style arrow is drawn on
// top, with a soft ring on every click so the click reads on video.
//
// Needs: Google Chrome, ffmpeg, and `npm i --no-save puppeteer-core`. Run `npm run build` first.
//   node tools/record.mjs <out.mp4> [css width] [css height] [output width]
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const [out, width = '1280', height = '720', outWidth = '1920'] = process.argv.slice(2);
if (!out) throw new Error('usage: node tools/record.mjs <out.mp4> [width] [height] [output width]');
const W = Number(width), H = Number(height);
const OW = Number(outWidth), OH = Math.round((OW * H) / W / 2) * 2;
const SCALE = 2; // filmed at 2x, scaled down for clean edges
const DIST = path.resolve('dist');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FPS = 60;

// ---------- a tiny file server for dist/ ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer(async (req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(DIST, name === '/' ? 'index.html' : name);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--enable-gpu', '--use-angle=metal', '--ignore-gpu-blocklist', '--hide-scrollbars', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });

// ---------- the page's clock, driven from here ----------
await page.evaluateOnNewDocument(() => {
  const realFrame = window.requestAnimationFrame.bind(window);
  let now = 0;
  let frames = [];
  let timers = [];
  let id = 1;
  const seen = new WeakSet();
  performance.now = () => now;
  Date.now = () => 1700000000000 + now;
  window.requestAnimationFrame = (fn) => { frames.push({ id: ++id, fn }); return id; };
  window.cancelAnimationFrame = (handle) => { frames = frames.filter((f) => f.id !== handle); };
  window.setTimeout = (fn, delay = 0, ...args) => { timers.push({ id: ++id, at: now + delay, fn: () => fn(...args) }); return id; };
  window.clearTimeout = (handle) => { timers = timers.filter((t) => t.id !== handle); };
  window.__step = (ms) => {
    now += ms;
    const due = timers.filter((t) => t.at <= now).sort((a, b) => a.at - b.at);
    timers = timers.filter((t) => t.at > now);
    for (const timer of due) timer.fn();
    const batch = frames;
    frames = [];
    for (const frame of batch) frame.fn(now);
    for (const animation of document.getAnimations()) {
      if (!seen.has(animation)) { seen.add(animation); animation.pause(); animation.currentTime = 0; }
      else animation.currentTime = Number(animation.currentTime) + ms;
    }
    return new Promise((done) => realFrame(() => realFrame(done)));
  };
});

await page.goto(origin, { waitUntil: 'networkidle0' });
// Only the piece itself (no footer), plus the drawn cursor and click ring.
await page.addStyleTag({
  content: `.credits-sig { display: none !important; }
  #cursor { position: fixed; left: 0; top: 0; z-index: 2147483647; pointer-events: none; will-change: transform;
    filter: drop-shadow(0 1.2px 1.6px rgba(0,0,0,.32)); }
  #cursor svg { display: block; transform-origin: 3.9px 3.9px; }
  .click-ring { position: fixed; z-index: 2147483646; pointer-events: none; width: 44px; height: 44px; margin: -22px 0 0 -22px;
    border-radius: 50%; border: 3px solid #fff; background: rgba(78,145,230,.18);
    box-shadow: 0 0 0 2px rgba(78,145,230,.95), inset 0 0 0 1.5px rgba(78,145,230,.6), 0 2px 8px rgba(0,0,0,.18); }`,
});
// macOS-style arrow, 1.3x the normal size so it reads on a phone; the tip (hotspot) sits at (3.9, 3.9).
await page.evaluate(() => {
  const cursor = document.createElement('div');
  cursor.id = 'cursor';
  cursor.innerHTML = `<svg width="28.6" height="39" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3 L3 20.2 L7.15 16.25 L10.05 23.05 L13.05 21.8 L10.2 15.1 L15.9 15.1 Z"
      fill="#000" stroke="#fff" stroke-width="1.7" stroke-linejoin="round" paint-order="stroke"/></svg>`;
  document.body.append(cursor);
});

const step = () => page.evaluate((ms) => window.__step(ms), 1000 / FPS);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
for (let i = 0; i < FPS * 1.5; i++) await step(); // settle: particles spread, first card resting

// ---------- the hand: moves, rests and clicks, turned into one position per frame ----------
let seed = 11;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const between = (a, b) => a + (b - a) * random();
const minJerk = (t) => t * t * t * (10 - 15 * t + 6 * t * t); // how a hand speeds up and slows down

const plan = [];
const clicks = []; // times (s)
let clock = 0;
let at = { x: W * 0.86, y: H * 0.88 };
const rest = (s) => { clock += s; };
function move(to, seconds, bend = between(-0.14, 0.14)) {
  plan.push({ from: at, to, start: clock, end: clock + seconds, bend });
  clock += seconds;
  at = to;
}
const click = (after = 0.18) => { rest(after); clicks.push(clock); };
const C = { x: W / 2, y: H / 2 }; // the front card's centre

rest(0.5);
move({ x: C.x + 90, y: C.y + 40 }, 1.0); // reach the card
rest(0.3);
move({ x: C.x - 330, y: C.y - 210 }, 1.1); // tilt it: up-left…
rest(0.25);
move({ x: C.x + 360, y: C.y - 170 }, 1.2); // …up-right…
rest(0.25);
move({ x: C.x + 60, y: C.y + 30 }, 0.9); // …back to the card
click(0.3);
rest(2.0); // glide to the next card
move({ x: C.x + 20, y: C.y + 10 }, 0.35);
click(0.15);
rest(2.0);
move({ x: C.x - 40, y: C.y - 20 }, 0.4);
click(0.15);
rest(2.0);
move({ x: C.x + 300, y: C.y + 210 }, 1.0); // tilt down-right
rest(0.3);
move({ x: C.x - 280, y: C.y + 160 }, 1.1); // down-left
rest(0.3);
move({ x: C.x + 30, y: C.y - 10 }, 0.8);
click(0.25);
rest(2.4);
const DURATION = clock;

function handAt(t) {
  const now = plan.find((p) => t >= p.start && t < p.end);
  let x, y;
  if (now) {
    const s = minJerk((t - now.start) / (now.end - now.start));
    const dx = now.to.x - now.from.x, dy = now.to.y - now.from.y;
    const arc = now.bend * Math.sin(Math.PI * s); // a slight curve, as a wrist turns
    x = now.from.x + dx * s - dy * arc;
    y = now.from.y + dy * s + dx * arc;
  } else {
    const last = [...plan].reverse().find((p) => p.end <= t);
    ({ x, y } = last ? last.to : plan[0].from);
  }
  // A resting hand is never perfectly still.
  x += 0.35 * Math.sin(t * 1.7) + 0.2 * Math.sin(t * 4.3 + 1);
  y += 0.3 * Math.sin(t * 1.3 + 2) + 0.18 * Math.sin(t * 3.7);
  return { x, y };
}

// ---------- film it ----------
const ffmpeg = spawn('ffmpeg', [
  '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-vf', `scale=${OW}:${OH}:flags=lanczos`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const finished = new Promise((done) => ffmpeg.on('close', done));

const cdp = await page.createCDPSession();
const total = Math.round(DURATION * FPS);
const clickFrames = clicks.map((t) => Math.round(t * FPS));
await page.evaluate(() => {
  const ring = document.createElement('div');
  ring.className = 'click-ring';
  ring.style.opacity = '0';
  document.body.append(ring);
});
let lastClick = null; // { f, x, y }
for (let f = 0; f < total; f++) {
  const { x, y } = handAt(f / FPS);
  await page.mouse.move(x, y);
  if (clickFrames.includes(f)) {
    await page.mouse.down();
    await page.mouse.up(); // a real click: the page glides and throws confetti
    lastClick = { f, x, y };
  }
  // Click feedback, drawn per frame: the arrow dips (220 ms) and a ring spreads out (600 ms).
  const since = lastClick ? ((f - lastClick.f) * 1000) / FPS : Infinity;
  const press = since < 220 ? 1 - 0.16 * Math.sin((since / 220) * Math.PI) : 1;
  const r = since < 600 ? since / 600 : 1; // ring lasts 600 ms
  const ringEase = 1 - Math.pow(1 - r, 3);
  await page.evaluate((cx, cy, press, ring) => {
    document.getElementById('cursor').style.transform = `translate(${cx - 3.9}px, ${cy - 3.9}px)`;
    document.querySelector('#cursor svg').style.transform = `scale(${press})`;
    const el = document.querySelector('.click-ring');
    if (ring) {
      el.style.left = `${ring.x}px`;
      el.style.top = `${ring.y}px`;
      el.style.transform = `scale(${ring.scale})`;
      el.style.opacity = String(ring.opacity);
    } else el.style.opacity = '0';
  }, x, y, press, since < 600 ? { x: lastClick.x, y: lastClick.y, scale: 0.35 + 1.15 * ringEase, opacity: 1 - r * r } : null);
  await step();
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, captureBeyondViewport: false, clip: { x: 0, y: 0, width: W, height: H, scale: SCALE } });
  if (!ffmpeg.stdin.write(Buffer.from(data, 'base64'))) await new Promise((done) => ffmpeg.stdin.once('drain', done));
  if (f % 300 === 0) console.log(`${out}: frame ${f}/${total}`);
}
ffmpeg.stdin.end();
await finished;
await browser.close();
server.close();
console.log(`${out}: done (${DURATION.toFixed(1)} s)`);
