/** Vetor 2D imutável usado por todas as regras puras da partida. */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export const ZERO: Vec2 = Object.freeze({ x: 0, y: 0 });

export const vec = (x: number, y: number): Vec2 => ({ x, y });
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const lengthSq = (a: Vec2): number => a.x * a.x + a.y * a.y;
export const length = (a: Vec2): number => Math.sqrt(lengthSq(a));
export const distance = (a: Vec2, b: Vec2): number => length(sub(a, b));

/** Normaliza o vetor. Retorna ZERO para vetores nulos (evita NaN). */
export function normalize(a: Vec2): Vec2 {
  const len = length(a);
  return len > 1e-9 ? { x: a.x / len, y: a.y / len } : ZERO;
}

export function clampLength(a: Vec2, max: number): Vec2 {
  const len = length(a);
  return len > max && len > 0 ? scale(a, max / len) : a;
}

export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export function rotate(a: Vec2, radians: number): Vec2 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
}

/** Move `current` em direção a `target` em no máximo `maxDelta` (aceleração limitada). */
export function approach(current: Vec2, target: Vec2, maxDelta: number): Vec2 {
  const diff = sub(target, current);
  const len = length(diff);
  if (len <= maxDelta || len === 0) return target;
  return add(current, scale(diff, maxDelta / len));
}

/** Menor distância entre o ponto `p` e o segmento `a`→`b`. */
export function distanceToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const ab = sub(b, a);
  const lenSq = lengthSq(ab);
  if (lenSq === 0) return distance(p, a);
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / lenSq));
  return distance(p, add(a, scale(ab, t)));
}

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));
