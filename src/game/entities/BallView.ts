import type * as Phaser from 'phaser';
import { TEXTURE_KEYS } from '../assets/manifest';
import type { BallState } from '../core/types';

/** Bola provisória com sombra; a altura (z) desloca a bola para cima em relação à sombra. */
export class BallView {
  private readonly ball: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene) {
    this.shadow = scene.add.image(0, 0, TEXTURE_KEYS.ballShadow);
    this.ball = scene.add.image(0, 0, TEXTURE_KEYS.ball);
  }

  sync(ball: BallState): void {
    const x = Math.round(ball.pos.x);
    const y = Math.round(ball.pos.y);
    this.shadow.setPosition(x, y + 1).setDepth(y - 0.25);
    this.ball.setPosition(x, Math.round(y - ball.z)).setDepth(y + 0.5 + (ball.z > 4 ? 1000 : 0));
  }

  destroy(): void {
    this.ball.destroy();
    this.shadow.destroy();
  }
}
