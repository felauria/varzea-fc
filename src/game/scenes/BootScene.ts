import * as Phaser from 'phaser';
import { ASSET_MANIFEST } from '../assets/manifest';
import { createPlaceholderTextures } from '../assets/placeholderTextures';
import type { MatchSceneDeps } from './MatchScene';

export const BOOT_SCENE_KEY = 'boot';

/** Carrega os assets do manifesto e gera os placeholders, depois inicia a partida. */
export class BootScene extends Phaser.Scene {
  private readonly deps: MatchSceneDeps;

  constructor(deps: MatchSceneDeps) {
    super({ key: BOOT_SCENE_KEY });
    this.deps = deps;
  }

  preload(): void {
    for (const entry of ASSET_MANIFEST) {
      if (entry.type === 'image') this.load.image(entry.key, entry.url);
      else this.load.spritesheet(entry.key, entry.url, { frameWidth: entry.frameWidth, frameHeight: entry.frameHeight });
    }
  }

  create(): void {
    createPlaceholderTextures(this, this.deps.teams);
    this.scene.start('match');
  }
}
