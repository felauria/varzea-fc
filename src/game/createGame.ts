import * as Phaser from 'phaser';
import { WORLD_HEIGHT, WORLD_WIDTH } from './core/pitch';
import { BootScene } from './scenes/BootScene';
import { MatchScene, type MatchSceneDeps } from './scenes/MatchScene';

/**
 * Cria a instância do Phaser dentro de `parent`.
 * O input do Phaser fica desligado: o teclado é tratado pelo `InputManager`.
 */
export function createGame(parent: HTMLElement, deps: MatchSceneDeps): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    backgroundColor: '#1d3b1f',
    pixelArt: true,
    banner: false,
    audio: { noAudio: true },
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [new BootScene(deps), new MatchScene(deps)],
  });
}
