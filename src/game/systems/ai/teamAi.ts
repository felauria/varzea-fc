import { ownGoalCenter } from '../../core/pitch';
import type { Rng } from '../../core/rng';
import { TUNING } from '../../core/tuning';
import type { MatchEvent, MatchState, PlayerState, TeamSide } from '../../core/types';
import { add, distance, normalize, scale, sub } from '../../core/vec2';
import { steerTowards } from '../movement';
import { attemptTackle, ballOwner } from '../possession';
import { carrierAi } from './carrier';
import { goalkeeperAi } from './goalkeeper';
import { supportPosition } from './positioning';

/**
 * IA de um time inteiro, baseada em papéis simples:
 * - portador da bola: conduz, passa ou finaliza;
 * - perseguidor: o mais próximo da bola pressiona/disputa;
 * - cobertura: o segundo mais próximo fecha o caminho para o gol;
 * - demais: ocupam a posição de apoio da formação.
 * O atleta controlado pelo usuário é ignorado.
 */
export function updateTeamAi(state: MatchState, team: TeamSide, rng: Rng, dt: number, events: MatchEvent[]): void {
  const owner = ballOwner(state);
  const teamHasBall = owner?.team === team;
  const controlledId = team === state.userTeam ? state.controlledId : null;

  const keeper = state.players.find((p) => p.team === team && p.role === 'gk');
  if (keeper && keeper.id !== controlledId) goalkeeperAi(state, keeper, rng, dt, events);

  const field = state.players.filter((p) => p.team === team && p.role !== 'gk');
  let chaser: PlayerState | null = null;
  let cover: PlayerState | null = null;
  if (!teamHasBall) {
    const byDistance = [...field].sort((a, b) => distance(a.pos, state.ball.pos) - distance(b.pos, state.ball.pos));
    chaser = byDistance[0] ?? null;
    cover = byDistance[1] ?? null;
    // Se o usuário é o mais próximo, ele é o perseguidor; a IA só faz a cobertura.
    if (chaser?.id === controlledId) chaser = null;
    if (cover?.id === controlledId) cover = byDistance[2] ?? null;
  }

  for (const p of field) {
    if (p.id === controlledId) continue;
    if (state.ball.ownerId === p.id) {
      carrierAi(state, p, rng, dt, events);
    } else if (state.pendingPass?.receiverId === p.id) {
      p.intent = { move: steerTowards(p.pos, receivePoint(state), 3), sprint: true };
    } else if (p === chaser) {
      chaseBall(state, p, rng, dt, events);
    } else if (p === cover) {
      const goal = ownGoalCenter(team);
      const coverPoint = add(state.ball.pos, scale(normalize(sub(goal, state.ball.pos)), 40));
      p.intent = { move: steerTowards(p.pos, coverPoint), sprint: distance(p.pos, coverPoint) > 50 };
    } else {
      const target = supportPosition(state, p);
      p.intent = { move: steerTowards(p.pos, target, 10), sprint: distance(p.pos, target) > 60 };
    }
  }
}

/** Ponto onde o receptor deve buscar o passe: o alvo planejado, ou a bola se ela já passou. */
export function receivePoint(state: MatchState) {
  const pass = state.pendingPass;
  if (!pass) return state.ball.pos;
  return distance(state.ball.pos, pass.target) < 24 ? state.ball.pos : pass.target;
}

function chaseBall(state: MatchState, p: PlayerState, rng: Rng, dt: number, events: MatchEvent[]): void {
  const dist = distance(p.pos, state.ball.pos);
  p.intent = { move: steerTowards(p.pos, state.ball.pos, 2), sprint: dist > 30 };

  const owner = ballOwner(state);
  if (!owner || owner.team === p.team || dist > TUNING.tackle.range) return;
  p.aiTimer -= dt;
  if (p.aiTimer > 0) return;
  p.aiTimer = TUNING.ai.decisionInterval + rng() * TUNING.ai.decisionJitter;
  if (rng() < TUNING.ai.tackleChance) attemptTackle(state, p, rng, events);
}
