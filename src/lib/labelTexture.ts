import * as THREE from "three";

/**
 * Text rendered once into a canvas texture.
 *
 * Signage in the world is static, so drawing it to a texture is far cheaper
 * than an SDF text renderer, needs no font download, and keeps every sign a
 * single unlit quad. Textures are cached and reference-counted by cache key.
 */

interface LabelOptions {
  text: string;
  color?: string;
  /** Background fill; omit for transparent. */
  background?: string;
  font?: string;
  weight?: number;
  letterSpacing?: number;
  /** Texture width in pixels. Height is derived from `aspect`. */
  width?: number;
  aspect?: number;
  align?: "left" | "center";
}

const cache = new Map<string, THREE.CanvasTexture>();

function keyOf(o: Required<Omit<LabelOptions, "background">> & { background?: string }): string {
  return [
    o.text,
    o.color,
    o.background ?? "-",
    o.font,
    o.weight,
    o.letterSpacing,
    o.width,
    o.aspect,
    o.align,
  ].join("|");
}

export function labelTexture(options: LabelOptions): THREE.CanvasTexture {
  const o = {
    color: "#E8ECF6",
    font: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    weight: 600,
    letterSpacing: 0.12,
    width: 512,
    aspect: 4,
    align: "center" as const,
    ...options,
  };

  const key = keyOf(o);
  const hit = cache.get(key);
  if (hit) return hit;

  const height = Math.round(o.width / o.aspect);
  const canvas = document.createElement("canvas");
  canvas.width = o.width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  if (o.background) {
    ctx.fillStyle = o.background;
    ctx.fillRect(0, 0, o.width, height);
  }

  // Fit the text to the canvas rather than guessing a point size.
  const padding = o.width * 0.06;
  let size = height * 0.62;
  const spacing = o.letterSpacing;
  const measure = (s: number) => {
    ctx.font = `${o.weight} ${s}px ${o.font}`;
    return ctx.measureText(o.text).width + spacing * s * (o.text.length - 1);
  };
  while (size > 6 && measure(size) > o.width - padding * 2) size *= 0.94;

  ctx.font = `${o.weight} ${size}px ${o.font}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = o.color;

  const total = measure(size);
  let x = o.align === "center" ? (o.width - total) / 2 : padding;
  const y = height / 2;
  for (const ch of o.text) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + spacing * size;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
}

/** Dispose every cached label texture. Called when the scene unmounts. */
export function disposeLabels(): void {
  for (const texture of cache.values()) texture.dispose();
  cache.clear();
}
