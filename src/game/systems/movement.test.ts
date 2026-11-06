import { describe, expect, it } from 'vitest';
import { PITCH } from '../core/pitch';
import { TUNING } from '../core/tuning';
import { distance, length, vec } from '../core/vec2';
import { createMatchState } from './matchSetup';
import { directionFromAxes, separatePlayers, updatePlayerMotion } from './movement';

describe('directionFromAxes', () => {
  it('retorna vetor nulo sem teclas ou com teclas opostas', () => {
    expect(directionFromAxes(false, false, false, false)).toEqual({ x: 0, y: 0 });
    expect(directionFromAxes(true, true, true, true)).toEqual({ x: 0, y: 0 });
  });

  it('normaliza a diagonal para comprimento 1', () => {
    const d = directionFromAxes(true, false, false, true);
    expect(length(d)).toBeCloseTo(1);
    expect(d.x).toBeCloseTo(Math.SQRT1_2);
    expect(d.y).toBeCloseTo(-Math.SQRT1_2);
  });
});

describe('updatePlayerMotion', () => {
  const freshPlayer = () => {
    const state = createMatchState({ userTeam: 'home', formations: { home: '2-1-1', away: '1-2-1' } });
    const p = state.players.find((pl) => pl.role === 'mid')!;
    p.pos = vec(PITCH.centerX, PITCH.centerY);
    return p;
  };

  it('a diagonal não percorre mais distância que o movimento horizontal', () => {
    const horizontal = freshPlayer();
    const diagonal = freshPlayer();
    horizontal.intent = { move: directionFromAxes(false, false, false, true), sprint: false };
    diagonal.intent = { move: directionFromAxes(false, true, false, true), sprint: false };
    const startH = horizontal.pos;
    const startD = diagonal.pos;
    for (let i = 0; i < 60; i++) {
      updatePlayerMotion(horizontal, false, 1 / 60);
      updatePlayerMotion(diagonal, false, 1 / 60);
    }
    expect(distance(startD, diagonal.pos)).toBeCloseTo(distance(startH, horizontal.pos), 5);
    expect(length(diagonal.vel)).toBeLessThanOrEqual(TUNING.player.walkSpeed + 1e-6);
  });

  it('correr aumenta a velocidade máxima', () => {
    const p = freshPlayer();
    p.intent = { move: vec(1, 0), sprint: true };
    for (let i = 0; i < 60; i++) updatePlayerMotion(p, false, 1 / 60);
    expect(length(p.vel)).toBeCloseTo(TUNING.player.sprintSpeed);
  });

  it('mantém o atleta dentro dos limites do campo', () => {
    const p = freshPlayer();
    p.intent = { move: vec(0, -1), sprint: true };
    for (let i = 0; i < 600; i++) updatePlayerMotion(p, false, 1 / 60);
    expect(p.pos.y).toBeGreaterThanOrEqual(PITCH.top - TUNING.player.sidelineMargin);
  });
});

describe('separatePlayers', () => {
  it('afasta atletas sobrepostos', () => {
    const state = createMatchState({ userTeam: 'home', formations: { home: '2-1-1', away: '1-2-1' } });
    const [a, b] = state.players;
    a.pos = vec(100, 60);
    b.pos = vec(102, 60);
    separatePlayers(state);
    expect(distance(a.pos, b.pos)).toBeGreaterThanOrEqual(TUNING.player.radius * 2 - 1e-6);
  });
});
