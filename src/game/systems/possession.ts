import { isInPenaltyArea } from '../core/pitch';
import type { Rng } from '../core/rng';
import { TUNING } from '../core/tuning';
import type { MatchEvent, MatchState, PlayerState } from '../core/types';
import { add, distance, length, normalize, scale, sub, vec } from '../core/vec2';

export const ballOwner = (state: MatchState): PlayerState | null =>
  state.ball.ownerId ? (state.players.find((p) => p.id === state.ball.ownerId) ?? null) : null;

export function pickupRadius(player: PlayerState, state: MatchState): number {
  const pos = TUNING.possession;
  if (player.role === 'gk' && isInPenaltyArea(player.team, player.pos)) return pos.goalkeeperPickupRadius;
  const fast = length(state.ball.vel) > pos.fastBallSpeed;
  return fast ? pos.pickupRadius * pos.fastBallPickupFactor : pos.pickupRadius;
}

/** Quem pode dominar a bola solta neste passo (o mais próximo dentro do raio). */
export function findPickupCandidate(state: MatchState): PlayerState | null {
  const ball = state.ball;
  if (ball.ownerId || ball.z > TUNING.ball.controlHeight) return null;
  let best: PlayerState | null = null;
  let bestDist = Infinity;
  for (const p of state.players) {
    if (p.kickLockout > 0 || p.stun > 0) continue;
    const d = distance(p.pos, ball.pos);
    if (d <= pickupRadius(p, state) && d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}

export function givePossession(state: MatchState, player: PlayerState, events: MatchEvent[]): void {
  const previousTeam = state.ball.lastTouch;
  state.ball.ownerId = player.id;
  state.ball.lastTouch = player.team;
  state.ball.vz = 0;
  state.ball.z = 0;
  state.pendingPass = null;
  player.aiTimer = TUNING.ai.receiveDelay;
  player.holdTimer = 0;
  player.protection =
    player.role === 'gk' ? TUNING.possession.goalkeeperHoldProtection : TUNING.possession.stealProtection;

  if (player.team === state.userTeam && player.role !== 'gk' && state.controlledId !== player.id) {
    state.controlledId = player.id;
    events.push({ type: 'controlChanged', playerId: player.id });
  }
  if (previousTeam !== player.team) events.push({ type: 'possession', team: player.team });
}

/**
 * Resolve o domínio da bola solta. Goleiros podem espalmar chutes fortes em vez de segurar.
 */
export function resolvePickup(state: MatchState, rng: Rng, events: MatchEvent[]): void {
  const candidate = findPickupCandidate(state);
  if (!candidate) return;

  const fast = length(state.ball.vel) > TUNING.possession.fastBallSpeed;
  const isOpponentShot = state.ball.lastTouch !== candidate.team;
  if (candidate.role === 'gk' && fast && isOpponentShot && rng() > TUNING.possession.goalkeeperCatchChance) {
    // Espalmada: devolve a bola para frente, com desvio lateral.
    const v = state.ball.vel;
    state.ball.vel = vec(-v.x * 0.45, v.y * 0.3 + (rng() * 2 - 1) * 90);
    state.ball.lastTouch = candidate.team;
    candidate.kickLockout = 0.35;
    return;
  }
  givePossession(state, candidate, events);
}

export type TackleResult = 'success' | 'fail' | 'miss' | 'unavailable';

/**
 * Tentativa de desarme: dá um bote curto na direção da bola. Se o portador
 * adversário estiver ao alcance e sem proteção, rouba com certa probabilidade.
 */
export function attemptTackle(state: MatchState, tackler: PlayerState, rng: Rng, events: MatchEvent[]): TackleResult {
  if (tackler.tackleCooldown > 0 || tackler.stun > 0 || state.ball.ownerId === tackler.id) return 'unavailable';

  const t = TUNING.tackle;
  tackler.tackleCooldown = t.cooldown;
  tackler.lunge = t.lungeTime;
  const toBall = sub(state.ball.pos, tackler.pos);
  if (length(toBall) < 40) tackler.facing = normalize(toBall);

  const owner = ballOwner(state);
  if (!owner || owner.team === tackler.team || distance(owner.pos, tackler.pos) > t.range) return 'miss';

  const success = owner.protection <= 0 && rng() < t.successChance;
  events.push({ type: 'tackle', team: tackler.team, success });
  if (!success) {
    tackler.stun = t.failStun;
    return 'fail';
  }

  const ball = state.ball;
  ball.ownerId = null;
  ball.lastTouch = tackler.team;
  const away = normalize(sub(tackler.pos, owner.pos));
  ball.vel = add(scale(away, 40), scale(tackler.facing, 50));
  owner.kickLockout = t.victimLockout;
  tackler.kickLockout = 0;
  return 'success';
}
