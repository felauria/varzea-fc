import { describe, expect, it } from 'vitest';
import { detectGoal, GOAL, isInPenaltyArea, PITCH } from './pitch';
import { vec } from './vec2';

const R = 2;

describe('detectGoal', () => {
  it('marca gol do visitante quando a bola cruza a linha esquerda entre as traves', () => {
    expect(detectGoal(vec(PITCH.left + 3, PITCH.centerY), vec(PITCH.left - 5, PITCH.centerY + 4), 0, R)).toBe('away');
  });

  it('marca gol da casa quando a bola cruza a linha direita entre as traves', () => {
    expect(detectGoal(vec(PITCH.right - 3, PITCH.centerY), vec(PITCH.right + 5, PITCH.centerY - 10), 0, R)).toBe('home');
  });

  it('não marca gol fora das traves', () => {
    const y = PITCH.centerY + GOAL.halfWidth + 5;
    expect(detectGoal(vec(PITCH.right - 3, y), vec(PITCH.right + 5, y), 0, R)).toBeNull();
  });

  it('não marca gol por cima do travessão', () => {
    expect(detectGoal(vec(PITCH.right - 3, PITCH.centerY), vec(PITCH.right + 5, PITCH.centerY), GOAL.crossbarHeight + 1, R)).toBeNull();
  });

  it('exige que a bola inteira cruze a linha', () => {
    expect(detectGoal(vec(PITCH.right - 3, PITCH.centerY), vec(PITCH.right + 1, PITCH.centerY), 0, R)).toBeNull();
  });

  it('usa o ponto de cruzamento, não apenas a posição final', () => {
    // Termina fora da boca do gol, mas cruzou a linha entre as traves.
    const prev = vec(PITCH.right + 1, PITCH.centerY + GOAL.halfWidth - 3);
    const next = vec(PITCH.right + 12, PITCH.centerY + GOAL.halfWidth + 20);
    expect(detectGoal(prev, next, 0, R)).toBe('home');
  });
});

describe('isInPenaltyArea', () => {
  it('reconhece a área de cada time', () => {
    expect(isInPenaltyArea('home', vec(PITCH.left + 20, PITCH.centerY))).toBe(true);
    expect(isInPenaltyArea('away', vec(PITCH.left + 20, PITCH.centerY))).toBe(false);
    expect(isInPenaltyArea('away', vec(PITCH.right - 20, PITCH.centerY + 30))).toBe(true);
    expect(isInPenaltyArea('home', vec(PITCH.centerX, PITCH.centerY))).toBe(false);
  });
});
