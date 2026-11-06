import type * as Phaser from 'phaser';
import {
  GOAL,
  GOAL_AREA,
  PENALTY_AREA,
  PENALTY_SPOT_DISTANCE,
  PITCH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../core/pitch';

const COLORS = {
  surround: 0x2b5e2a,
  grassA: 0x3f8f3a,
  grassB: 0x47a142,
  line: 0xf2f2f2,
  net: 0xdedede,
  post: 0xffffff,
} as const;

/** Desenha o campo provisório (gramado listrado, marcações e gols). */
export function drawPitch(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.setDepth(-1000);

  g.fillStyle(COLORS.surround, 1);
  g.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const stripes = 14;
  const stripeWidth = (PITCH.right - PITCH.left) / stripes;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle(i % 2 === 0 ? COLORS.grassA : COLORS.grassB, 1);
    g.fillRect(PITCH.left + i * stripeWidth, PITCH.top, stripeWidth, PITCH.bottom - PITCH.top);
  }

  // Linhas de 1px alinhadas à grade de pixels.
  g.lineStyle(1, COLORS.line, 0.95);
  const h = 0.5;
  g.strokeRect(PITCH.left + h, PITCH.top + h, PITCH.right - PITCH.left - 1, PITCH.bottom - PITCH.top - 1);
  g.lineBetween(PITCH.centerX + h, PITCH.top, PITCH.centerX + h, PITCH.bottom);
  g.strokeCircle(PITCH.centerX + h, PITCH.centerY + h, PITCH.centerCircleRadius);
  g.fillStyle(COLORS.line, 1);
  g.fillRect(PITCH.centerX - 1, PITCH.centerY - 1, 3, 3);

  for (const side of [-1, 1] as const) {
    const line = side < 0 ? PITCH.left : PITCH.right;
    const inward = -side;
    const box = (depth: number, halfWidth: number) => {
      const x = inward > 0 ? line : line - depth;
      g.strokeRect(x + h, PITCH.centerY - halfWidth + h, depth - 1, halfWidth * 2 - 1);
    };
    box(PENALTY_AREA.depth, PENALTY_AREA.halfWidth);
    box(GOAL_AREA.depth, GOAL_AREA.halfWidth);
    g.fillRect(line + inward * PENALTY_SPOT_DISTANCE - 1, PITCH.centerY - 1, 2, 2);

    // Gol: rede quadriculada e traves.
    const gx = side < 0 ? line - GOAL.depth : line;
    const gy = PITCH.centerY - GOAL.halfWidth;
    g.fillStyle(0x000000, 0.25);
    g.fillRect(gx, gy, GOAL.depth, GOAL.halfWidth * 2);
    g.lineStyle(1, COLORS.net, 0.45);
    for (let x = gx + 3; x < gx + GOAL.depth; x += 3) g.lineBetween(x + h, gy, x + h, gy + GOAL.halfWidth * 2);
    for (let y = gy + 3; y < gy + GOAL.halfWidth * 2; y += 3) g.lineBetween(gx, y + h, gx + GOAL.depth, y + h);
    g.fillStyle(COLORS.post, 1);
    g.fillRect(gx, gy - 1, GOAL.depth, 2);
    g.fillRect(gx, gy + GOAL.halfWidth * 2 - 1, GOAL.depth, 2);
    g.fillRect(line - 1, gy - 1, 2, GOAL.halfWidth * 2 + 2);
    g.fillStyle(COLORS.line, 1);
    g.lineStyle(1, COLORS.line, 0.95);
  }

  return g;
}
