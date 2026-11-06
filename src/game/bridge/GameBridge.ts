import type { MatchPhase, Score, TeamSide } from '../core/types';
import type { HexColor } from '../../domain/kit';

/** Informações de um time exibidas na interface React. */
export interface HudTeam {
  readonly name: string;
  readonly shortName: string;
  readonly color: HexColor;
}

/** Estado da partida que a interface React exibe (somente leitura para o React). */
export interface MatchHudState {
  readonly teams: Readonly<Record<TeamSide, HudTeam>>;
  readonly score: Score;
  readonly clockSeconds: number;
  readonly phase: MatchPhase;
  readonly paused: boolean;
  readonly lastScorer: TeamSide | null;
  /** Incrementa a cada gol, para reiniciar animações do aviso de gol. */
  readonly goalCount: number;
}

/** Comandos que a interface envia para o jogo. */
export type UiCommand = 'pause' | 'resume' | 'restart';

type Listener = () => void;
type CommandListener = (command: UiCommand) => void;

/**
 * Canal tipado entre React e Phaser.
 * - Phaser → React: `publish()` atualiza um snapshot imutável, lido via `useSyncExternalStore`.
 * - React → Phaser: `send()` envia comandos que a cena escuta com `onCommand()`.
 */
export class GameBridge {
  private state: MatchHudState;
  private readonly listeners = new Set<Listener>();
  private readonly commandListeners = new Set<CommandListener>();

  constructor(initial: MatchHudState) {
    this.state = initial;
  }

  readonly getSnapshot = (): MatchHudState => this.state;

  readonly subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  publish(patch: Partial<MatchHudState>): void {
    const keys = Object.keys(patch) as (keyof MatchHudState)[];
    const changed = keys.some((k) => !shallowEqual(this.state[k], patch[k]));
    if (!changed) return;
    this.state = { ...this.state, ...patch };
    for (const l of this.listeners) l();
  }

  send(command: UiCommand): void {
    for (const l of this.commandListeners) l(command);
  }

  onCommand(listener: CommandListener): () => void {
    this.commandListeners.add(listener);
    return () => this.commandListeners.delete(listener);
  }
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}
