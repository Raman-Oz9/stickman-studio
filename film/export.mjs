// Usage: node export.mjs texts <out.json>   |   node export.mjs render <durs.json> <mix.wav> <out.mp4> [w] [h]
import http from "http"; import fs from "fs"; import path from "path"; import { spawn } from "child_process"; import { chromium } from "playwright";
const dir = path.dirname(new URL(import.meta.url).pathname);
const srv = http.createServer((q, r) => { const f = path.join(dir, q.url.split("?")[0] === "/" ? "index.html" : q.url.split("?")[0]); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": f.endsWith(".html") ? "text/html" : "text/javascript" }); r.end(d); } }); }).listen(0);
await new Promise((r) => srv.on("listening", r)); const port = srv.address().port;
const [mode, a1, a2, a3, w = "720", h = "1280"] = process.argv.slice(2);
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox"] });
const pg = await br.newPage({ viewport: { width: +w, height: +h } });
pg.on("pageerror", (e) => console.error("PAGEERROR", e.message)); pg.on("console", (m) => { if (m.type() === "error") console.error("CONSOLE", m.text()); });
if (mode === "render") { const durs = JSON.parse(fs.readFileSync(a1, "utf8")); await pg.addInitScript((d) => { window.__DUR = d; }, durs); }
await pg.goto(`http://localhost:${port}/index.html?export=1`); await pg.waitForFunction(() => window.__film, null, { timeout: 60000 });
if (mode === "texts") { fs.writeFileSync(a1, JSON.stringify(await pg.evaluate(() => window.__film.texts))); }
else {
  const durs = JSON.parse(fs.readFileSync(a1, "utf8")), total = durs.reduce((x, y) => x + y, 0), N = Math.ceil(total * 30) + 20;
  const ff = spawn("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", "30", "-c:v", "mjpeg", "-i", "-", "-i", a2, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-shortest", a3], { stdio: ["pipe", "inherit", "inherit"] });
  await pg.evaluate(() => window.__film.start());
  for (let i = 0; i < N; i++) { await pg.evaluate(() => window.__film.step()); const buf = await pg.screenshot({ type: "jpeg", quality: 92 }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r)); if (i % 90 === 0) console.log("frame", i, "/", N); if (await pg.evaluate(() => window.__finished) && i > total * 30) break; }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r));
}
await br.close(); srv.close();
