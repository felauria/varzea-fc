import {
  attackDirection,
  clampToPitch,
  GOAL,
  opponentGoalCenter,
  ownGoalLineX,
  otherTeam,
} from '../core/pitch';
import type { Rng } from '../core/rng';
import { TUNING } from '../core/tuning';
import type { KickKind, MatchEvent, MatchState, PlayerState } from '../core/types';
import {
  add,
  clamp,
  distance,
  distanceToSegment,
  dot,
  length,
  normalize,
  rotate,
  scale,
  sub,
  vec,
  type Vec2,
} from '../core/vec2';

export type PassKind = 'short' | 'through' | 'long';

export interface PassOption {
  receiver: PlayerState;
  target: Vec2;
  score: number;
}

export interface KickPlan {
  vel: Vec2;
  vz: number;
  target: Vec2;
}

const rangeFor = (kind: PassKind): number =>
  kind === 'short' ? TUNING.pass.shortRange : kind === 'through' ? TUNING.pass.throughRange : TUNING.pass.longRange;

const minDistanceFor = (kind: PassKind): number =>
  kind === 'long' ? TUNING.pass.longMinDistance : TUNING.pass.minDistance;

/** Ponto para onde a bola deve ir para encontrar o companheiro, conforme o tipo de passe. */
export function passTargetFor(kind: PassKind, passer: PlayerState, mate: PlayerState, aim: Vec2): Vec2 {
  if (kind === 'through') {
    const forward = vec(attackDirection(passer.team), 0);
    const runDir = normalize(add(forward, scale(aim, 0.6)));
    return clampToPitch(add(mate.pos, scale(runDir, TUNING.pass.throughLead)), 10);
  }
  const lead = kind === 'long' ? TUNING.pass.leadTime * 1.6 : TUNING.pass.leadTime;
  return clampToPitch(add(mate.pos, scale(mate.vel, lead)), 6);
}

/** Quão livre está a linha de passe: menor distância de um adversário ao trajeto (limitada). */
export function laneOpenness(state: MatchState, from: Vec2, to: Vec2, team: PlayerState['team']): number {
  let min = 40;
  for (const p of state.players) {
    if (p.team === team) continue;
    min = Math.min(min, distanceToSegment(p.pos, from, to));
  }
  return min;
}

/**
 * Escolhe o melhor companheiro para o passe, considerando a direção desejada (`aim`),
 * distância, linha de passe livre e, para passes verticais, o avanço em direção ao gol.
 */
export function choosePassOption(
  state: MatchState,
  passer: PlayerState,
  aim: Vec2,
  kind: PassKind,
): PassOption | null {
  const aimDir = normalize(aim);
  const range = rangeFor(kind);
  const minDist = minDistanceFor(kind);
  const dir = attackDirection(passer.team);
  let best: PassOption | null = null;

  for (const mate of state.players) {
    if (mate.team !== passer.team || mate.id === passer.id) continue;
    const target = passTargetFor(kind, passer, mate, aimDir);
    const to = sub(target, passer.pos);
    const dist = length(to);
    if (dist < minDist || dist > range) continue;
    const cos = dot(normalize(to), aimDir);
    if (cos < TUNING.pass.coneCos) continue;

    const openness = kind === 'long' ? 40 : laneOpenness(state, passer.pos, target, passer.team);
    const forwardGain = ((target.x - passer.pos.x) * dir) / range;
    let score = cos * 2 + openness / 40 - (dist / range) * 0.6;
    if (kind !== 'short') score += forwardGain;
    if (kind === 'long') score += dist / range;
    if (mate.role === 'gk') score -= 1;

    if (!best || score > best.score) best = { receiver: mate, target, score };
  }
  return best;
}

/** Velocidade inicial de um passe rasteiro para chegar a `dist` com a velocidade de chegada desejada. */
export function groundPassSpeed(dist: number, arrivalSpeed: number): number {
  return clamp(dist * TUNING.ball.groundDamping + arrivalSpeed, TUNING.pass.minSpeed, TUNING.pass.maxSpeed);
}

/** Planeja um passe (rasteiro ou por cobertura) da posição `from` até `target`. */
export function planPass(kind: PassKind, from: Vec2, target: Vec2): KickPlan {
  const to = sub(target, from);
  const dist = length(to);
  const dir = normalize(to);
  if (kind === 'long') {
    const vz = clamp(80 + dist * 0.25, 110, 190);
    const flightTime = (2 * vz) / TUNING.ball.gravity;
    return { vel: scale(dir, dist / flightTime), vz, target };
  }
  const arrival = kind === 'short' ? TUNING.pass.shortArrivalSpeed : TUNING.pass.throughArrivalSpeed;
  return { vel: scale(dir, groundPassSpeed(dist, arrival)), vz: 0, target };
}

/**
 * Planeja a finalização: mira o gol adversário. A componente vertical de `aim`
 * escolhe o canto; a imprecisão cresce com a distância.
 */
export function planShot(shooter: PlayerState, aim: Vec2, goalkeeper: PlayerState | null, rng: Rng): KickPlan {
  const goal = opponentGoalCenter(shooter.team);
  const corner = GOAL.halfWidth * TUNING.shot.cornerFactor;
  let targetY: number;
  if (Math.abs(aim.y) > 0.3) {
    targetY = goal.y + Math.sign(aim.y) * corner;
  } else if (goalkeeper) {
    // Sem direção vertical: mira o canto oposto ao goleiro.
    targetY = goal.y + (goalkeeper.pos.y > goal.y ? -corner : corner) * (0.5 + rng() * 0.5);
  } else {
    targetY = goal.y;
  }
  const target = vec(ownGoalLineX(otherTeam(shooter.team)) + attackDirection(shooter.team) * 6, targetY);
  const dist = distance(shooter.pos, target);
  let spread = clamp(dist / 500, TUNING.shot.minSpread, TUNING.shot.maxSpread);
  const toGoal = normalize(sub(target, shooter.pos));
  if (length(aim) > 0 && dot(normalize(aim), toGoal) < -0.2) spread *= 2;
  const dir = rotate(toGoal, (rng() * 2 - 1) * spread);
  return { vel: scale(dir, TUNING.shot.speed), vz: rng() * TUNING.shot.maxLoft, target };
}

/** Aplica um chute na bola: libera a posse e bloqueia o domínio imediato de quem chutou. */
export function applyKick(
  state: MatchState,
  kicker: PlayerState,
  plan: KickPlan,
  kind: KickKind,
  receiverId: string | null,
  events: MatchEvent[],
): void {
  const ball = state.ball;
  ball.ownerId = null;
  ball.vel = plan.vel;
  ball.vz = plan.vz;
  ball.z = plan.vz > 0 ? 0.01 : 0;
  ball.lastTouch = kicker.team;
  kicker.kickLockout = TUNING.possession.kickLockout;
  if (length(plan.vel) > 0) kicker.facing = normalize(plan.vel);
  state.pendingPass = receiverId
    ? { receiverId, target: plan.target, ttl: TUNING.pass.receiverWindow }
    : null;
  events.push({ type: 'kick', kind, team: kicker.team });
}

/** Executa um passe do tipo pedido na direção `aim`; sem companheiro adequado, chuta em direção à mira. */
export function performPass(
  state: MatchState,
  passer: PlayerState,
  aim: Vec2,
  kind: PassKind,
  events: MatchEvent[],
): PlayerState | null {
  const aimDir = length(aim) > 0 ? normalize(aim) : passer.facing;
  const option = choosePassOption(state, passer, aimDir, kind);
  if (option) {
    applyKick(state, passer, planPass(kind, passer.pos, option.target), kind, option.receiver.id, events);
    return option.receiver;
  }
  const fallback =
    kind === 'short' ? TUNING.pass.fallbackShort : kind === 'through' ? TUNING.pass.fallbackThrough : TUNING.pass.fallbackLong;
  const target = clampToPitch(add(passer.pos, scale(aimDir, fallback)), 6);
  applyKick(state, passer, planPass(kind, passer.pos, target), kind, null, events);
  return null;
}

export function performShot(state: MatchState, shooter: PlayerState, aim: Vec2, rng: Rng, events: MatchEvent[]): void {
  const keeper = state.players.find((p) => p.team !== shooter.team && p.role === 'gk') ?? null;
  applyKick(state, shooter, planShot(shooter, aim, keeper, rng), 'shot', null, events);
}
