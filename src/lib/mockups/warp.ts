import type { Point } from "./types";

export type RawImage = {
  data: Buffer;
  width: number;
  height: number;
};

type Vec = { x: number; y: number };

function cross(a: Vec, b: Vec): number {
  return a.x * b.y - a.y * b.x;
}

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** Inverse bilinear map. `u`/`v` are 0 at the top-left and 1 at the bottom-right of the quad. */
export function invertQuad(x: number, y: number, quad: [Point, Point, Point, Point]): { u: number; v: number } | null {
  const [tl, tr, br, bl] = quad;
  const a = tl;
  const b = tr;
  const c = br;
  const d = bl;
  const e = sub(b, a);
  const f = sub(d, a);
  const g = add(sub(a, b), sub(c, d));
  const h = sub({ x, y }, a);
  const k2 = cross(g, f);
  const k1 = cross(e, f) + cross(h, g);
  const k0 = cross(h, e);

  const candidates: number[] = [];
  if (Math.abs(k2) < 1e-8) {
    if (Math.abs(k1) < 1e-8) return null;
    candidates.push(-k0 / k1);
  } else {
    const discriminant = k1 * k1 - 4 * k0 * k2;
    if (discriminant < 0) return null;
    const root = Math.sqrt(discriminant);
    candidates.push((-k1 - root) / (2 * k2), (-k1 + root) / (2 * k2));
  }

  for (const v of candidates) {
    if (v < -0.001 || v > 1.001) continue;
    const denomX = e.x + g.x * v;
    const denomY = e.y + g.y * v;
    const u = Math.abs(denomX) >= Math.abs(denomY)
      ? (h.x - f.x * v) / denomX
      : (h.y - f.y * v) / denomY;
    if (u >= -0.001 && u <= 1.001) {
      return { u: Math.min(1, Math.max(0, u)), v: Math.min(1, Math.max(0, v)) };
    }
  }
  return null;
}

function sample(image: RawImage, x: number, y: number): [number, number, number, number] {
  if (x < 0 || y < 0 || x > image.width - 1 || y > image.height - 1) return [0, 0, 0, 0];
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(image.width - 1, x0 + 1);
  const y1 = Math.min(image.height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;
  const at = (px: number, py: number) => {
    const index = (py * image.width + px) * 4;
    return [
      image.data[index] ?? 0,
      image.data[index + 1] ?? 0,
      image.data[index + 2] ?? 0,
      image.data[index + 3] ?? 0,
    ] as [number, number, number, number];
  };
  const p00 = at(x0, y0);
  const p10 = at(x1, y0);
  const p01 = at(x0, y1);
  const p11 = at(x1, y1);
  return [0, 1, 2, 3].map((channel) => {
    const top = p00[channel] * (1 - tx) + p10[channel] * tx;
    const bottom = p01[channel] * (1 - tx) + p11[channel] * tx;
    return Math.round(top * (1 - ty) + bottom * ty);
  }) as [number, number, number, number];
}

export function warpImage(
  source: RawImage,
  quad: [Point, Point, Point, Point],
  width: number,
  height: number,
): RawImage {
  const data = Buffer.alloc(width * height * 4);
  const maxX = Math.max(1, source.width - 1);
  const maxY = Math.max(1, source.height - 1);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const uv = invertQuad(x + 0.5, y + 0.5, quad);
      if (!uv) continue;
      const pixel = sample(source, uv.u * maxX, uv.v * maxY);
      const index = (y * width + x) * 4;
      data[index] = pixel[0];
      data[index + 1] = pixel[1];
      data[index + 2] = pixel[2];
      data[index + 3] = pixel[3];
    }
  }
  return { data, width, height };
}

export function warpMesh(
  source: RawImage,
  columns: number,
  rows: number,
  points: Point[],
  width: number,
  height: number,
): RawImage {
  const data = Buffer.alloc(width * height * 4);
  if (columns < 2 || rows < 2 || points.length !== columns * rows) return { data, width, height };
  const at = (column: number, row: number): Point => points[row * columns + column] ?? { x: 0, y: 0 };
  const maxSrcX = Math.max(1, source.width - 1);
  const maxSrcY = Math.max(1, source.height - 1);
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const quad: [Point, Point, Point, Point] = [
        at(column, row),
        at(column + 1, row),
        at(column + 1, row + 1),
        at(column, row + 1),
      ];
      const minX = Math.max(0, Math.floor(Math.min(quad[0].x, quad[1].x, quad[2].x, quad[3].x)));
      const maxX = Math.min(width - 1, Math.ceil(Math.max(quad[0].x, quad[1].x, quad[2].x, quad[3].x)));
      const minY = Math.max(0, Math.floor(Math.min(quad[0].y, quad[1].y, quad[2].y, quad[3].y)));
      const maxY = Math.min(height - 1, Math.ceil(Math.max(quad[0].y, quad[1].y, quad[2].y, quad[3].y)));
      const u0 = column / (columns - 1);
      const u1 = (column + 1) / (columns - 1);
      const v0 = row / (rows - 1);
      const v1 = (row + 1) / (rows - 1);
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const uv = invertQuad(x + 0.5, y + 0.5, quad);
          if (!uv) continue;
          const pixel = sample(source, (u0 + uv.u * (u1 - u0)) * maxSrcX, (v0 + uv.v * (v1 - v0)) * maxSrcY);
          if (pixel[3] === 0) continue;
          const index = (y * width + x) * 4;
          data[index] = pixel[0];
          data[index + 1] = pixel[1];
          data[index + 2] = pixel[2];
          data[index + 3] = pixel[3];
        }
      }
    }
  }
  return { data, width, height };
}

export function displaceImage(source: RawImage, map: RawImage, scaleX: number, scaleY: number): RawImage {
  const data = Buffer.alloc(source.width * source.height * 4);
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const mapIndex = (y * map.width + x) * 4;
      const red = map.data[mapIndex] ?? 128;
      const green = map.data[mapIndex + 1] ?? 128;
      const offsetX = ((red - 128) / 128) * scaleX;
      const offsetY = ((green - 128) / 128) * scaleY;
      const pixel = sample(source, x + offsetX, y + offsetY);
      const index = (y * source.width + x) * 4;
      data[index] = pixel[0];
      data[index + 1] = pixel[1];
      data[index + 2] = pixel[2];
      data[index + 3] = pixel[3];
    }
  }
  return { data, width: source.width, height: source.height };
}
