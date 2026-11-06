import type { Rng } from '../core/rng';
import type { ControlCommands, MatchEvent, MatchState, PlayerState } from '../core/types';
import { distance, length, type Vec2 } from '../core/vec2';
import { performPass, performShot } from './kicks';
import { steerTowards } from './movement';
import { attemptTackle, ballOwner } from './possession';
import { receivePoint } from './ai/teamAi';

export const controlledPlayer = (state: MatchState): PlayerState | null =>
  state.players.find((p) => p.id === state.controlledId) ?? null;

/**
 * Próximo atleta a ser controlado com `Q`: o jogador de linha mais próximo da bola;
 * se o atual já for o mais próximo, o segundo mais próximo.
 */
export function nextControlledPlayer(state: MatchState): PlayerState | null {
  const candidates = state.players
    .filter((p) => p.team === state.userTeam && p.role !== 'gk')
    .sort((a, b) => distance(a.pos, state.ball.pos) - distance(b.pos, state.ball.pos));
  if (candidates.length === 0) return null;
  if (candidates[0].id === state.controlledId) return candidates[1] ?? candidates[0];
  return candidates[0];
}

function setControlled(state: MatchState, player: PlayerState | null, events: MatchEvent[]): void {
  if (!player || player.role === 'gk' || player.id === state.controlledId) return;
  state.controlledId = player.id;
  events.push({ type: 'controlChanged', playerId: player.id });
}

/** Mira das ações: a direção pressionada ou, sem direção, para onde o atleta está virado. */
export const aimFor = (player: PlayerState, move: Vec2): Vec2 => (length(move) > 0 ? move : player.facing);

/** Aplica os comandos do teclado ao atleta controlado. */
export function applyUserCommands(state: MatchState, cmd: ControlCommands, rng: Rng, events: MatchEvent[]): void {
  let player = controlledPlayer(state);
  const hasBall = player !== null && state.ball.ownerId === player.id;

  if (cmd.switchPlayer && !hasBall) {
    setControlled(state, nextControlledPlayer(state), events);
    player = controlledPlayer(state);
  }
  if (!player) return;

  player.intent = { move: cmd.move, sprint: cmd.sprint };
  const aim = aimFor(player, cmd.move);

  if (hasBall) {
    if (cmd.shoot) {
      performShot(state, player, aim, rng, events);
    } else if (cmd.shortPass || cmd.throughPass || cmd.longPass) {
      const kind = cmd.shortPass ? 'short' : cmd.throughPass ? 'through' : 'long';
      const receiver = performPass(state, player, aim, kind, events);
      // O controle acompanha a bola: o receptor passa a ser o atleta controlado.
      setControlled(state, receiver, events);
    }
    return;
  }

  if (cmd.tackle) attemptTackle(state, player, rng, events);

  if (length(cmd.move) === 0) {
    if (cmd.pressure) {
      const target = ballOwner(state)?.pos ?? state.ball.pos;
      player.intent = { move: steerTowards(player.pos, target, 2), sprint: cmd.sprint };
    } else if (state.pendingPass?.receiverId === player.id) {
      // Assistência de recepção: sem direção pressionada, o receptor vai ao encontro do passe.
      player.intent = { move: steerTowards(player.pos, receivePoint(state), 3), sprint: false };
    }
  }
}
