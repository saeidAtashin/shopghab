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

export type MeshUv = { u: number; v: number };

const QUILT_STEPS = 8;

function cubic(a: number, b: number, c: number, d: number, t: number): number {
  const opposite = 1 - t;
  return opposite * opposite * opposite * a + 3 * opposite * opposite * t * b + 3 * opposite * t * t * c + t * t * t * d;
}

function bilerp(topLeft: number, topRight: number, bottomRight: number, bottomLeft: number, u: number, v: number): number {
  const top = topLeft * (1 - u) + topRight * u;
  const bottom = bottomLeft * (1 - u) + bottomRight * u;
  return top * (1 - v) + bottom * v;
}

function sliceUnit(slices: number[], index: number): number {
  const start = slices[0] ?? 0;
  const end = slices[slices.length - 1] ?? start;
  const span = end - start;
  if (span === 0) return 0;
  return ((slices[index] ?? start) - start) / span;
}

/** A Photoshop quilt: cubic Bezier patches, with one slice position per patch edge. */
export function isQuiltMesh(columns: number, rows: number, slicesX?: number[], slicesY?: number[]): boolean {
  if (!slicesX || !slicesY || columns < 4 || rows < 4) return false;
  if ((columns - 1) % 3 !== 0 || (rows - 1) % 3 !== 0) return false;
  return slicesX.length === (columns - 1) / 3 + 1 && slicesY.length === (rows - 1) / 3 + 1;
}

function bezierPoint(points: Point[], columns: number, patchColumn: number, patchRow: number, u: number, v: number): Point {
  const curves = [0, 1, 2, 3].map((dy) => {
    const row = patchRow * 3 + dy;
    const controls = [0, 1, 2, 3].map((dx) => points[row * columns + patchColumn * 3 + dx] ?? { x: 0, y: 0 });
    return {
      x: cubic(controls[0].x, controls[1].x, controls[2].x, controls[3].x, u),
      y: cubic(controls[0].y, controls[1].y, controls[2].y, controls[3].y, u),
    };
  });
  return {
    x: cubic(curves[0].x, curves[1].x, curves[2].x, curves[3].x, v),
    y: cubic(curves[0].y, curves[1].y, curves[2].y, curves[3].y, v),
  };
}

export function tessellateQuilt(
  columns: number,
  rows: number,
  points: Point[],
  slicesX: number[],
  slicesY: number[],
  steps = QUILT_STEPS,
): { columns: number; rows: number; points: Point[]; uvs: MeshUv[] } {
  const patchColumns = (columns - 1) / 3;
  const patchRows = (rows - 1) / 3;
  const outColumns = patchColumns * steps + 1;
  const outRows = patchRows * steps + 1;
  const outPoints: Point[] = [];
  const uvs: MeshUv[] = [];
  for (let row = 0; row < outRows; row += 1) {
    let patchRow = Math.floor(row / steps);
    let t = (row - patchRow * steps) / steps;
    if (patchRow >= patchRows) {
      patchRow = patchRows - 1;
      t = 1;
    }
    const v0 = sliceUnit(slicesY, patchRow);
    const v1 = sliceUnit(slicesY, patchRow + 1);
    for (let column = 0; column < outColumns; column += 1) {
      let patchColumn = Math.floor(column / steps);
      let s = (column - patchColumn * steps) / steps;
      if (patchColumn >= patchColumns) {
        patchColumn = patchColumns - 1;
        s = 1;
      }
      const u0 = sliceUnit(slicesX, patchColumn);
      const u1 = sliceUnit(slicesX, patchColumn + 1);
      outPoints.push(bezierPoint(points, columns, patchColumn, patchRow, s, t));
      uvs.push({ u: u0 + s * (u1 - u0), v: v0 + t * (v1 - v0) });
    }
  }
  return { columns: outColumns, rows: outRows, points: outPoints, uvs };
}

export function warpMesh(
  source: RawImage,
  columns: number,
  rows: number,
  points: Point[],
  width: number,
  height: number,
  uvs?: MeshUv[],
): RawImage {
  const data = Buffer.alloc(width * height * 4);
  if (columns < 2 || rows < 2 || points.length !== columns * rows) return { data, width, height };
  const customUv = uvs && uvs.length === columns * rows ? uvs : null;
  const at = (column: number, row: number): Point => points[row * columns + column] ?? { x: 0, y: 0 };
  const uvAt = (column: number, row: number): MeshUv =>
    customUv?.[row * columns + column] ?? { u: column / (columns - 1), v: row / (rows - 1) };
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
      const topLeft = uvAt(column, row);
      const topRight = uvAt(column + 1, row);
      const bottomRight = uvAt(column + 1, row + 1);
      const bottomLeft = uvAt(column, row + 1);
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const uv = invertQuad(x + 0.5, y + 0.5, quad);
          if (!uv) continue;
          const u = bilerp(topLeft.u, topRight.u, bottomRight.u, bottomLeft.u, uv.u, uv.v);
          const v = bilerp(topLeft.v, topRight.v, bottomRight.v, bottomLeft.v, uv.u, uv.v);
          const pixel = sample(source, u * maxSrcX, v * maxSrcY);
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

/** Quilt slices bend the artwork as Bezier patches. A plain grid stays bilinear. */
export function warpPrintMesh(
  source: RawImage,
  columns: number,
  rows: number,
  points: Point[],
  width: number,
  height: number,
  slicesX?: number[],
  slicesY?: number[],
): RawImage {
  if (isQuiltMesh(columns, rows, slicesX, slicesY) && slicesX && slicesY) {
    const grid = tessellateQuilt(columns, rows, points, slicesX, slicesY);
    return warpMesh(source, grid.columns, grid.rows, grid.points, width, height, grid.uvs);
  }
  return warpMesh(source, columns, rows, points, width, height);
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
