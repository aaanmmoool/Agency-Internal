import * as THREE from "three";
import { BOARD } from "@/config/scene";

/**
 * Facade signage: multi-line content drawn once into a canvas texture.
 *
 * Everything the visitor reads in the world is painted onto the buildings with
 * this, so a board is laid out the way the building is measured — in world
 * metres. `unit` is the height of body text standing on the facade, and every
 * other size is a multiple of it. If the content does not fit the surface the
 * whole layout is scaled down together rather than clipped.
 */

export type BoardBlock =
  /** Small uppercase caption. */
  | { kind: "eyebrow"; text: string; color?: string }
  /** Display line. `aside` is set in eyebrow style against the right edge. */
  | { kind: "heading"; text: string; scale?: number; color?: string; aside?: string }
  | { kind: "text"; text: string; scale?: number; color?: string }
  /** An eyebrow label over a paragraph. */
  | { kind: "field"; label: string; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "tags"; items: string[]; color?: string }
  /** Extra vertical space, in units. */
  | { kind: "gap"; size: number }
  /** Side-by-side columns, each laid out as its own stack under a hairline. */
  | { kind: "columns"; columns: BoardBlock[][] };

export interface BoardSpec {
  /** Surface size in world metres. */
  width: number;
  height: number;
  /** Body text height in metres. */
  unit: number;
  /** Inner margin, in units. */
  padding?: number;
  align?: "left" | "center";
  /** Vertical placement of the content. Centred boards default to the middle. */
  valign?: "top" | "middle";
  blocks: BoardBlock[];
}

/** Largest texture edge we allow a single board, whatever the density. */
const MAX_EDGE = 2048;
/** The layout never shrinks below this fraction of its designed size. */
const MIN_FIT = 0.55;
const WEIGHTS = [400, 500, 600] as const;
const FALLBACK_FAMILY = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

/** The page's own typeface, so the world and the document read as one site. */
function fontFamily(): string {
  if (typeof document === "undefined") return FALLBACK_FAMILY;
  return getComputedStyle(document.body).fontFamily || FALLBACK_FAMILY;
}

/** True once every weight a board uses can be drawn in the page typeface. */
export function boardFontsLoaded(): boolean {
  const family = fontFamily();
  return WEIGHTS.every((w) => document.fonts.check(`${w} 32px ${family}`));
}

let fontsPending: Promise<void> | null = null;

/** Resolves when the page typeface is usable on a canvas. Never rejects. */
export function boardFontsReady(): Promise<void> {
  if (!fontsPending) {
    const family = fontFamily();
    fontsPending = Promise.all(WEIGHTS.map((w) => document.fonts.load(`${w} 32px ${family}`))).then(
      () => undefined,
      () => undefined,
    );
  }
  return fontsPending;
}

/** Pixel density that keeps a board within the texture budget. */
function densityFor(spec: BoardSpec, density: number): number {
  return Math.min(density, MAX_EDGE / spec.width, MAX_EDGE / spec.height);
}

export function createBoardTexture(spec: BoardSpec, density: number): THREE.CanvasTexture {
  const ppm = densityFor(spec, density);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(spec.width * ppm);
  canvas.height = Math.round(spec.height * ppm);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  paint(canvas, spec, ppm);
  texture.needsUpdate = true;
  return texture;
}

/** Repaint in place — used once the page typeface has finished loading. */
export function redrawBoard(texture: THREE.CanvasTexture, spec: BoardSpec, density: number): void {
  paint(texture.image as HTMLCanvasElement, spec, densityFor(spec, density));
  texture.needsUpdate = true;
}

// ---------------------------------------------------------------------------
// Layout. One routine both measures and draws, so the two can never disagree.

interface Ctx {
  g: CanvasRenderingContext2D;
  family: string;
  /** Body size in pixels, after fitting. */
  u: number;
  center: boolean;
  draw: boolean;
}

function setFont(c: Ctx, size: number, weight: number, tracking = 0): void {
  c.g.font = `${weight} ${size}px ${c.family}`;
  // Canvas letter-spacing is not universal; without it the text is simply tighter.
  if ("letterSpacing" in c.g) c.g.letterSpacing = `${tracking * size}px`;
}

function wrap(c: Ctx, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && c.g.measureText(next).width > max) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Lays out wrapped lines and returns the height they occupy. */
function lines(
  c: Ctx,
  text: string,
  x: number,
  y: number,
  w: number,
  size: number,
  lineHeight: number,
  color: string,
): number {
  const rows = wrap(c, text, w);
  const step = size * lineHeight;
  if (c.draw) {
    c.g.fillStyle = color;
    c.g.textAlign = c.center ? "center" : "left";
    rows.forEach((row, i) => c.g.fillText(row, c.center ? x + w / 2 : x, y + step * i + step / 2));
  }
  return rows.length * step;
}

function eyebrow(c: Ctx, text: string, x: number, y: number, w: number, color: string): number {
  const size = c.u * 0.74;
  setFont(c, size, 500, 0.18);
  return lines(c, text.toUpperCase(), x, y, w, size, 1.35, color);
}

function heading(c: Ctx, b: Extract<BoardBlock, { kind: "heading" }>, x: number, y: number, w: number): number {
  let asideWidth = 0;
  const asideSize = c.u * 0.74;
  if (b.aside) {
    setFont(c, asideSize, 500, 0.12);
    asideWidth = c.g.measureText(b.aside).width + c.u;
  }

  const size = c.u * 2.1 * (b.scale ?? 1);
  setFont(c, size, 500, -0.02);
  const height = lines(c, b.text, x, y, w - asideWidth, size, 1.16, b.color ?? BOARD.ink);

  if (b.aside && c.draw) {
    setFont(c, asideSize, 500, 0.12);
    c.g.fillStyle = BOARD.faint;
    c.g.textAlign = "right";
    c.g.fillText(b.aside, x + w, y + (size * 1.16) / 2);
  }
  return height;
}

function tags(c: Ctx, items: string[], x: number, y: number, w: number, color?: string): number {
  const size = c.u * 0.8;
  const padX = c.u * 0.62;
  const chipH = c.u * 1.62;
  const gap = c.u * 0.38;
  setFont(c, size, 400, 0.02);

  // Flow the chips into rows first so centred rows can be offset as a whole.
  const rows: { label: string; width: number }[][] = [[]];
  let rowWidth = 0;
  for (const label of items) {
    const width = c.g.measureText(label).width + padX * 2;
    const row = rows[rows.length - 1];
    if (row.length && rowWidth + gap + width > w) {
      rows.push([{ label, width }]);
      rowWidth = width;
    } else {
      rowWidth += (row.length ? gap : 0) + width;
      row.push({ label, width });
    }
  }

  if (c.draw) {
    c.g.lineWidth = Math.max(1, c.u * 0.07);
    c.g.textAlign = "center";
    rows.forEach((row, r) => {
      const total = row.reduce((sum, chip, i) => sum + chip.width + (i ? gap : 0), 0);
      let cx = c.center ? x + (w - total) / 2 : x;
      const cy = y + r * (chipH + gap);
      for (const chip of row) {
        c.g.strokeStyle = color ? `${color}66` : BOARD.edgeStrong;
        c.g.beginPath();
        c.g.roundRect(cx, cy, chip.width, chipH, chipH / 2);
        c.g.stroke();
        c.g.fillStyle = color ?? BOARD.muted;
        c.g.fillText(chip.label, cx + chip.width / 2, cy + chipH / 2);
        cx += chip.width + gap;
      }
    });
  }
  return rows.length * chipH + (rows.length - 1) * gap;
}

function list(c: Ctx, items: string[], x: number, y: number, w: number): number {
  const size = c.u;
  setFont(c, size, 400);
  const dash = "— ";
  const indent = c.g.measureText(dash).width;
  let h = 0;
  items.forEach((item, i) => {
    if (i) h += c.u * 0.22;
    if (c.draw) {
      c.g.fillStyle = BOARD.faint;
      c.g.textAlign = "left";
      c.g.fillText(dash, x, y + h + (size * 1.42) / 2);
    }
    h += lines(c, item, x + indent, y + h, w - indent, size, 1.42, BOARD.muted);
  });
  return h;
}

/** Space above a block, in units, given the block before it. */
function spaceBefore(prev: BoardBlock | undefined, block: BoardBlock): number {
  if (!prev || block.kind === "gap" || prev.kind === "gap") return 0;
  if (prev.kind === "eyebrow") return 0.4;
  // A name and the role beneath it read as one unit.
  if (prev.kind === "heading" && block.kind === "eyebrow") return 0.35;
  if (block.kind === "tags") return 0.75;
  return 0.95;
}

function stack(c: Ctx, blocks: BoardBlock[], x: number, y: number, w: number): number {
  let h = 0;
  let prev: BoardBlock | undefined;

  for (const b of blocks) {
    h += spaceBefore(prev, b) * c.u;
    const top = y + h;

    switch (b.kind) {
      case "eyebrow":
        h += eyebrow(c, b.text, x, top, w, b.color ?? BOARD.faint);
        break;
      case "heading":
        h += heading(c, b, x, top, w);
        break;
      case "text": {
        const size = c.u * (b.scale ?? 1);
        setFont(c, size, 400);
        h += lines(c, b.text, x, top, w, size, 1.45, b.color ?? BOARD.muted);
        break;
      }
      case "field":
        h += eyebrow(c, b.label, x, top, w, BOARD.faint);
        h += c.u * 0.3;
        setFont(c, c.u, 400);
        h += lines(c, b.text, x, y + h, w, c.u, 1.45, BOARD.muted);
        break;
      case "list":
        h += list(c, b.items, x, top, w);
        break;
      case "tags":
        h += tags(c, b.items, x, top, w, b.color);
        break;
      case "gap":
        h += b.size * c.u;
        break;
      case "columns": {
        const gutter = c.u * 1.6;
        const n = b.columns.length;
        const colW = (w - gutter * (n - 1)) / n;
        const inset = c.u * 0.9;
        let tallest = 0;
        b.columns.forEach((col, i) => {
          const cx = x + i * (colW + gutter);
          if (c.draw) {
            c.g.fillStyle = BOARD.edgeStrong;
            c.g.fillRect(cx, top, colW, Math.max(1, c.u * 0.06));
          }
          tallest = Math.max(tallest, stack(c, col, cx, top + inset, colW));
        });
        h += inset + tallest;
        break;
      }
    }
    prev = b;
  }
  return h;
}

function paint(canvas: HTMLCanvasElement, spec: BoardSpec, ppm: number): void {
  const g = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;
  g.clearRect(0, 0, W, H);
  g.textBaseline = "middle";

  const c: Ctx = {
    g,
    family: fontFamily(),
    u: spec.unit * ppm,
    center: spec.align === "center",
    draw: false,
  };

  // Fit: shrink the whole layout together until it sits inside the surface.
  const designed = c.u;
  let fit = 1;
  let needed = 0;
  for (;;) {
    c.u = designed * fit;
    const pad = c.u * (spec.padding ?? 1.8);
    needed = stack(c, spec.blocks, pad, 0, W - pad * 2) + pad * 2;
    if (needed <= H || fit <= MIN_FIT) break;
    fit = Math.max(MIN_FIT, fit * Math.min(0.97, Math.sqrt(H / needed)));
  }

  // The screen: a dark, slightly translucent plate with a hairline edge.
  const radius = c.u * 0.7;
  const edge = Math.max(1, c.u * 0.08);
  g.fillStyle = BOARD.surface;
  g.beginPath();
  g.roundRect(edge, edge, W - edge * 2, H - edge * 2, radius);
  g.fill();
  g.strokeStyle = BOARD.edge;
  g.lineWidth = edge;
  g.stroke();

  const pad = c.u * (spec.padding ?? 1.8);
  const middle = (spec.valign ?? (c.center ? "middle" : "top")) === "middle";
  const top = middle ? Math.max(0, (H - needed) / 2) : 0;
  c.draw = true;
  stack(c, spec.blocks, pad, top + pad, W - pad * 2);
}
