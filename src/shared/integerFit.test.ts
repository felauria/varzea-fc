import { describe, expect, it } from 'vitest';
import { computeIntegerFit } from './integerFit';

describe('computeIntegerFit', () => {
  it('usa escala inteira quando cabe pelo menos 1×', () => {
    expect(computeIntegerFit(1920, 1080, 640, 360)).toEqual({ width: 1920, height: 1080, scale: 3 });
    expect(computeIntegerFit(1900, 1000, 640, 360)).toEqual({ width: 1280, height: 720, scale: 2 });
  });

  it('preserva a proporção 16:9 em janelas largas ou altas', () => {
    const wide = computeIntegerFit(3000, 800, 640, 360);
    const tall = computeIntegerFit(700, 2000, 640, 360);
    expect(wide.width / wide.height).toBeCloseTo(16 / 9);
    expect(tall.width / tall.height).toBeCloseTo(16 / 9);
  });

  it('reduz proporcionalmente em espaços menores que a resolução base', () => {
    const fit = computeIntegerFit(320, 400, 640, 360);
    expect(fit.scale).toBeCloseTo(0.5);
    expect(fit.width).toBe(320);
  });

  it('lida com espaço vazio', () => {
    expect(computeIntegerFit(0, 0, 640, 360).scale).toBe(0);
  });
});
