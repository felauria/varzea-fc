import type * as Phaser from 'phaser';
import type { HexColor } from '../../domain/kit';
import type { TeamProfile } from '../../domain/teams';
import type { TeamSide } from '../core/types';
import { composeKitSprite } from './kitSprite';
import { kitTextureKey, TEXTURE_KEYS } from './manifest';

type PixelGrid = readonly (readonly (HexColor | null)[])[];

/** Cria um canvas com pixels exatos a partir de uma matriz de cores. */
function gridToCanvas(grid: PixelGrid, alpha = 1): HTMLCanvasElement {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.globalAlpha = alpha;
  grid.forEach((row, y) =>
    row.forEach((color, x) => {
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }),
  );
  return canvas;
}

/** Converte um desenho em texto (`#` = cor, `.` = vazio) em matriz de cores. */
function shape(rows: readonly string[], palette: Readonly<Record<string, HexColor>>): PixelGrid {
  return rows.map((row) => [...row].map((c) => palette[c] ?? null));
}

function addTexture(scene: Phaser.Scene, key: string, canvas: HTMLCanvasElement): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
}

/**
 * Gera as texturas provisórias (formas simples e claramente temporárias).
 * Os uniformes são compostos dinamicamente a partir das cores escolhidas.
 */
export function createPlaceholderTextures(scene: Phaser.Scene, teams: Readonly<Record<TeamSide, TeamProfile>>): void {
  addTexture(
    scene,
    TEXTURE_KEYS.ball,
    gridToCanvas(shape(['.ww.', 'wkww', 'wwkw', '.ww.'], { w: '#f7f7f7', k: '#2a2a2a' })),
  );
  addTexture(scene, TEXTURE_KEYS.ballShadow, gridToCanvas(shape(['.##.', '####', '.##.'], { '#': '#000000' }), 0.35));
  addTexture(
    scene,
    TEXTURE_KEYS.playerShadow,
    gridToCanvas(shape(['..######..', '##########', '..######..'], { '#': '#000000' }), 0.3),
  );
  addTexture(
    scene,
    TEXTURE_KEYS.possessionRing,
    gridToCanvas(
      shape(['...#######...', '.##.......##.', '#...........#', '.##.......##.', '...#######...'], { '#': '#ffffff' }),
    ),
  );
  addTexture(
    scene,
    TEXTURE_KEYS.controlMarker,
    gridToCanvas(shape(['#######', '.#####.', '..###..', '...#...'], { '#': '#ffe14d' })),
  );

  for (const side of ['home', 'away'] as const) {
    const team = teams[side];
    addTexture(scene, kitTextureKey(side, 'def'), gridToCanvas(composeKitSprite(team.kit)));
    addTexture(scene, kitTextureKey(side, 'gk'), gridToCanvas(composeKitSprite(team.goalkeeperKit)));
  }
}
