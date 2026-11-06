import type { PlayerRole, TeamSide } from '../core/types';

/**
 * Ponto único de chaves e caminhos de assets. Nenhum outro módulo deve
 * conhecer caminhos de arquivo.
 */
export const TEXTURE_KEYS = {
  ball: 'ball',
  ballShadow: 'ball-shadow',
  playerShadow: 'player-shadow',
  possessionRing: 'possession-ring',
  controlMarker: 'control-marker',
} as const;

/** Uma textura de atleta por time e por tipo de uniforme (linha ou goleiro). */
export const kitTextureKey = (team: TeamSide, role: PlayerRole): string =>
  `kit-${team}-${role === 'gk' ? 'gk' : 'field'}`;

export type AssetEntry =
  | { type: 'image'; key: string; url: string }
  | { type: 'spritesheet'; key: string; url: string; frameWidth: number; frameHeight: number };

/**
 * Arquivos em `public/assets/` a carregar. Vazio enquanto as pixel arts finais
 * não são entregues: tudo é gerado como placeholder em `placeholderTextures.ts`.
 *
 * Exemplo futuro:
 *   { type: 'spritesheet', key: 'player-base', url: 'assets/sprites/players/player-base.png', frameWidth: 16, frameHeight: 24 },
 *   { type: 'spritesheet', key: 'player-mask', url: 'assets/kits/player-mask.png', frameWidth: 16, frameHeight: 24 },
 */
export const ASSET_MANIFEST: readonly AssetEntry[] = [];
