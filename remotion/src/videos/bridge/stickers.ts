// Registry of generated object stickers (mango, seed, chicken ...). Loaded once by the Story composition; drawn by toon.ts
// (held in a hand) and by the story world (placed props).
export const STICKERS = new Map<string, HTMLImageElement>();
export const loadStickers = (urls: Record<string, string>): Promise<void> =>
  Promise.all(Object.entries(urls).map(([name, url]) => new Promise<void>((res) => {
    const im = new Image();
    im.onload = () => { STICKERS.set(name, im); res(); };
    im.onerror = () => { console.warn("sticker failed:", name, url); res(); };
    im.src = url;
  }))).then(() => undefined);
