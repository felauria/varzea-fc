import type { ControlCommands } from '../core/types';
import { directionFromAxes } from '../systems/movement';
import type { ActionReader } from './InputManager';

/** Traduz o estado das ações abstratas em comandos para a simulação da partida. */
export function buildControlCommands(input: ActionReader): ControlCommands {
  return {
    move: directionFromAxes(
      input.isDown('moveUp'),
      input.isDown('moveDown'),
      input.isDown('moveLeft'),
      input.isDown('moveRight'),
    ),
    sprint: input.isDown('sprint'),
    shortPass: input.wasPressed('shortPass'),
    throughPass: input.wasPressed('throughPass'),
    longPass: input.wasPressed('longPass'),
    shoot: input.wasPressed('shoot'),
    switchPlayer: input.wasPressed('switchPlayer'),
    tackle: input.wasPressed('tackle'),
    pressure: input.isDown('tackle'),
  };
}
