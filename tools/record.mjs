// Records the demo video: the real macOS pointing-hand cursor rests on the card and clicks
// through all 7 cards (ending back on the first, so the video loops).
//
// Frame by frame: the page's clock is replaced, so every frame is exactly 1/60 s after the
// last and nothing ever drops. Clicks are real clicks sent to Chrome (glide + confetti).
// Headless Chrome films no system cursor, so the system's own cursor image is drawn on top
// (tools/assets/pointinghand.png, rendered from macOS's cursor.pdf, hotspot 12,8, its shadow).
//
// Filmed at 3x: a 1280x720 page gives a 3840x2160 (4K) master.
// Needs: Google Chrome, ffmpeg, and `npm i --no-save puppeteer-core`. Run `npm run build` first.
//   node tools/record.mjs <out.mp4> [css width] [css height] [output width]
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const [out, width = '1280', height = '720', outWidth = '3840'] = process.argv.slice(2);
if (!out) throw new Error('usage: node tools/record.mjs <out.mp4> [width] [height] [output width]');
const W = Number(width), H = Number(height);
const OW = Number(outWidth), OH = Math.round((OW * H) / W / 2) * 2;
const SCALE = 3; // filmed at 3x
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
// Only the piece itself (no footer), plus the system cursor.
const HAND = (await readFile(fileURLToPath(new URL('./assets/pointinghand.png', import.meta.url)))).toString('base64');
await page.addStyleTag({
  content: `.credits-sig { display: none !important; }
  #cursor { position: fixed; left: 0; top: 0; width: 32px; height: 32px; z-index: 2147483647; pointer-events: none;
    filter: drop-shadow(0 1px 1px rgba(0,0,0,.45)); }`,
});
await page.evaluate((src) => {
  const cursor = document.createElement('img');
  cursor.id = 'cursor';
  cursor.src = `data:image/png;base64,${src}`;
  document.body.append(cursor);
  return cursor.decode();
}, HAND);
const HOT = { x: 12, y: 8 }; // macOS hotspot for the pointing hand

const step = () => page.evaluate((ms) => window.__step(ms), 1000 / FPS);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
for (let i = 0; i < FPS * 1.5; i++) await step(); // settle: particles spread, first card resting

// ---------- the plan: the hand rests on the card and clicks 7 times ----------
const W2 = W / 2, H2 = H / 2;
const spot = { x: W2 + 70, y: H2 + 35 }; // on the front card, clear of the blu logo
const CARDS = 7;
const BEFORE = 0.6; // s before the first click
const EACH = 2.1; // s per card: 1.6 s glide + a short look
const clicks = Array.from({ length: CARDS }, (_, k) => BEFORE + k * EACH);
const DURATION = BEFORE + CARDS * EACH; // ends resting on the first card again → seamless loop

// ---------- film it ----------
const ffmpeg = spawn('ffmpeg', [
  '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-vf', `scale=${OW}:${OH}:flags=lanczos`,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const finished = new Promise((done) => ffmpeg.on('close', done));

const cdp = await page.createCDPSession();
const total = Math.round(DURATION * FPS);
const clickFrames = new Set(clicks.map((t) => Math.round(t * FPS)));
await page.mouse.move(spot.x, spot.y);
await page.evaluate((x, y) => { document.getElementById('cursor').style.transform = `translate(${x}px, ${y}px)`; }, spot.x - HOT.x, spot.y - HOT.y);
for (let i = 0; i < FPS; i++) await step(); // let the tilt settle under the resting hand
for (let f = 0; f < total; f++) {
  if (clickFrames.has(f)) {
    await page.mouse.down();
    await page.mouse.up(); // a real click: the page glides and throws confetti
  }
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
