import { DEFAULT_KEY_BINDINGS, type GameAction, type KeyBindings } from './actions';

/** Leitura de ações abstratas, independente do dispositivo (teclado agora; manete no futuro). */
export interface ActionReader {
  /** Ação contínua: a tecla está pressionada agora. */
  isDown(action: GameAction): boolean;
  /** Ação de disparo único: foi pressionada desde o último `endFrame()`. Não repete enquanto segurada. */
  wasPressed(action: GameAction): boolean;
}

/** Subconjunto de `KeyboardEvent` usado pelo gerenciador (facilita testes). */
export interface KeyEventLike {
  readonly code: string;
  readonly repeat?: boolean;
  readonly target?: EventTarget | null;
  preventDefault(): void;
}

type Listener = (event: Event) => void;
interface ListenerTarget {
  addEventListener(type: string, listener: Listener): void;
  removeEventListener(type: string, listener: Listener): void;
}

function isEditableTarget(target: EventTarget | null | undefined): boolean {
  if (!target || typeof (target as HTMLElement).tagName !== 'string') return false;
  const el = target as HTMLElement;
  return el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
}

/**
 * Converte eventos de teclado em ações do jogo.
 * - distingue ações contínuas (`isDown`) de ações únicas (`wasPressed`), ignorando auto-repeat;
 * - impede o scroll/atalhos do navegador para as teclas do jogo (ex.: Espaço);
 * - limpa todas as teclas quando a janela perde o foco ou a aba fica oculta.
 */
export class InputManager implements ActionReader {
  private readonly bindings: KeyBindings;
  private readonly heldKeys = new Set<string>();
  private readonly pressed = new Set<GameAction>();
  private window: ListenerTarget | null = null;
  private document: (ListenerTarget & { visibilityState?: string }) | null = null;
  private onFocusLost: (() => void) | null = null;

  constructor(bindings: KeyBindings = DEFAULT_KEY_BINDINGS) {
    this.bindings = bindings;
  }

  attach(
    win: ListenerTarget,
    doc: (ListenerTarget & { visibilityState?: string }) | null = null,
    onFocusLost: (() => void) | null = null,
  ): void {
    this.detach();
    this.window = win;
    this.document = doc;
    this.onFocusLost = onFocusLost;
    win.addEventListener('keydown', this.handleKeyDownEvent);
    win.addEventListener('keyup', this.handleKeyUpEvent);
    win.addEventListener('blur', this.handleBlur);
    doc?.addEventListener('visibilitychange', this.handleVisibility);
  }

  detach(): void {
    this.window?.removeEventListener('keydown', this.handleKeyDownEvent);
    this.window?.removeEventListener('keyup', this.handleKeyUpEvent);
    this.window?.removeEventListener('blur', this.handleBlur);
    this.document?.removeEventListener('visibilitychange', this.handleVisibility);
    this.window = null;
    this.document = null;
    this.onFocusLost = null;
    this.reset();
  }

  get isAttached(): boolean {
    return this.window !== null;
  }

  handleKeyDown(event: KeyEventLike): void {
    const action = this.bindings[event.code];
    if (!action || isEditableTarget(event.target)) return;
    event.preventDefault();
    const alreadyHeld = this.heldKeys.has(event.code);
    this.heldKeys.add(event.code);
    if (!alreadyHeld && !event.repeat) this.pressed.add(action);
  }

  handleKeyUp(event: KeyEventLike): void {
    if (!this.bindings[event.code]) return;
    this.heldKeys.delete(event.code);
  }

  isDown(action: GameAction): boolean {
    for (const code of this.heldKeys) if (this.bindings[code] === action) return true;
    return false;
  }

  wasPressed(action: GameAction): boolean {
    return this.pressed.has(action);
  }

  /** Deve ser chamado uma vez ao final de cada quadro, após consumir as ações únicas. */
  endFrame(): void {
    this.pressed.clear();
  }

  /** Solta todas as teclas (perda de foco, pausa, troca de cena). */
  reset(): void {
    this.heldKeys.clear();
    this.pressed.clear();
  }

  private readonly handleKeyDownEvent = (event: Event): void => this.handleKeyDown(event as KeyboardEvent);
  private readonly handleKeyUpEvent = (event: Event): void => this.handleKeyUp(event as KeyboardEvent);

  private readonly handleBlur = (): void => {
    this.reset();
    this.onFocusLost?.();
  };

  private readonly handleVisibility = (): void => {
    if (this.document?.visibilityState === 'hidden') this.handleBlur();
  };
}
