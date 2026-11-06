import { FORMATIONS, GOALKEEPER_SLOT, type FormationId } from '../../domain/formations';
import { attackDirection, PITCH, tacticalToWorld } from '../core/pitch';
import { TUNING } from '../core/tuning';
import type { MatchState, PlayerState, TeamSide } from '../core/types';
import { vec, ZERO } from '../core/vec2';

export interface MatchSetup {
  userTeam: TeamSide;
  formations: Record<TeamSide, FormationId>;
  durationSeconds?: number;
  kickoffTeam?: TeamSide;
}

export const playerId = (team: TeamSide, index: number): string => `${team}-${index}`;

function createTeam(team: TeamSide, formation: FormationId): PlayerState[] {
  const slots = [{ role: 'gk' as const, ...GOALKEEPER_SLOT }, ...FORMATIONS[formation]];
  return slots.map((slot, index) => ({
    id: playerId(team, index),
    team,
    role: slot.role,
    number: index + 1,
    slot: { depth: slot.depth, lateral: slot.lateral },
    pos: tacticalToWorld(team, slot.depth, slot.lateral),
    vel: ZERO,
    facing: vec(attackDirection(team), 0),
    intent: { move: ZERO, sprint: false },
    kickLockout: 0,
    tackleCooldown: 0,
    stun: 0,
    lunge: 0,
    protection: 0,
    aiTimer: 0,
    holdTimer: 0,
  }));
}

export function createMatchState(setup: MatchSetup): MatchState {
  const state: MatchState = {
    phase: 'kickoff',
    phaseTimer: 0,
    clock: setup.durationSeconds ?? TUNING.match.durationSeconds,
    score: { home: 0, away: 0 },
    players: [...createTeam('home', setup.formations.home), ...createTeam('away', setup.formations.away)],
    ball: { pos: vec(PITCH.centerX, PITCH.centerY), vel: ZERO, z: 0, vz: 0, ownerId: null, lastTouch: null },
    userTeam: setup.userTeam,
    controlledId: null,
    kickoffTeam: setup.kickoffTeam ?? 'home',
    pendingPass: null,
    lastScorer: null,
    formations: setup.formations,
  };
  resetForKickoff(state, state.kickoffTeam);
  return state;
}

/** Posição de saída de bola: cada time no próprio campo, adversários fora do círculo central. */
export function kickoffPosition(player: PlayerState, kickingTeam: TeamSide) {
  if (player.role === 'gk') return tacticalToWorld(player.team, GOALKEEPER_SLOT.depth, 0);
  const isKicking = player.team === kickingTeam;
  const maxDepth = isKicking ? 0.44 : 0.38;
  return tacticalToWorld(player.team, Math.min(player.slot.depth * 0.85, maxDepth), player.slot.lateral);
}

/** Jogador que dá a saída: o mais avançado do time. */
function pickKicker(state: MatchState, team: TeamSide): PlayerState {
  const field = state.players.filter((p) => p.team === team && p.role !== 'gk');
  return field.reduce((best, p) => (p.slot.depth > best.slot.depth ? p : best));
}

export function resetForKickoff(state: MatchState, kickingTeam: TeamSide): void {
  for (const p of state.players) {
    p.pos = kickoffPosition(p, kickingTeam);
    p.vel = ZERO;
    p.facing = vec(attackDirection(p.team), 0);
    p.intent = { move: ZERO, sprint: false };
    p.kickLockout = 0;
    p.tackleCooldown = 0;
    p.stun = 0;
    p.lunge = 0;
    p.protection = 0;
    p.aiTimer = TUNING.ai.receiveDelay;
    p.holdTimer = 0;
  }

  const kicker = pickKicker(state, kickingTeam);
  const dir = attackDirection(kickingTeam);
  kicker.pos = vec(PITCH.centerX - dir * (TUNING.ball.dribbleOffset + 1), PITCH.centerY);
  kicker.protection = TUNING.possession.stealProtection;

  state.ball = {
    pos: vec(PITCH.centerX, PITCH.centerY),
    vel: ZERO,
    z: 0,
    vz: 0,
    ownerId: kicker.id,
    lastTouch: kickingTeam,
  };
  state.kickoffTeam = kickingTeam;
  state.pendingPass = null;
  state.phase = 'kickoff';
  state.phaseTimer = TUNING.match.kickoffDelay;

  state.controlledId =
    kickingTeam === state.userTeam ? kicker.id : pickKicker(state, state.userTeam).id;
}
