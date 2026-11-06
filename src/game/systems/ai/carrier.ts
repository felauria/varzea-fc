import { attackDirection, opponentGoalCenter } from '../../core/pitch';
import type { Rng } from '../../core/rng';
import { TUNING } from '../../core/tuning';
import type { MatchEvent, MatchState, PlayerState } from '../../core/types';
import { add, distance, dot, normalize, scale, sub, vec } from '../../core/vec2';
import { choosePassOption, performShot, planPass, applyKick } from '../kicks';

export function nearestOpponent(state: MatchState, player: PlayerState): { opponent: PlayerState | null; dist: number } {
  let opponent: PlayerState | null = null;
  let dist = Infinity;
  for (const p of state.players) {
    if (p.team === player.team) continue;
    const d = distance(p.pos, player.pos);
    if (d < dist) {
      dist = d;
      opponent = p;
    }
  }
  return { opponent, dist };
}

/** Probabilidade de finalizar por decisão, conforme a distância ao gol. */
export function shootChance(distToGoal: number): number {
  if (distToGoal < 90) return 0.7;
  if (distToGoal < 130) return 0.35;
  if (distToGoal < 165) return 0.15;
  return 0;
}

/**
 * IA do atleta com a bola: conduz em direção ao gol desviando do marcador,
 * passa quando pressionado e finaliza quando próximo.
 */
export function carrierAi(state: MatchState, player: PlayerState, rng: Rng, dt: number, events: MatchEvent[]): void {
  const goal = opponentGoalCenter(player.team);
  const toGoal = sub(goal, player.pos);
  const distToGoal = distance(goal, player.pos);
  const { opponent, dist: oppDist } = nearestOpponent(state, player);

  let dir = normalize(toGoal);
  if (opponent && oppDist < 40) {
    const away = normalize(sub(player.pos, opponent.pos));
    dir = normalize(add(dir, scale(away, 0.9)));
  }
  player.intent = { move: dir, sprint: oppDist > 30 };

  player.aiTimer -= dt;
  if (player.aiTimer > 0) return;
  player.aiTimer = TUNING.ai.decisionInterval + rng() * TUNING.ai.decisionJitter;

  if (rng() < shootChance(distToGoal)) {
    performShot(state, player, vec(0, 0), rng, events);
    return;
  }

  const pressured = oppDist < TUNING.ai.pressureDistance;
  if (!pressured && rng() > 0.12) return;

  const forward = vec(attackDirection(player.team), 0);
  const aim = pressured ? normalize(add(forward, scale(dir, 0.5))) : forward;
  const through = choosePassOption(state, player, aim, 'through');
  const short = choosePassOption(state, player, aim, 'short');
  const option = through && (!short || through.score > short.score + 0.3) ? { ...through, kind: 'through' as const } : short ? { ...short, kind: 'short' as const } : null;

  if (option && option.score > (pressured ? 0.8 : 1.6)) {
    applyKick(state, player, planPass(option.kind, player.pos, option.target), option.kind, option.receiver.id, events);
  } else if (pressured && dot(dir, forward) < 0) {
    // Encurralado e sem opção: alivia para frente.
    const target = add(player.pos, scale(forward, TUNING.pass.fallbackLong));
    applyKick(state, player, planPass('long', player.pos, target), 'clearance', null, events);
  }
}
