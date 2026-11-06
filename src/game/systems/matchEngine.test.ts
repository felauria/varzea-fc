import { describe, expect, it } from 'vitest';
import { PITCH } from '../core/pitch';
import { createRng } from '../core/rng';
import { TUNING } from '../core/tuning';
import type { ControlCommands, MatchEvent, MatchState } from '../core/types';
import { distance, vec } from '../core/vec2';
import { IDLE_COMMANDS, stepMatch, withoutOneShotActions } from './matchEngine';
import { createMatchState } from './matchSetup';
import { attemptTackle } from './possession';
import { controlledPlayer, nextControlledPlayer } from './userControl';

const DT = 1 / 60;

function newMatch(): MatchState {
  return createMatchState({ userTeam: 'home', formations: { home: '2-1-1', away: '1-2-1' } });
}

function startPlaying(state: MatchState): void {
  state.phase = 'playing';
  state.phaseTimer = 0;
}

function run(state: MatchState, seconds: number, cmd: ControlCommands = IDLE_COMMANDS, seed = 7): MatchEvent[] {
  const rng = createRng(seed);
  const events: MatchEvent[] = [];
  for (let t = 0; t < seconds; t += DT) events.push(...stepMatch(state, cmd, DT, rng));
  return events;
}

/** Afasta todos para um canto, deixando a jogada controlada pelo teste. */
function clearArea(state: MatchState): void {
  state.players.forEach((p, i) => {
    p.pos = vec(PITCH.centerX - 40 + (i % 5) * 20, PITCH.top + 2 + Math.floor(i / 5) * 12);
  });
}

describe('saída de bola', () => {
  it('começa com o time da casa com a bola, congelado até o apito', () => {
    const state = newMatch();
    expect(state.phase).toBe('kickoff');
    expect(state.ball.ownerId).toBe(state.controlledId);
    const events = run(state, TUNING.match.kickoffDelay + 0.05);
    expect(events).toContainEqual({ type: 'phase', phase: 'playing' });
  });
});

describe('gol', () => {
  it('atualiza o placar, exibe a fase de gol e reinicia a jogada no centro', () => {
    const state = newMatch();
    startPlaying(state);
    clearArea(state);
    state.ball = { pos: vec(PITCH.right - 20, PITCH.centerY), vel: vec(300, 0), z: 0, vz: 0, ownerId: null, lastTouch: 'home' };

    const events = run(state, 0.3);
    expect(events).toContainEqual({ type: 'goal', scorer: 'home' });
    expect(state.score).toEqual({ home: 1, away: 0 });
    expect(state.phase).toBe('goal');

    run(state, TUNING.match.goalCelebration);
    expect(state.phase).toBe('kickoff');
    expect(state.kickoffTeam).toBe('away');
    const owner = state.players.find((p) => p.id === state.ball.ownerId);
    expect(owner?.team).toBe('away');
    expect(distance(state.ball.pos, vec(PITCH.centerX, PITCH.centerY))).toBeLessThan(10);
  });

  it('bola fora das traves rebate e não vale gol', () => {
    const state = newMatch();
    startPlaying(state);
    clearArea(state);
    state.ball = { pos: vec(PITCH.right - 20, PITCH.centerY + 80), vel: vec(300, 0), z: 0, vz: 0, ownerId: null, lastTouch: 'home' };
    run(state, 0.3);
    expect(state.score).toEqual({ home: 0, away: 0 });
    expect(state.ball.pos.x).toBeLessThanOrEqual(PITCH.right);
  });
});

describe('posse e passe', () => {
  it('atleta próximo domina a bola solta e o controle passa para ele', () => {
    const state = newMatch();
    startPlaying(state);
    clearArea(state);
    const mate = state.players.find((p) => p.team === 'home' && p.role === 'fwd')!;
    mate.pos = vec(300, 200);
    state.controlledId = state.players.find((p) => p.team === 'home' && p.role === 'mid')!.id;
    state.ball = { pos: vec(304, 200), vel: vec(0, 0), z: 0, vz: 0, ownerId: null, lastTouch: 'away' };
    const events = stepMatch(state, IDLE_COMMANDS, DT, createRng(1));
    expect(state.ball.ownerId).toBe(mate.id);
    expect(state.controlledId).toBe(mate.id);
    expect(events).toContainEqual({ type: 'possession', team: 'home' });
  });

  it('passe curto (Espaço) leva a bola ao companheiro na direção da mira', () => {
    const state = newMatch();
    startPlaying(state);
    clearArea(state);
    const passer = controlledPlayer(state)!;
    const receiver = state.players.find((p) => p.team === 'home' && p.role === 'mid')!;
    passer.pos = vec(250, 200);
    receiver.pos = vec(360, 200);
    state.ball = { pos: vec(257, 200), vel: vec(0, 0), z: 0, vz: 0, ownerId: passer.id, lastTouch: 'home' };

    const cmd: ControlCommands = { ...IDLE_COMMANDS, move: vec(1, 0), shortPass: true };
    const events = stepMatch(state, cmd, DT, createRng(1));
    expect(events).toContainEqual({ type: 'kick', kind: 'short', team: 'home' });
    expect(state.ball.ownerId).toBeNull();
    expect(state.controlledId).toBe(receiver.id);

    run(state, 1.5);
    expect(state.ball.ownerId).toBe(receiver.id);
  });

  it('finalização (J) de perto termina em gol quando o goleiro está fora', () => {
    const state = newMatch();
    startPlaying(state);
    clearArea(state);
    const shooter = controlledPlayer(state)!;
    shooter.pos = vec(PITCH.right - 60, PITCH.centerY);
    state.ball = { pos: vec(PITCH.right - 53, PITCH.centerY), vel: vec(0, 0), z: 0, vz: 0, ownerId: shooter.id, lastTouch: 'home' };
    stepMatch(state, { ...IDLE_COMMANDS, shoot: true }, DT, createRng(2));
    const events = run(state, 0.5);
    expect(events).toContainEqual({ type: 'goal', scorer: 'home' });
  });

  it('ações únicas são descartadas nos passos extras do mesmo quadro', () => {
    const cmd: ControlCommands = { ...IDLE_COMMANDS, move: vec(1, 0), sprint: true, shoot: true, switchPlayer: true };
    const stripped = withoutOneShotActions(cmd);
    expect(stripped.shoot).toBe(false);
    expect(stripped.switchPlayer).toBe(false);
    expect(stripped.move).toEqual(vec(1, 0));
    expect(stripped.sprint).toBe(true);
  });
});

describe('troca de jogador (Q)', () => {
  it('seleciona o jogador de linha mais próximo da bola, nunca o goleiro', () => {
    const state = newMatch();
    startPlaying(state);
    clearArea(state);
    const home = state.players.filter((p) => p.team === 'home');
    const [gk, a, b] = home;
    state.ball = { pos: vec(100, 180), vel: vec(0, 0), z: 0, vz: 0, ownerId: null, lastTouch: null };
    gk.pos = vec(101, 180);
    a.pos = vec(110, 180);
    b.pos = vec(130, 180);
    state.controlledId = home[4].id;
    expect(nextControlledPlayer(state)?.id).toBe(a.id);
    state.controlledId = a.id;
    expect(nextControlledPlayer(state)?.id).toBe(b.id);
  });
});

describe('desarme (E)', () => {
  it('rouba a bola de um adversário ao alcance, ou deixa o defensor atordoado se falhar', () => {
    const outcomes = new Set<string>();
    for (let seed = 1; seed < 40; seed++) {
      const state = newMatch();
      startPlaying(state);
      clearArea(state);
      const victim = state.players.find((p) => p.team === 'away' && p.role === 'fwd')!;
      const tackler = controlledPlayer(state)!;
      victim.pos = vec(300, 200);
      tackler.pos = vec(290, 200);
      state.ball = { pos: vec(296, 200), vel: vec(0, 0), z: 0, vz: 0, ownerId: victim.id, lastTouch: 'away' };
      const result = attemptTackle(state, tackler, createRng(seed), []);
      outcomes.add(result);
      if (result === 'success') expect(state.ball.ownerId).toBeNull();
      if (result === 'fail') expect(tackler.stun).toBeGreaterThan(0);
      expect(tackler.tackleCooldown).toBeGreaterThan(0);
    }
    expect(outcomes).toEqual(new Set(['success', 'fail']));
  });

  it('não desarma enquanto o portador está protegido logo após dominar', () => {
    const state = newMatch();
    startPlaying(state);
    const victim = state.players.find((p) => p.team === 'away' && p.role === 'fwd')!;
    const tackler = controlledPlayer(state)!;
    victim.pos = vec(300, 200);
    victim.protection = 1;
    tackler.pos = vec(292, 200);
    state.ball.ownerId = victim.id;
    expect(attemptTackle(state, tackler, () => 0, [])).toBe('fail');
  });
});

describe('cronômetro', () => {
  it('encerra a partida quando o tempo acaba', () => {
    const state = createMatchState({ userTeam: 'home', formations: { home: '2-1-1', away: '1-2-1' }, durationSeconds: 1 });
    startPlaying(state);
    const events = run(state, 1.1);
    expect(state.clock).toBe(0);
    expect(state.phase).toBe('fullTime');
    expect(events).toContainEqual({ type: 'phase', phase: 'fullTime' });
  });
});

describe('partida simulada só com IA', () => {
  it('roda até o fim sem valores inválidos e com disputa de posse entre os times', () => {
    const state = newMatch();
    const rng = createRng(42);
    const events: MatchEvent[] = [];
    // O relógio para durante comemorações e saídas de bola, então o tempo real é maior.
    for (let i = 0; i < 60 * 600 && state.phase !== 'fullTime'; i++) events.push(...stepMatch(state, IDLE_COMMANDS, DT, rng));
    expect(state.phase).toBe('fullTime');
    for (const p of state.players) {
      expect(Number.isFinite(p.pos.x) && Number.isFinite(p.pos.y)).toBe(true);
    }
    expect(Number.isFinite(state.ball.pos.x)).toBe(true);
    const possessions = events.filter((e) => e.type === 'possession');
    expect(possessions.some((e) => e.type === 'possession' && e.team === 'away')).toBe(true);
    expect(events.some((e) => e.type === 'kick' && e.team === 'away' && e.kind === 'shot')).toBe(true);
  });
});
