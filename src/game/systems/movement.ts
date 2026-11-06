import { PITCH } from '../core/pitch';
import { TUNING } from '../core/tuning';
import type { MatchState, PlayerState } from '../core/types';
import { add, approach, clamp, length, normalize, scale, sub, vec, type Vec2 } from '../core/vec2';

/**
 * Converte as teclas direcionais em uma direção normalizada.
 * Garante que a diagonal não seja mais rápida que os eixos.
 */
export function directionFromAxes(up: boolean, down: boolean, left: boolean, right: boolean): Vec2 {
  const x = (right ? 1 : 0) - (left ? 1 : 0);
  const y = (down ? 1 : 0) - (up ? 1 : 0);
  return normalize(vec(x, y));
}

export function maxSpeedFor(player: PlayerState, hasBall: boolean): number {
  const t = TUNING.player;
  let speed: number = player.role === 'gk' ? t.goalkeeperSpeed : player.intent.sprint ? t.sprintSpeed : t.walkSpeed;
  if (player.role === 'gk' && player.intent.sprint) speed = t.goalkeeperDiveSpeed;
  if (hasBall) speed *= t.dribbleSpeedFactor;
  if (player.stun > 0) speed *= TUNING.tackle.stunSpeedFactor;
  return speed;
}

/** Atualiza temporizadores, velocidade (com aceleração limitada) e posição de um atleta. */
export function updatePlayerMotion(player: PlayerState, hasBall: boolean, dt: number): void {
  player.kickLockout = Math.max(0, player.kickLockout - dt);
  player.tackleCooldown = Math.max(0, player.tackleCooldown - dt);
  player.stun = Math.max(0, player.stun - dt);
  player.protection = Math.max(0, player.protection - dt);

  const moveLen = length(player.intent.move);
  let targetVel: Vec2;
  if (player.lunge > 0) {
    player.lunge = Math.max(0, player.lunge - dt);
    targetVel = scale(player.facing, TUNING.tackle.lungeSpeed);
  } else {
    targetVel = scale(normalize(player.intent.move), maxSpeedFor(player, hasBall) * Math.min(1, moveLen));
  }

  player.vel = approach(player.vel, targetVel, TUNING.player.acceleration * dt);
  player.pos = clampPlayerPosition(add(player.pos, scale(player.vel, dt)));

  if (moveLen > 0.1 && player.lunge <= 0) player.facing = normalize(player.intent.move);
}

export function clampPlayerPosition(p: Vec2): Vec2 {
  const m = TUNING.player.sidelineMargin;
  return vec(clamp(p.x, PITCH.left + 1, PITCH.right - 1), clamp(p.y, PITCH.top - m, PITCH.bottom + m));
}

/** Separa atletas sobrepostos (colisão simples entre círculos). */
export function separatePlayers(state: MatchState): void {
  const minDist = TUNING.player.radius * 2;
  const players = state.players;
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i];
      const b = players[j];
      const delta = sub(b.pos, a.pos);
      const dist = length(delta);
      if (dist >= minDist) continue;
      const push = dist > 1e-6 ? scale(delta, (minDist - dist) / dist / 2) : vec(0.5, 0);
      a.pos = clampPlayerPosition(sub(a.pos, push));
      b.pos = clampPlayerPosition(add(b.pos, push));
    }
  }
}

/** Direção de movimento até um alvo, com chegada suave (0 quando já está no alvo). */
export function steerTowards(from: Vec2, to: Vec2, arriveRadius = 6): Vec2 {
  const delta = sub(to, from);
  const dist = length(delta);
  if (dist < 1) return vec(0, 0);
  const strength = dist < arriveRadius ? dist / arriveRadius : 1;
  return scale(normalize(delta), strength);
}
