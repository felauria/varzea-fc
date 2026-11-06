import type { MatchHudState } from '../../game/bridge/GameBridge';
import { formatClock } from './useMatchHud';

const PHASE_LABEL: Record<MatchHudState['phase'], string> = {
  kickoff: 'Saída de bola',
  playing: 'Bola rolando',
  goal: 'Gol!',
  fullTime: 'Fim de jogo',
};

export function Scoreboard({ hud, onPause }: { hud: MatchHudState; onPause: () => void }) {
  const { teams, score } = hud;
  return (
    <header className="scoreboard" aria-label="Placar">
      <div className="scoreboard__team scoreboard__team--home">
        <span className="scoreboard__swatch" style={{ background: teams.home.color }} aria-hidden />
        <span className="scoreboard__name">{teams.home.name}</span>
      </div>
      <div className="scoreboard__center">
        <div className="scoreboard__score" aria-live="polite">
          <span>{score.home}</span>
          <span className="scoreboard__sep">×</span>
          <span>{score.away}</span>
        </div>
        <div className="scoreboard__meta">
          <span className="scoreboard__clock">{formatClock(hud.clockSeconds)}</span>
          <span className="scoreboard__phase">{hud.paused ? 'Pausado' : PHASE_LABEL[hud.phase]}</span>
        </div>
      </div>
      <div className="scoreboard__team scoreboard__team--away">
        <span className="scoreboard__name">{teams.away.name}</span>
        <span className="scoreboard__swatch" style={{ background: teams.away.color }} aria-hidden />
      </div>
      <button
        type="button"
        className="scoreboard__pause"
        onClick={onPause}
        disabled={hud.phase === 'fullTime'}
        tabIndex={-1}
      >
        Pausar (Esc)
      </button>
    </header>
  );
}
