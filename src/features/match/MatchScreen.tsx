import { useCallback, useState } from 'react';
import { GameCanvas } from '../../components/GameCanvas';
import { DEFAULT_OPPONENT_TEAM, DEFAULT_USER_TEAM, type TeamProfile } from '../../domain/teams';
import { GameBridge, type HudTeam, type UiCommand } from '../../game/bridge/GameBridge';
import { TUNING } from '../../game/core/tuning';
import type { TeamSide } from '../../game/core/types';
import type { MatchSceneDeps } from '../../game/scenes/MatchScene';
import { ControlsHelp } from './ControlsHelp';
import { MatchOverlays } from './MatchOverlays';
import { Scoreboard } from './Scoreboard';
import { useMatchHud } from './useMatchHud';

const toHudTeam = (t: TeamProfile): HudTeam => ({ name: t.name, shortName: t.shortName, color: t.kit.primary });

function createMatchDeps(): MatchSceneDeps {
  const teams: Record<TeamSide, TeamProfile> = { home: DEFAULT_USER_TEAM, away: DEFAULT_OPPONENT_TEAM };
  const bridge = new GameBridge({
    teams: { home: toHudTeam(teams.home), away: toHudTeam(teams.away) },
    score: { home: 0, away: 0 },
    clockSeconds: TUNING.match.durationSeconds,
    phase: 'kickoff',
    paused: false,
    lastScorer: null,
    goalCount: 0,
  });
  return { bridge, teams, userTeam: 'home' };
}

/** Tela da partida: placar e sobreposições em React; o campo é renderizado pelo Phaser. */
export function MatchScreen() {
  // Criadas uma única vez: a referência estável impede que o jogo seja recriado.
  const [deps] = useState(createMatchDeps);
  const hud = useMatchHud(deps.bridge);
  const send = useCallback((command: UiCommand) => deps.bridge.send(command), [deps]);

  return (
    <main className="match-screen">
      <Scoreboard hud={hud} onPause={() => send('pause')} />
      <GameCanvas deps={deps}>
        <MatchOverlays hud={hud} send={send} />
      </GameCanvas>
      <ControlsHelp />
    </main>
  );
}
