/**
 * Reads a studio car photo in the browser: the backdrop's colour, where the
 * car stands, and which way it faces. The studio uses this to continue the
 * backdrop, to keep the model's name *behind* the car (the lettering is cut
 * away wherever the car's silhouette is) and to frame the gallery's close-ups.
 *
 * How: the backdrop is flood-filled in from the photo's edges, stopping at any
 * colour step — what is left is the car. Its convex outline is the
 * silhouette; white cars on white paper leak a little inside, the outline
 * still holds. A photo that is not on a plain backdrop (corners that differ)
 * is marked `plain: false` and gets no lettering.
 */

export interface PhotoInfo {
  /** The backdrop colour, e.g. "rgb(244 244 246)". */
  bg: string;
  light: boolean;
  /** True when the photo sits on one even studio backdrop. */
  plain: boolean;
  /** The car's silhouette as a PNG (opaque = car), the photo's own shape. */
  hull: string | null;
  /** Where the car is, as fractions of the photo (reflections left out). */
  box: { x0: number; y0: number; x1: number; y1: number };
  /** The end of the car nearest the camera — its front, for a front three-quarter shot. */
  nose: 'left' | 'right';
}

export const DEFAULT_INFO: PhotoInfo = {
  bg: '#eef1f6',
  light: true,
  plain: false,
  hull: null,
  box: { x0: 0.12, y0: 0.18, x1: 0.88, y1: 0.86 },
  nose: 'left',
};

const cache = new Map<string, Promise<PhotoInfo>>();

/** One analysis per photo per page view, shared by the studio and the gallery. */
export function readPhoto(src: string): Promise<PhotoInfo> {
  let p = cache.get(src);
  if (!p) {
    p = load(src).then(analyse, () => DEFAULT_INFO);
    cache.set(src, p);
  }
  return p;
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`;
  });
}

const WR = 0.9;
const WG = 1.77;
const WB = 0.33;

function analyse(img: HTMLImageElement): PhotoInfo {
  try {
    const W = Math.min(640, img.naturalWidth || 640);
    const H = Math.max(8, Math.round(((img.naturalHeight || 2) / (img.naturalWidth || 3)) * W));
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    if (!cx) return DEFAULT_INFO;
    cx.drawImage(img, 0, 0, W, H);
    const raw = cx.getImageData(0, 0, W, H).data;
    const n = W * H;

    // 3×3 box blur, so JPEG noise does not read as edges.
    const r = new Float32Array(n);
    const g = new Float32Array(n);
    const b = new Float32Array(n);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let sr = 0;
        let sg = 0;
        let sb = 0;
        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= W) continue;
            const o = (yy * W + xx) * 4;
            sr += raw[o]!;
            sg += raw[o + 1]!;
            sb += raw[o + 2]!;
            k++;
          }
        }
        const i = y * W + x;
        r[i] = sr / k;
        g[i] = sg / k;
        b[i] = sb / k;
      }
    }

    // The backdrop: the median colour around the edge.
    const edge: number[] = [];
    for (let x = 0; x < W; x++) edge.push(x, (H - 1) * W + x);
    for (let y = 1; y < H - 1; y++) edge.push(y * W, y * W + W - 1);
    const med = (arr: Float32Array) => {
      const v = edge.map((i) => arr[i]!).sort((p, q) => p - q);
      return v[v.length >> 1]!;
    };
    const br = med(r);
    const bgG = med(g);
    const bb = med(b);
    const dbg = (i: number) =>
      WR * (r[i]! - br) ** 2 + WG * (g[i]! - bgG) ** 2 + WB * (b[i]! - bb) ** 2;
    const step = (i: number, j: number) =>
      WR * (r[i]! - r[j]!) ** 2 + WG * (g[i]! - g[j]!) ** 2 + WB * (b[i]! - b[j]!) ** 2;

    const spread = edge.map((i) => Math.sqrt(dbg(i))).sort((p, q) => p - q);
    const plain = (spread[Math.floor(spread.length * 0.9)] ?? 999) < 60;
    const lum = 0.2126 * br + 0.7152 * bgG + 0.0722 * bb;
    const light = lum > 170;
    const bg = `rgb(${Math.round(br)} ${Math.round(bgG)} ${Math.round(bb)})`;

    // Flood the backdrop in from the edges.
    const TBG = 90 * 90;
    const TSTEP = 6 * 6;
    const seen = new Uint8Array(n);
    const queue = new Int32Array(n);
    let head = 0;
    let tail = 0;
    for (const i of edge) {
      if (!seen[i] && dbg(i) < TBG) {
        seen[i] = 1;
        queue[tail++] = i;
      }
    }
    while (head < tail) {
      const i = queue[head++]!;
      const x = i % W;
      const y = (i - x) / W;
      const near = [
        x + 1 < W ? i + 1 : -1,
        x > 0 ? i - 1 : -1,
        y + 1 < H ? i + W : -1,
        y > 0 ? i - W : -1,
      ];
      for (const j of near) {
        if (j < 0 || seen[j]) continue;
        if (dbg(j) < TBG && step(i, j) < TSTEP) {
          seen[j] = 1;
          queue[tail++] = j;
        }
      }
    }

    // What is left is the car; keep its big pieces, drop specks.
    const label = new Int32Array(n);
    const sizes: number[] = [0];
    for (let s = 0; s < n; s++) {
      if (seen[s] || label[s]) continue;
      const id = sizes.length;
      let size = 0;
      head = 0;
      tail = 0;
      queue[tail++] = s;
      label[s] = id;
      while (head < tail) {
        const i = queue[head++]!;
        size++;
        const x = i % W;
        const y = (i - x) / W;
        const near = [
          x + 1 < W ? i + 1 : -1,
          x > 0 ? i - 1 : -1,
          y + 1 < H ? i + W : -1,
          y > 0 ? i - W : -1,
        ];
        for (const j of near) {
          if (j < 0 || seen[j] || label[j]) continue;
          label[j] = id;
          queue[tail++] = j;
        }
      }
      sizes.push(size);
    }
    const biggest = Math.max(0, ...sizes);
    if (biggest < n * 0.02) return { ...DEFAULT_INFO, bg, light, plain: false };
    const keepId = new Uint8Array(sizes.length);
    sizes.forEach((s, id) => {
      if (id > 0 && s > biggest * 0.002) keepId[id] = 1;
    });
    const keep = (i: number) => keepId[label[i]!] === 1;

    // The silhouette: the convex outline of the car's pieces.
    const pts: [number, number][] = [];
    for (let y = 0; y < H; y++) {
      let lo = -1;
      let hi = -1;
      for (let x = 0; x < W; x++) {
        if (keep(y * W + x)) {
          if (lo < 0) lo = x;
          hi = x;
        }
      }
      if (lo >= 0) pts.push([lo, y], [hi + 1, y]);
    }
    const hull = convexHull(pts);

    // Where the car is: rows well covered by it (reflections thin out below).
    const strongT = (light ? 110 : 60) ** 2;
    const rowCover = new Float32Array(H);
    let minX = W;
    let maxX = 0;
    for (const [x] of hull) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
    const span = Math.max(1, maxX - minX);
    for (let y = 0; y < H; y++) {
      let c = 0;
      for (let x = minX; x < maxX; x++) if (keep(y * W + x)) c++;
      rowCover[y] = c / span;
    }
    const top = Math.max(...rowCover);
    let y0 = 0;
    while (y0 < H - 1 && rowCover[y0]! < top * 0.12) y0++;
    let y1 = H - 1;
    while (y1 > y0 && rowCover[y1]! < top * 0.35) y1--;
    y1 = Math.min(H - 1, y1 + Math.round((y1 - y0) * 0.04));

    // Which end is nearer the camera: its lowest strong pixel sits lower.
    const lowest = (from: number, to: number) => {
      for (let y = y1; y >= y0; y--) {
        for (let x = from; x < to; x++) {
          const i = y * W + x;
          if (keep(i) && dbg(i) > strongT) return y;
        }
      }
      return y0;
    };
    const part = Math.round(span * 0.4);
    const nose: 'left' | 'right' =
      lowest(minX, minX + part) >= lowest(maxX - part, maxX) ? 'left' : 'right';

    // Draw the silhouette, a touch larger and soft-edged.
    const mk = document.createElement('canvas');
    mk.width = W;
    mk.height = H;
    const m = mk.getContext('2d');
    let hullUrl: string | null = null;
    if (m && hull.length > 2) {
      m.filter = 'blur(2px)';
      m.fillStyle = '#000';
      m.strokeStyle = '#000';
      m.lineWidth = 6;
      m.lineJoin = 'round';
      m.beginPath();
      hull.forEach(([x, y], k) => (k ? m.lineTo(x, y) : m.moveTo(x, y)));
      m.closePath();
      m.fill();
      m.stroke();
      hullUrl = mk.toDataURL('image/png');
    }

    return {
      bg,
      light,
      plain,
      hull: hullUrl,
      box: { x0: minX / W, y0: y0 / H, x1: maxX / W, y1: y1 / H },
      nose,
    };
  } catch {
    return DEFAULT_INFO;
  }
}

function convexHull(points: [number, number][]): [number, number][] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, q) <= 0)
      lower.pop();
    lower.push(q);
  }
  const upper: [number, number][] = [];
  for (let k = p.length - 1; k >= 0; k--) {
    const q = p[k]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, q) <= 0)
      upper.pop();
    upper.push(q);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** A close-up of one part of the photo: zoom and the point to centre, as fractions. */
export interface CloseUp {
  label: string;
  caption: string;
  zoom: number;
  cx: number;
  cy: number;
}

/** Three close-ups framed on the car itself: its front, its wheels, its roofline. */
export function closeUps(info: Pick<PhotoInfo, 'box' | 'nose'>): CloseUp[] {
  const { x0, y0, x1, y1 } = info.box;
  const w = x1 - x0;
  const h = y1 - y0;
  const along = (f: number) => (info.nose === 'left' ? x0 + f * w : x1 - f * w);
  const frame = (label: string, caption: string, zoom: number, cx: number, cy: number): CloseUp => {
    const half = 0.5 / zoom;
    return {
      label,
      caption,
      zoom,
      cx: Math.min(1 - half, Math.max(half, cx)),
      cy: Math.min(1 - half, Math.max(half, cy)),
    };
  };
  return [
    frame('Front', 'Lights and the front end, up close', 2.3, along(0.17), y0 + 0.6 * h),
    frame('Wheels', 'Wheels and stance', 2.3, along(0.41), y0 + 0.74 * h),
    frame('Roofline', 'Roofline and glass', 2.1, along(0.6), y0 + 0.24 * h),
  ];
}
