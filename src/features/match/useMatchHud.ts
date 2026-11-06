import { useSyncExternalStore } from 'react';
import type { GameBridge, MatchHudState } from '../../game/bridge/GameBridge';

/** Assina o estado da partida publicado pelo Phaser através da ponte tipada. */
export function useMatchHud(bridge: GameBridge): MatchHudState {
  return useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
