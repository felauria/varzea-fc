import type { MatchHudState, UiCommand } from '../../game/bridge/GameBridge';

interface OverlayProps {
  hud: MatchHudState;
  send: (command: UiCommand) => void;
}

/** Sobreposições React desenhadas por cima do canvas: gol, pausa e fim de jogo. */
export function MatchOverlays({ hud, send }: OverlayProps) {
  if (hud.phase === 'fullTime') {
    const { home, away } = hud.score;
    const result = home > away ? `${hud.teams.home.name} venceu!` : home < away ? `${hud.teams.away.name} venceu!` : 'Empate!';
    return (
      <div className="overlay overlay--dim" role="dialog" aria-label="Fim de jogo">
        <div className="overlay__panel">
          <h2>Fim de jogo</h2>
          <p className="overlay__score">
            {hud.teams.home.shortName} {home} × {away} {hud.teams.away.shortName}
          </p>
          <p>{result}</p>
          <button type="button" onClick={() => send('restart')}>
            Jogar novamente
          </button>
        </div>
      </div>
    );
  }

  if (hud.paused) {
    return (
      <div className="overlay overlay--dim" role="dialog" aria-label="Partida pausada">
        <div className="overlay__panel">
          <h2>Pausado</h2>
          <p>Pressione Esc ou clique para continuar.</p>
          <div className="overlay__actions">
            <button type="button" onClick={() => send('resume')}>
              Continuar
            </button>
            <button type="button" className="secondary" onClick={() => send('restart')}>
              Reiniciar partida
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (hud.phase === 'goal' && hud.lastScorer) {
    return (
      <div className="overlay" aria-live="assertive">
        <div key={hud.goalCount} className="goal-banner">
          <span className="goal-banner__title">GOL!</span>
          <span className="goal-banner__team">{hud.teams[hud.lastScorer].name}</span>
        </div>
      </div>
    );
  }

  return null;
}
