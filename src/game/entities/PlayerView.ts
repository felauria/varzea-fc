import type * as Phaser from 'phaser';
import { kitTextureKey, TEXTURE_KEYS } from '../assets/manifest';
import { PLAYER_SPRITE_SIZE } from '../assets/kitSprite';
import type { PlayerState } from '../core/types';
import { length } from '../core/vec2';

/**
 * Representação visual de um atleta. Apenas lê o estado da simulação;
 * nunca altera regras. Trocar o placeholder por spritesheet acontece aqui.
 */
export class PlayerView {
  private readonly body: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Image;
  private readonly ring: Phaser.GameObjects.Image;
  private readonly marker: Phaser.GameObjects.Image;
  readonly playerId: string;

  constructor(scene: Phaser.Scene, player: PlayerState) {
    this.playerId = player.id;
    this.shadow = scene.add.image(0, 0, TEXTURE_KEYS.playerShadow);
    this.ring = scene.add.image(0, 0, TEXTURE_KEYS.possessionRing).setVisible(false);
    // Origem nos pés: a posição da simulação é o ponto de contato com o gramado.
    this.body = scene.add.image(0, 0, kitTextureKey(player.team, player.role)).setOrigin(0.5, 1);
    this.marker = scene.add.image(0, 0, TEXTURE_KEYS.controlMarker).setOrigin(0.5, 1).setVisible(false);
  }

  sync(player: PlayerState, opts: { controlled: boolean; hasBall: boolean; time: number }): void {
    const x = Math.round(player.pos.x);
    const y = Math.round(player.pos.y);
    const moving = length(player.vel) > 10;
    const bob = moving && Math.floor(opts.time / 120) % 2 === 0 ? 1 : 0;

    this.shadow.setPosition(x, y).setDepth(y - 0.3);
    this.ring.setPosition(x, y).setDepth(y - 0.2).setVisible(opts.hasBall);
    this.body
      .setPosition(x, y + 2 - bob)
      .setDepth(y)
      .setFlipX(player.facing.x < 0);
    this.marker
      .setPosition(x, y - PLAYER_SPRITE_SIZE.height - 1 - (Math.floor(opts.time / 300) % 2))
      .setDepth(10_000)
      .setVisible(opts.controlled);
  }

  destroy(): void {
    this.body.destroy();
    this.shadow.destroy();
    this.ring.destroy();
    this.marker.destroy();
  }
}
