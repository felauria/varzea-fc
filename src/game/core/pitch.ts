import type { TeamSide } from './types';
import { clamp, vec, type Vec2 } from './vec2';

/**
 * Geometria do campo em "pixels de mundo". A resolução lógica é 640×360 (16:9),
 * que escala em números inteiros para 1280×720 (×2) e 1920×1080 (×3).
 */
export const WORLD_WIDTH = 640;
export const WORLD_HEIGHT = 360;

export const PITCH = {
  left: 40,
  right: 600,
  top: 28,
  bottom: 332,
  centerX: 320,
  centerY: 180,
  centerCircleRadius: 44,
} as const;

export const PITCH_LENGTH = PITCH.right - PITCH.left;
export const PITCH_HALF_HEIGHT = (PITCH.bottom - PITCH.top) / 2;

export const GOAL = {
  /** Metade da abertura do gol (eixo Y). */
  halfWidth: 34,
  /** Profundidade da rede além da linha de fundo. */
  depth: 14,
  /** Altura do travessão (eixo Z da bola). */
  crossbarHeight: 12,
} as const;

export const PENALTY_AREA = { depth: 84, halfWidth: 86 } as const;
export const GOAL_AREA = { depth: 28, halfWidth: 52 } as const;
export const PENALTY_SPOT_DISTANCE = 60;

export const otherTeam = (team: TeamSide): TeamSide => (team === 'home' ? 'away' : 'home');

/** O time da casa ataca para a direita (+1); o visitante, para a esquerda (-1). */
export const attackDirection = (team: TeamSide): 1 | -1 => (team === 'home' ? 1 : -1);

export const ownGoalLineX = (team: TeamSide): number =>
  team === 'home' ? PITCH.left : PITCH.right;

export const ownGoalCenter = (team: TeamSide): Vec2 => vec(ownGoalLineX(team), PITCH.centerY);
export const opponentGoalCenter = (team: TeamSide): Vec2 => ownGoalCenter(otherTeam(team));

/** A coordenada Y está dentro da boca do gol, considerando o raio da bola. */
export const isWithinGoalMouth = (y: number, margin = 0): boolean =>
  Math.abs(y - PITCH.centerY) <= GOAL.halfWidth - margin;

/** Verdadeiro se `p` está dentro da grande área defendida por `team`. */
export function isInPenaltyArea(team: TeamSide, p: Vec2): boolean {
  const lineX = ownGoalLineX(team);
  const depth = Math.abs(p.x - lineX);
  const inFront = attackDirection(team) * (p.x - lineX) >= -GOAL.depth;
  return inFront && depth <= PENALTY_AREA.depth && Math.abs(p.y - PITCH.centerY) <= PENALTY_AREA.halfWidth;
}

/**
 * Detecta se a bola cruzou totalmente uma linha de gol entre `prev` e `next`,
 * dentro das traves e abaixo do travessão. Retorna o time que marcou.
 */
export function detectGoal(prev: Vec2, next: Vec2, z: number, ballRadius: number): TeamSide | null {
  if (z >= GOAL.crossbarHeight) return null;

  const leftLine = PITCH.left - ballRadius;
  if (prev.x >= leftLine && next.x < leftLine) {
    const y = crossingY(prev, next, leftLine);
    if (isWithinGoalMouth(y)) return 'away';
  }

  const rightLine = PITCH.right + ballRadius;
  if (prev.x <= rightLine && next.x > rightLine) {
    const y = crossingY(prev, next, rightLine);
    if (isWithinGoalMouth(y)) return 'home';
  }

  return null;
}

function crossingY(prev: Vec2, next: Vec2, lineX: number): number {
  const dx = next.x - prev.x;
  if (dx === 0) return next.y;
  const t = (lineX - prev.x) / dx;
  return prev.y + (next.y - prev.y) * t;
}

/**
 * Converte coordenadas táticas em posição de mundo.
 * `depth`: 0 = linha do próprio gol, 1 = linha do gol adversário.
 * `lateral`: -1 = lateral superior, 1 = lateral inferior.
 */
export function tacticalToWorld(team: TeamSide, depth: number, lateral: number): Vec2 {
  const x = team === 'home' ? PITCH.left + depth * PITCH_LENGTH : PITCH.right - depth * PITCH_LENGTH;
  return vec(x, PITCH.centerY + lateral * PITCH_HALF_HEIGHT);
}

/** Profundidade tática (0..1) de um X de mundo do ponto de vista de `team`. */
export function depthOf(team: TeamSide, x: number): number {
  const d = (x - PITCH.left) / PITCH_LENGTH;
  return team === 'home' ? d : 1 - d;
}

export const lateralOf = (y: number): number => (y - PITCH.centerY) / PITCH_HALF_HEIGHT;

/** Mantém um ponto dentro do campo, com margem (positiva = para dentro). */
export const clampToPitch = (p: Vec2, margin: number): Vec2 =>
  vec(clamp(p.x, PITCH.left + margin, PITCH.right - margin), clamp(p.y, PITCH.top + margin, PITCH.bottom - margin));
