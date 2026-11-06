import type { HexColor, KitPattern, TeamKit } from '../../domain/kit';

/**
 * Camadas de um sprite-base de atleta. Cada pixel do modelo pertence a uma camada,
 * e a cor final é resolvida a partir do uniforme — a mesma ideia das máscaras
 * que serão usadas nos spritesheets definitivos (uma textura por uniforme em uso,
 * nunca uma imagem por combinação de cores).
 */
export type KitLayer = 'outline' | 'hair' | 'skin' | 'shirt' | 'detail' | 'shorts' | 'socks' | 'boots';

const LAYER_CODES: Readonly<Record<string, KitLayer>> = {
  o: 'outline',
  h: 'hair',
  s: 'skin',
  S: 'shirt',
  d: 'detail',
  p: 'shorts',
  k: 'socks',
  b: 'boots',
};

/**
 * Atleta provisório 10×16, vista top-down levemente inclinada (3/4).
 * `.` = transparente. Substituível por spritesheet + máscara sem mudar regras.
 */
export const PLAYER_TEMPLATE: readonly string[] = [
  '...oooo...',
  '..ohhhho..',
  '..osssso..',
  '...oddo...',
  '.oSSSSSSo.',
  'oSSSSSSSSo',
  'osSSSSSSso',
  'osSSSSSSso',
  '.oSSSSSSo.',
  '.oddddddo.',
  'oppppppppo',
  'oppo..oppo',
  'okko..okko',
  'okko..okko',
  'obbo..obbo',
  'oooo..oooo',
];

export const PLAYER_SPRITE_SIZE = { width: 10, height: 16 } as const;

/** Paleta fixa das camadas que não dependem do uniforme (provisória). */
export const NEUTRAL_PALETTE = {
  outline: '#1b1b24',
  hair: '#3b2414',
  skin: '#c98b5b',
  boots: '#141414',
} as const satisfies Partial<Record<KitLayer, HexColor>>;

export interface PixelBox {
  x0: number;
  y0: number;
  width: number;
  height: number;
}

/**
 * Decide se um pixel da camisa usa a cor principal ou a secundária,
 * conforme o padrão. (x, y) são relativos à caixa da camisa.
 */
export function shirtPatternColor(pattern: KitPattern, x: number, y: number, box: PixelBox): 'primary' | 'secondary' {
  const w = box.width;
  const h = box.height;
  switch (pattern) {
    case 'solid':
      return 'primary';
    case 'verticalStripes':
      return ((x + 1) >> 1) % 2 === 1 ? 'secondary' : 'primary';
    case 'horizontalStripes':
      return y % 2 === 1 ? 'secondary' : 'primary';
    case 'diagonalSash': {
      const u = w > 1 ? x / (w - 1) : 0;
      const v = h > 1 ? y / (h - 1) : 0;
      return Math.abs(u - v) < 0.25 ? 'secondary' : 'primary';
    }
    case 'halves':
      return x < w / 2 ? 'primary' : 'secondary';
    case 'centralStripe':
      return Math.abs(x - (w - 1) / 2) < 1 ? 'secondary' : 'primary';
  }
}

/** Caixa delimitadora dos pixels de camisa no modelo. */
export function shirtBox(template: readonly string[]): PixelBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  template.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (LAYER_CODES[c] !== 'shirt') return;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
  });
  if (minX === Infinity) return { x0: 0, y0: 0, width: 0, height: 0 };
  return { x0: minX, y0: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * Compõe o sprite aplicando o uniforme às camadas do modelo.
 * Retorna uma matriz de cores (`null` = transparente), pronta para virar textura.
 */
export function composeKitSprite(kit: TeamKit, template: readonly string[] = PLAYER_TEMPLATE): (HexColor | null)[][] {
  const box = shirtBox(template);
  return template.map((row, y) =>
    [...row].map((c, x) => {
      const layer = LAYER_CODES[c];
      if (!layer) return null;
      switch (layer) {
        case 'shirt':
          return shirtPatternColor(kit.pattern, x - box.x0, y - box.y0, box) === 'primary' ? kit.primary : kit.secondary;
        case 'detail':
          return kit.detail;
        case 'shorts':
          return kit.shorts;
        case 'socks':
          return kit.socks;
        default:
          return NEUTRAL_PALETTE[layer];
      }
    }),
  );
}
