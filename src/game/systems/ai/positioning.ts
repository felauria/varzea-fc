import { depthOf, lateralOf, tacticalToWorld } from '../../core/pitch';
import type { MatchState, PlayerState } from '../../core/types';
import { clamp, type Vec2 } from '../../core/vec2';

/**
 * Posição de apoio de um atleta sem a bola: parte do posto na formação e
 * se desloca conforme a posição da bola e quem tem a posse.
 */
export function supportPosition(state: MatchState, player: PlayerState): Vec2 {
  const ball = state.ball;
  const ballDepth = depthOf(player.team, ball.pos.x);
  const ballLateral = lateralOf(ball.pos.y);
  const ownerTeam = ball.ownerId ? state.players.find((p) => p.id === ball.ownerId)?.team : undefined;
  const inPossession = ownerTeam === player.team;
  const defending = ownerTeam !== undefined && !inPossession;

  let depth = player.slot.depth + (ballDepth - 0.5) * 0.4;
  if (inPossession) depth += 0.16;
  if (defending) depth -= 0.08;

  if (player.role === 'fwd' && inPossession) depth = Math.max(depth, ballDepth + 0.1);
  if (player.role === 'def' && !inPossession) depth = Math.min(depth, ballDepth - 0.05);

  const lateral = player.slot.lateral * 0.9 + ballLateral * 0.3;
  return tacticalToWorld(player.team, clamp(depth, 0.06, 0.92), clamp(lateral, -0.92, 0.92));
}
