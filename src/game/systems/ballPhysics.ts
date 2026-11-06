import { detectGoal, GOAL, isWithinGoalMouth, PITCH } from '../core/pitch';
import { TUNING } from '../core/tuning';
import type { BallState, PlayerState, TeamSide } from '../core/types';
import { add, clamp, length, lerp, scale, vec, ZERO, type Vec2 } from '../core/vec2';

const R = TUNING.ball.radius;

/**
 * Integra a bola solta: gravidade, quique, desaceleração e rebatida nos limites.
 * Arcade: o campo funciona como uma quadra fechada (sem laterais/escanteios no protótipo).
 * Retorna o time que marcou, se a bola cruzou uma linha de gol.
 */
export function stepFreeBall(ball: BallState, dt: number, allowGoal = true): TeamSide | null {
  const b = TUNING.ball;

  if (ball.z > 0 || ball.vz > 0) {
    ball.vz -= b.gravity * dt;
    ball.z += ball.vz * dt;
    if (ball.z <= 0) {
      ball.z = 0;
      if (ball.vz < -30) {
        ball.vz = -ball.vz * b.bounceRestitution;
        ball.vel = scale(ball.vel, b.bounceGroundFriction);
      } else {
        ball.vz = 0;
      }
    }
  }

  const damping = ball.z > 0 ? b.airDamping : b.groundDamping;
  ball.vel = scale(ball.vel, Math.exp(-damping * dt));
  if (ball.z === 0 && length(ball.vel) < b.stopSpeed) ball.vel = ZERO;

  const prev = ball.pos;
  const next = add(prev, scale(ball.vel, dt));
  const scorer = allowGoal ? detectGoal(prev, next, ball.z, R) : null;
  resolveBoundaries(ball, prev, next);
  return scorer;
}

function resolveBoundaries(ball: BallState, prev: Vec2, next: Vec2): void {
  let { x, y } = next;
  let { x: vx, y: vy } = ball.vel;
  const rest = TUNING.ball.wallRestitution;
  const underBar = ball.z < GOAL.crossbarHeight;

  for (const side of [-1, 1] as const) {
    const line = side < 0 ? PITCH.left : PITCH.right;
    const beyond = side < 0 ? x - R < line : x + R > line;
    if (!beyond) continue;

    const wasInsideGoal = side < 0 ? prev.x - R < line : prev.x + R > line;
    if (wasInsideGoal) {
      // Dentro da rede: rede lateral e fundo do gol seguram a bola.
      const top = PITCH.centerY - GOAL.halfWidth + R;
      const bottom = PITCH.centerY + GOAL.halfWidth - R;
      if (y < top || y > bottom) {
        y = clamp(y, top, bottom);
        vy = -vy * rest;
      }
      const back = line + side * (GOAL.depth - R);
      if (side < 0 ? x < back : x > back) {
        x = back;
        vx = -vx * 0.2;
      }
    } else if (!(underBar && isWithinGoalMouth(y, R))) {
      x = line - side * R;
      vx = -vx * rest;
    }
  }

  const insideGoalArea = x - R < PITCH.left || x + R > PITCH.right;
  if (!insideGoalArea) {
    if (y - R < PITCH.top) {
      y = PITCH.top + R;
      vy = Math.abs(vy) * rest;
    } else if (y + R > PITCH.bottom) {
      y = PITCH.bottom - R;
      vy = -Math.abs(vy) * rest;
    }
  }

  ball.pos = vec(x, y);
  ball.vel = vec(vx, vy);
}

/**
 * Bola dominada: acompanha o pé do portador, levemente à frente.
 * Também detecta gol quando o atleta conduz a bola para dentro da meta.
 */
export function stepOwnedBall(ball: BallState, owner: PlayerState, dt: number): TeamSide | null {
  const target = add(owner.pos, scale(owner.facing, TUNING.ball.dribbleOffset));
  const next = lerp(ball.pos, target, Math.min(1, dt * TUNING.ball.dribbleFollow));
  const scorer = detectGoal(ball.pos, next, 0, R);
  ball.z = 0;
  ball.vz = 0;
  ball.vel = owner.vel;
  if (scorer) {
    ball.pos = next;
    return scorer;
  }
  ball.pos = vec(clamp(next.x, PITCH.left + R, PITCH.right - R), clamp(next.y, PITCH.top + R, PITCH.bottom - R));
  return null;
}
