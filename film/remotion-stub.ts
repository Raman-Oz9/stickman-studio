// Browser stand-in for the few remotion helpers the world code touches.
export const staticFile = (p: string) => p;
export const useCurrentFrame = () => 0;
export const interpolate = (x: number, i: number[], o: number[]) => { const k = Math.max(0, Math.min(1, (x - i[0]) / (i[i.length - 1] - i[0]))); return o[0] + (o[o.length - 1] - o[0]) * k; };
export const random = (s: string | number) => { let h = 0; const t = String(s); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return (h % 100000) / 100000; };
export const delayRender = () => 0; export const continueRender = () => {};
