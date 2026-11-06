import { describe, expect, it } from 'vitest';
import { GOAL, PITCH } from '../core/pitch';
import { createRng } from '../core/rng';
import { TUNING } from '../core/tuning';
import type { MatchState, PlayerState } from '../core/types';
import { length, normalize, vec } from '../core/vec2';
import { choosePassOption, groundPassSpeed, planPass, planShot } from './kicks';
import { createMatchState } from './matchSetup';

function layout(): { state: MatchState; passer: PlayerState; up: PlayerState; ahead: PlayerState } {
  const state = createMatchState({ userTeam: 'home', formations: { home: '2-1-1', away: '1-2-1' } });
  const home = state.players.filter((p) => p.team === 'home' && p.role !== 'gk');
  const [passer, up, ahead, far] = home;
  passer.pos = vec(250, 180);
  up.pos = vec(250, 100);
  ahead.pos = vec(350, 182);
  far.pos = vec(60, 180); // atrás do passador: fora do cone para cima/baixo/frente
  // Adversários afastados para não fechar as linhas de passe.
  for (const p of state.players.filter((pl) => pl.team === 'away')) p.pos = vec(560, 40);
  return { state, passer, up, ahead };
}

describe('choosePassOption', () => {
  it('escolhe o companheiro na direção da mira', () => {
    const { state, passer, up, ahead } = layout();
    expect(choosePassOption(state, passer, vec(0, -1), 'short')?.receiver.id).toBe(up.id);
    expect(choosePassOption(state, passer, vec(1, 0), 'short')?.receiver.id).toBe(ahead.id);
  });

  it('retorna null quando não há companheiro dentro do cone', () => {
    const { state, passer } = layout();
    expect(choosePassOption(state, passer, vec(0, 1), 'short')).toBeNull();
  });

  it('o passe em profundidade mira à frente do receptor', () => {
    const { state, passer, ahead } = layout();
    const option = choosePassOption(state, passer, vec(1, 0), 'through');
    expect(option?.receiver.id).toBe(ahead.id);
    expect(option!.target.x).toBeGreaterThan(ahead.pos.x + 30);
  });

  it('evita linhas de passe bloqueadas por adversários', () => {
    const { state, passer, up, ahead } = layout();
    up.pos = vec(300, 130); // diagonal livre
    const blocker = state.players.find((p) => p.team === 'away' && p.role !== 'gk')!;
    blocker.pos = vec(300, 181); // bloqueia o passe para frente
    const option = choosePassOption(state, passer, normalize(vec(1, -0.6)), 'short');
    expect(option?.receiver.id).toBe(up.id);
    expect(option?.receiver.id).not.toBe(ahead.id);
  });
});

describe('planPass', () => {
  it('passe rasteiro chega ao alvo com velocidade residual (sem parar antes)', () => {
    const plan = planPass('short', vec(100, 100), vec(220, 100));
    const travel = length(plan.vel) / TUNING.ball.groundDamping;
    expect(travel).toBeGreaterThan(120);
    expect(plan.vz).toBe(0);
  });

  it('passe longo sobe e cai perto do alvo', () => {
    const from = vec(100, 180);
    const target = vec(400, 180);
    const plan = planPass('long', from, target);
    const flightTime = (2 * plan.vz) / TUNING.ball.gravity;
    expect(plan.vz).toBeGreaterThan(TUNING.ball.controlHeight);
    expect(from.x + plan.vel.x * flightTime).toBeCloseTo(target.x, 0);
  });

  it('limita a velocidade do passe rasteiro', () => {
    expect(groundPassSpeed(10, 0)).toBe(TUNING.pass.minSpeed);
    expect(groundPassSpeed(10_000, 0)).toBe(TUNING.pass.maxSpeed);
  });
});

describe('planShot', () => {
  it('mira dentro do gol adversário e respeita o canto escolhido', () => {
    const { passer } = layout();
    passer.pos = vec(PITCH.right - 100, PITCH.centerY);
    const rng = createRng(1);
    const high = planShot(passer, vec(0, -1), null, rng);
    const low = planShot(passer, vec(0, 1), null, rng);
    for (const shot of [high, low]) {
      expect(Math.abs(shot.target.y - PITCH.centerY)).toBeLessThan(GOAL.halfWidth);
      expect(shot.vel.x).toBeGreaterThan(0);
      expect(shot.vz).toBeLessThan(TUNING.shot.maxLoft + 1e-9);
    }
    expect(high.target.y).toBeLessThan(PITCH.centerY);
    expect(low.target.y).toBeGreaterThan(PITCH.centerY);
  });

  it('chuta em direção ao gol mesmo sem direção pressionada', () => {
    const { passer } = layout();
    passer.pos = vec(PITCH.right - 150, PITCH.centerY + 60);
    const shot = planShot(passer, vec(0, 0), null, createRng(3));
    const t = (PITCH.right - passer.pos.x) / shot.vel.x;
    const yAtLine = passer.pos.y + shot.vel.y * t;
    expect(Math.abs(yAtLine - PITCH.centerY)).toBeLessThan(GOAL.halfWidth + 6);
  });
});
