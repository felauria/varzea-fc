import { otherTeam } from '../core/pitch';
import type { Rng } from '../core/rng';
import { TUNING } from '../core/tuning';
import type { ControlCommands, MatchEvent, MatchState, TeamSide } from '../core/types';
import { ZERO } from '../core/vec2';
import { updateTeamAi } from './ai/teamAi';
import { stepFreeBall, stepOwnedBall } from './ballPhysics';
import { resetForKickoff } from './matchSetup';
import { separatePlayers, updatePlayerMotion } from './movement';
import { ballOwner, resolvePickup } from './possession';
import { applyUserCommands } from './userControl';

export const IDLE_COMMANDS: ControlCommands = Object.freeze({
  move: ZERO,
  sprint: false,
  shortPass: false,
  throughPass: false,
  longPass: false,
  shoot: false,
  switchPlayer: false,
  tackle: false,
  pressure: false,
});

/** Remove as ações de disparo único, mantendo as contínuas (movimento, corrida, pressão). */
export const withoutOneShotActions = (cmd: ControlCommands): ControlCommands => ({
  ...IDLE_COMMANDS,
  move: cmd.move,
  sprint: cmd.sprint,
  pressure: cmd.pressure,
});

function setPhase(state: MatchState, phase: MatchState['phase'], timer: number, events: MatchEvent[]): void {
  state.phase = phase;
  state.phaseTimer = timer;
  events.push({ type: 'phase', phase });
}

function freezeIntents(state: MatchState): void {
  for (const p of state.players) p.intent = { move: ZERO, sprint: false };
}

function moveEverything(state: MatchState, dt: number): void {
  for (const p of state.players) updatePlayerMotion(p, state.ball.ownerId === p.id, dt);
  separatePlayers(state);
}

export function registerGoal(state: MatchState, scorer: TeamSide, events: MatchEvent[]): void {
  state.score[scorer] += 1;
  state.lastScorer = scorer;
  state.ball.ownerId = null;
  state.pendingPass = null;
  state.kickoffTeam = otherTeam(scorer);
  events.push({ type: 'goal', scorer });
  setPhase(state, 'goal', TUNING.match.goalCelebration, events);
}

/**
 * Avança a simulação em `dt` segundos. Função pura em relação ao Phaser:
 * recebe o estado, os comandos do usuário e um gerador aleatório; retorna eventos.
 */
export function stepMatch(state: MatchState, cmd: ControlCommands, dt: number, rng: Rng): MatchEvent[] {
  const events: MatchEvent[] = [];

  switch (state.phase) {
    case 'kickoff': {
      freezeIntents(state);
      moveEverything(state, dt);
      const owner = ballOwner(state);
      if (owner) stepOwnedBall(state.ball, owner, dt);
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) setPhase(state, 'playing', 0, events);
      return events;
    }
    case 'goal': {
      freezeIntents(state);
      moveEverything(state, dt);
      stepFreeBall(state.ball, dt, false);
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) {
        resetForKickoff(state, state.kickoffTeam);
        events.push({ type: 'phase', phase: 'kickoff' });
      }
      return events;
    }
    case 'fullTime': {
      freezeIntents(state);
      moveEverything(state, dt);
      if (!state.ball.ownerId) stepFreeBall(state.ball, dt, false);
      return events;
    }
    case 'playing':
      break;
  }

  state.clock = Math.max(0, state.clock - dt);
  if (state.clock === 0) {
    state.ball.ownerId = null;
    setPhase(state, 'fullTime', 0, events);
    return events;
  }

  if (state.pendingPass) {
    state.pendingPass.ttl -= dt;
    if (state.pendingPass.ttl <= 0) state.pendingPass = null;
  }

  updateTeamAi(state, 'home', rng, dt, events);
  updateTeamAi(state, 'away', rng, dt, events);
  applyUserCommands(state, cmd, rng, events);
  moveEverything(state, dt);

  const owner = ballOwner(state);
  const scorer = owner ? stepOwnedBall(state.ball, owner, dt) : stepFreeBall(state.ball, dt);
  if (scorer) {
    registerGoal(state, scorer, events);
    return events;
  }
  if (!state.ball.ownerId) resolvePickup(state, rng, events);
  return events;
}
