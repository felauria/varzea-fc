import {
  attackDirection,
  GOAL,
  GOAL_AREA,
  isInPenaltyArea,
  ownGoalCenter,
  ownGoalLineX,
  PENALTY_AREA,
  PITCH,
} from '../../core/pitch';
import type { Rng } from '../../core/rng';
import { TUNING } from '../../core/tuning';
import type { MatchEvent, MatchState, PlayerState } from '../../core/types';
import { add, clamp, distance, length, normalize, scale, sub, vec, type Vec2 } from '../../core/vec2';
import { applyKick, performPass, planPass } from '../kicks';
import { steerTowards } from '../movement';

/** Onde o goleiro deve se posicionar: na linha entre a bola e o centro do gol. */
export function goalkeeperGuardPosition(team: PlayerState['team'], ball: Vec2): Vec2 {
  const goal = ownGoalCenter(team);
  const toBall = sub(ball, goal);
  const advance = clamp(length(toBall) * 0.12, 6, 24);
  const dir = length(toBall) > 0 ? normalize(toBall) : vec(attackDirection(team), 0);
  const p = add(goal, scale(dir, advance));
  const minX = attackDirection(team) > 0 ? goal.x + 4 : goal.x - GOAL_AREA.depth;
  const maxX = attackDirection(team) > 0 ? goal.x + GOAL_AREA.depth : goal.x - 4;
  return vec(clamp(p.x, minX, maxX), clamp(p.y, PITCH.centerY - GOAL.halfWidth - 4, PITCH.centerY + GOAL.halfWidth + 4));
}

/**
 * Se a bola vem em direção ao gol, prevê o Y em que ela cruzará a linha do goleiro.
 * Retorna null se a bola não está vindo para o gol.
 */
export function predictInterceptY(team: PlayerState['team'], keeperX: number, ballPos: Vec2, ballVel: Vec2): number | null {
  const towardGoal = ballVel.x * attackDirection(team) < -40;
  if (!towardGoal) return null;
  const t = (keeperX - ballPos.x) / ballVel.x;
  if (t <= 0 || t > 1.2) return null;
  const y = ballPos.y + ballVel.y * t;
  if (Math.abs(y - PITCH.centerY) > GOAL.halfWidth + 20) return null;
  return y;
}

function clampToArea(team: PlayerState['team'], p: Vec2): Vec2 {
  const line = ownGoalLineX(team);
  const dir = attackDirection(team);
  const x = dir > 0 ? clamp(p.x, line + 2, line + PENALTY_AREA.depth) : clamp(p.x, line - PENALTY_AREA.depth, line - 2);
  return vec(x, clamp(p.y, PITCH.centerY - PENALTY_AREA.halfWidth, PITCH.centerY + PENALTY_AREA.halfWidth));
}

export function goalkeeperAi(state: MatchState, keeper: PlayerState, rng: Rng, dt: number, events: MatchEvent[]): void {
  const ball = state.ball;

  if (ball.ownerId === keeper.id) {
    keeper.intent = { move: vec(0, 0), sprint: false };
    keeper.holdTimer += dt;
    if (keeper.holdTimer < TUNING.possession.goalkeeperHoldTime) return;
    const forward = vec(attackDirection(keeper.team), 0);
    const receiver = performPass(state, keeper, forward, 'short', events);
    if (!receiver) {
      // Sem companheiro livre: chutão para frente.
      const target = add(keeper.pos, scale(forward, 200 + rng() * 80));
      applyKick(state, keeper, planPass('long', keeper.pos, target), 'clearance', null, events);
    }
    return;
  }

  // Bola solta e lenta dentro da área: sai para buscar se chegar antes do atacante.
  const looseInArea = !ball.ownerId && isInPenaltyArea(keeper.team, ball.pos) && length(ball.vel) < 140;
  if (looseInArea) {
    const keeperDist = distance(keeper.pos, ball.pos);
    const closerThanOpponents = state.players.every(
      (p) => p.team === keeper.team || distance(p.pos, ball.pos) > keeperDist - 4,
    );
    if (closerThanOpponents) {
      keeper.intent = { move: steerTowards(keeper.pos, ball.pos, 2), sprint: true };
      return;
    }
  }

  const interceptY = ball.ownerId ? null : predictInterceptY(keeper.team, keeper.pos.x, ball.pos, ball.vel);
  if (interceptY !== null) {
    const target = clampToArea(keeper.team, vec(keeper.pos.x, interceptY));
    keeper.intent = { move: steerTowards(keeper.pos, target, 2), sprint: true };
    return;
  }

  const guard = clampToArea(keeper.team, goalkeeperGuardPosition(keeper.team, ball.pos));
  keeper.intent = { move: steerTowards(keeper.pos, guard, 4), sprint: false };
}
