import { describe, expect, it, vi } from 'vitest';
import { buildControlCommands } from './commands';
import { InputManager } from './InputManager';

function keyEvent(type: 'keydown' | 'keyup', code: string, extra: { repeat?: boolean; target?: unknown } = {}) {
  const event = new Event(type, { cancelable: true });
  Object.assign(event, { code, repeat: extra.repeat ?? false });
  if (extra.target) Object.defineProperty(event, 'target', { value: extra.target });
  return event;
}

function setup() {
  const win = new EventTarget();
  const doc = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  const onFocusLost = vi.fn();
  const input = new InputManager();
  input.attach(win, doc, onFocusLost);
  return { win, doc, input, onFocusLost };
}

describe('InputManager', () => {
  it('distingue ação contínua de ação de disparo único', () => {
    const { win, input } = setup();
    win.dispatchEvent(keyEvent('keydown', 'KeyW'));
    win.dispatchEvent(keyEvent('keydown', 'KeyJ'));
    expect(input.isDown('moveUp')).toBe(true);
    expect(input.wasPressed('shoot')).toBe(true);

    input.endFrame();
    expect(input.isDown('moveUp')).toBe(true);
    expect(input.wasPressed('shoot')).toBe(false);
  });

  it('não repete ações únicas enquanto a tecla continua pressionada', () => {
    const { win, input } = setup();
    win.dispatchEvent(keyEvent('keydown', 'Space'));
    input.endFrame();
    // Auto-repeat do sistema operacional (com e sem a flag repeat).
    win.dispatchEvent(keyEvent('keydown', 'Space', { repeat: true }));
    win.dispatchEvent(keyEvent('keydown', 'Space'));
    expect(input.wasPressed('shortPass')).toBe(false);

    win.dispatchEvent(keyEvent('keyup', 'Space'));
    win.dispatchEvent(keyEvent('keydown', 'Space'));
    expect(input.wasPressed('shortPass')).toBe(true);
  });

  it('impede o comportamento padrão (scroll) das teclas do jogo, como Espaço', () => {
    const { win } = setup();
    const space = keyEvent('keydown', 'Space');
    const unbound = keyEvent('keydown', 'KeyZ');
    win.dispatchEvent(space);
    win.dispatchEvent(unbound);
    expect(space.defaultPrevented).toBe(true);
    expect(unbound.defaultPrevented).toBe(false);
  });

  it('ignora teclas digitadas em campos de texto', () => {
    const { win, input } = setup();
    const event = keyEvent('keydown', 'Space', { target: { tagName: 'INPUT', isContentEditable: false } });
    win.dispatchEvent(event);
    expect(input.wasPressed('shortPass')).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it('solta todas as teclas quando a janela perde o foco', () => {
    const { win, input, onFocusLost } = setup();
    win.dispatchEvent(keyEvent('keydown', 'KeyD'));
    win.dispatchEvent(keyEvent('keydown', 'ShiftLeft'));
    win.dispatchEvent(new Event('blur'));
    expect(input.isDown('moveRight')).toBe(false);
    expect(input.isDown('sprint')).toBe(false);
    expect(onFocusLost).toHaveBeenCalledOnce();
  });

  it('solta todas as teclas quando a aba fica oculta', () => {
    const { win, doc, input } = setup();
    win.dispatchEvent(keyEvent('keydown', 'KeyA'));
    doc.visibilityState = 'hidden';
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(input.isDown('moveLeft')).toBe(false);
  });

  it('mantém a ação ativa enquanto qualquer tecla mapeada para ela estiver pressionada', () => {
    const { win, input } = setup();
    win.dispatchEvent(keyEvent('keydown', 'ShiftLeft'));
    win.dispatchEvent(keyEvent('keydown', 'ShiftRight'));
    win.dispatchEvent(keyEvent('keyup', 'ShiftLeft'));
    expect(input.isDown('sprint')).toBe(true);
  });

  it('remove os listeners ao desanexar', () => {
    const { win, input } = setup();
    input.detach();
    win.dispatchEvent(keyEvent('keydown', 'KeyW'));
    expect(input.isDown('moveUp')).toBe(false);
    expect(input.isAttached).toBe(false);
  });
});

describe('buildControlCommands', () => {
  it('normaliza a diagonal e mapeia as ações', () => {
    const { win, input } = setup();
    for (const code of ['KeyW', 'KeyD', 'KeyE', 'KeyQ']) win.dispatchEvent(keyEvent('keydown', code));
    const cmd = buildControlCommands(input);
    expect(Math.hypot(cmd.move.x, cmd.move.y)).toBeCloseTo(1);
    expect(cmd.move.x).toBeGreaterThan(0);
    expect(cmd.move.y).toBeLessThan(0);
    expect(cmd.tackle).toBe(true);
    expect(cmd.pressure).toBe(true);
    expect(cmd.switchPlayer).toBe(true);
    expect(cmd.shoot).toBe(false);
  });
});
