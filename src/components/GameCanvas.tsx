import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import type * as Phaser from 'phaser';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../game/core/pitch';
import { createGame } from '../game/createGame';
import type { MatchSceneDeps } from '../game/scenes/MatchScene';
import { computeIntegerFit, type FitResult } from '../shared/integerFit';

interface GameCanvasProps {
  /** Dependências estáveis da partida. Trocar a referência recria o jogo. */
  deps: MatchSceneDeps;
  /** Sobreposições (pausa, aviso de gol) desenhadas sobre o canvas. */
  children?: ReactNode;
}

/**
 * Monta e desmonta a instância do Phaser. O jogo é criado uma única vez por `deps`
 * (não a cada renderização) e destruído ao desmontar, removendo canvas e listeners.
 * O quadro do canvas é dimensionado em múltiplos inteiros da resolução base.
 */
export const GameCanvas = memo(function GameCanvas({ deps, children }: GameCanvasProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [fit, setFit] = useState<FitResult | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const game = createGame(mount, deps);
    gameRef.current = game;
    return () => {
      gameRef.current = null;
      game.destroy(true);
    };
  }, [deps]);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const next = computeIntegerFit(width, height, WORLD_WIDTH, WORLD_HEIGHT);
      setFit((prev) => (prev && prev.width === next.width && prev.height === next.height ? prev : next));
    });
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scale = gameRef.current?.scale;
    if (!scale?.canvas) return;
    // `refresh()` usa o tamanho do pai em cache: atualize-o antes, senão o canvas não acompanha o quadro.
    scale.getParentBounds();
    scale.refresh();
  }, [fit]);

  return (
    <div className="stage" ref={outerRef}>
      <div
        className="stage__frame"
        style={fit ? { width: fit.width, height: fit.height } : undefined}
        data-scale={fit?.scale}
      >
        <div className="stage__canvas" ref={mountRef} />
        {children}
      </div>
    </div>
  );
});
