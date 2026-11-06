import { describe, expect, it } from 'vitest';
import { KIT_PATTERNS, type TeamKit } from '../../domain/kit';
import { composeKitSprite, PLAYER_SPRITE_SIZE, PLAYER_TEMPLATE, shirtBox, shirtPatternColor } from './kitSprite';

const kit: TeamKit = {
  primary: '#111111',
  secondary: '#eeeeee',
  detail: '#ff0000',
  pattern: 'solid',
  shorts: '#00ff00',
  socks: '#0000ff',
};

describe('PLAYER_TEMPLATE', () => {
  it('tem dimensões consistentes', () => {
    expect(PLAYER_TEMPLATE).toHaveLength(PLAYER_SPRITE_SIZE.height);
    for (const row of PLAYER_TEMPLATE) expect(row).toHaveLength(PLAYER_SPRITE_SIZE.width);
  });
});

describe('composeKitSprite', () => {
  it('aplica as cores do uniforme às camadas certas', () => {
    const pixels = composeKitSprite(kit).flat();
    for (const color of [kit.primary, kit.detail, kit.shorts, kit.socks]) expect(pixels).toContain(color);
    expect(pixels).not.toContain(kit.secondary); // camisa lisa
  });

  it('cada padrão diferente de "liso" usa as duas cores na camisa', () => {
    for (const pattern of KIT_PATTERNS.filter((p) => p !== 'solid')) {
      const pixels = composeKitSprite({ ...kit, pattern }).flat();
      expect(pixels, pattern).toContain(kit.primary);
      expect(pixels, pattern).toContain(kit.secondary);
    }
  });

  it('o mesmo modelo serve para qualquer combinação de cores (sem imagens pré-geradas)', () => {
    const a = composeKitSprite(kit);
    const b = composeKitSprite({ ...kit, primary: '#123456' });
    const transparentA = a.flat().map((c) => c === null);
    const transparentB = b.flat().map((c) => c === null);
    expect(transparentA).toEqual(transparentB);
  });
});

describe('shirtPatternColor', () => {
  const box = shirtBox(PLAYER_TEMPLATE);

  it('listras verticais são simétricas', () => {
    for (let x = 0; x < box.width; x++) {
      expect(shirtPatternColor('verticalStripes', x, 0, box)).toBe(
        shirtPatternColor('verticalStripes', box.width - 1 - x, 0, box),
      );
    }
  });

  it('metade a metade divide a camisa no meio', () => {
    expect(shirtPatternColor('halves', 0, 0, box)).toBe('primary');
    expect(shirtPatternColor('halves', box.width - 1, 0, box)).toBe('secondary');
  });
});
