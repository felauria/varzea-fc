/**
 * Uniforme de um clube. As cores são aplicadas dinamicamente sobre sprites-base
 * com camadas (ver `game/assets/kitSprite.ts`), sem gerar uma imagem por combinação.
 */
export type KitPattern =
  | 'solid'
  | 'verticalStripes'
  | 'horizontalStripes'
  | 'diagonalSash'
  | 'halves'
  | 'centralStripe';

export const KIT_PATTERNS: readonly KitPattern[] = [
  'solid',
  'verticalStripes',
  'horizontalStripes',
  'diagonalSash',
  'halves',
  'centralStripe',
];

/** Cor no formato `#rrggbb`. */
export type HexColor = `#${string}`;

export interface TeamKit {
  readonly primary: HexColor;
  readonly secondary: HexColor;
  readonly detail: HexColor;
  readonly pattern: KitPattern;
  readonly shorts: HexColor;
  readonly socks: HexColor;
}

export function hexToRgb(hex: HexColor): { r: number; g: number; b: number } {
  const value = Number.parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 0xff, g: (value >> 8) & 0xff, b: value & 0xff };
}

/** Luminância relativa (WCAG), útil para verificar contraste entre uniformes. */
export function relativeLuminance(hex: HexColor): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
