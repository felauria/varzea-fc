/** Ações abstratas do jogo. A lógica da partida nunca consulta teclas diretamente. */
export const GAME_ACTIONS = [
  'moveUp',
  'moveDown',
  'moveLeft',
  'moveRight',
  'shortPass',
  'shoot',
  'throughPass',
  'longPass',
  'sprint',
  'switchPlayer',
  'tackle',
  'pause',
] as const;

export type GameAction = (typeof GAME_ACTIONS)[number];

/**
 * Mapeamento padrão por `KeyboardEvent.code` (posição física da tecla),
 * para funcionar igual em layouts ABNT2, US etc. Será configurável no futuro.
 */
export type KeyBindings = Readonly<Record<string, GameAction>>;

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  KeyW: 'moveUp',
  KeyS: 'moveDown',
  KeyA: 'moveLeft',
  KeyD: 'moveRight',
  Space: 'shortPass',
  KeyJ: 'shoot',
  KeyK: 'throughPass',
  KeyL: 'longPass',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
  KeyQ: 'switchPlayer',
  KeyE: 'tackle',
  Escape: 'pause',
};

/** Rótulos exibidos na interface para cada ação. */
export const ACTION_LABELS: Readonly<Record<GameAction, string>> = {
  moveUp: 'Mover para cima',
  moveDown: 'Mover para baixo',
  moveLeft: 'Mover para a esquerda',
  moveRight: 'Mover para a direita',
  shortPass: 'Passe curto',
  shoot: 'Finalização',
  throughPass: 'Passe em profundidade',
  longPass: 'Passe longo',
  sprint: 'Correr',
  switchPlayer: 'Trocar jogador',
  tackle: 'Desarme / pressão',
  pause: 'Pausar',
};
