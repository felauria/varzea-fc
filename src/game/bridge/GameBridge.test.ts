import { describe, expect, it, vi } from 'vitest';
import { GameBridge, type MatchHudState } from './GameBridge';

const initial: MatchHudState = {
  teams: {
    home: { name: 'A', shortName: 'A', color: '#000000' },
    away: { name: 'B', shortName: 'B', color: '#ffffff' },
  },
  score: { home: 0, away: 0 },
  clockSeconds: 180,
  phase: 'kickoff',
  paused: false,
  lastScorer: null,
  goalCount: 0,
};

describe('GameBridge', () => {
  it('notifica a interface apenas quando o estado muda', () => {
    const bridge = new GameBridge(initial);
    const listener = vi.fn();
    bridge.subscribe(listener);

    bridge.publish({ clockSeconds: 180, score: { home: 0, away: 0 } });
    expect(listener).not.toHaveBeenCalled();
    expect(bridge.getSnapshot()).toBe(initial);

    bridge.publish({ score: { home: 1, away: 0 } });
    expect(listener).toHaveBeenCalledOnce();
    expect(bridge.getSnapshot().score.home).toBe(1);
  });

  it('entrega comandos da interface para o jogo e permite cancelar a inscrição', () => {
    const bridge = new GameBridge(initial);
    const handler = vi.fn();
    const off = bridge.onCommand(handler);
    bridge.send('pause');
    off();
    bridge.send('resume');
    expect(handler).toHaveBeenCalledExactlyOnceWith('pause');
  });
});
