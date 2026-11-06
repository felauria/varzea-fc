import * as Phaser from 'phaser';
import type { TeamProfile } from '../../domain/teams';
import type { GameBridge, UiCommand } from '../bridge/GameBridge';
import { createRng, type Rng } from '../core/rng';
import type { MatchEvent, MatchState, TeamSide } from '../core/types';
import { BallView } from '../entities/BallView';
import { drawPitch } from '../entities/PitchView';
import { PlayerView } from '../entities/PlayerView';
import { buildControlCommands } from '../input/commands';
import { InputManager } from '../input/InputManager';
import { createMatchState } from '../systems/matchSetup';
import { stepMatch, withoutOneShotActions } from '../systems/matchEngine';

export const MATCH_SCENE_KEY = 'match';

/** Passo fixo da simulação (60 Hz), independente da taxa de quadros. */
const FIXED_DT = 1 / 60;
const MAX_FRAME_DT = 0.1;

export interface MatchSceneDeps {
  readonly bridge: GameBridge;
  readonly teams: Readonly<Record<TeamSide, TeamProfile>>;
  readonly userTeam: TeamSide;
  readonly seed?: number;
}

/**
 * Cena da partida: orquestra input → simulação pura → visual → interface.
 * Não contém regras de futebol; elas ficam em `game/systems`.
 */
export class MatchScene extends Phaser.Scene {
  private readonly deps: MatchSceneDeps;
  private readonly actionInput = new InputManager();
  private state!: MatchState;
  private rng!: Rng;
  private playerViews: PlayerView[] = [];
  private ballView!: BallView;
  private accumulator = 0;
  private paused = false;
  private unsubscribeCommands: (() => void) | null = null;

  constructor(deps: MatchSceneDeps) {
    super({ key: MATCH_SCENE_KEY });
    this.deps = deps;
  }

  create(): void {
    drawPitch(this);
    this.startNewMatch();
    this.ballView = new BallView(this);

    this.actionInput.attach(window, document, () => this.setPaused(true));
    this.unsubscribeCommands = this.deps.bridge.onCommand((c) => this.handleCommand(c));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanup());

    if (import.meta.env.DEV) {
      window.__varzea = { getState: () => this.state, input: this.actionInput, scene: this };
    }
  }

  private startNewMatch(): void {
    this.rng = createRng(this.deps.seed ?? Date.now());
    this.state = createMatchState({
      userTeam: this.deps.userTeam,
      formations: { home: this.deps.teams.home.formation, away: this.deps.teams.away.formation },
    });
    for (const view of this.playerViews) view.destroy();
    this.playerViews = this.state.players.map((p) => new PlayerView(this, p));
    this.accumulator = 0;
    this.paused = false;
    this.actionInput.reset();
    this.publishHud();
  }

  update(time: number, deltaMs: number): void {
    if (this.actionInput.wasPressed('pause')) this.setPaused(!this.paused);

    if (!this.paused) {
      const commands = buildControlCommands(this.actionInput);
      this.accumulator += Math.min(deltaMs / 1000, MAX_FRAME_DT);
      let first = true;
      while (this.accumulator >= FIXED_DT) {
        // Ações de disparo único são aplicadas só no primeiro passo do quadro.
        const events = stepMatch(this.state, first ? commands : withoutOneShotActions(commands), FIXED_DT, this.rng);
        this.handleEvents(events);
        this.accumulator -= FIXED_DT;
        first = false;
      }
    }
    this.actionInput.endFrame();
    this.render(time);
    this.deps.bridge.publish({ clockSeconds: Math.ceil(this.state.clock) });
  }

  private render(time: number): void {
    const state = this.state;
    for (let i = 0; i < this.playerViews.length; i++) {
      const p = state.players[i];
      this.playerViews[i].sync(p, {
        controlled: p.id === state.controlledId && state.phase !== 'fullTime',
        hasBall: state.ball.ownerId === p.id,
        time,
      });
    }
    this.ballView.sync(state.ball);
  }

  private handleEvents(events: MatchEvent[]): void {
    for (const e of events) {
      if (e.type === 'goal') {
        this.deps.bridge.publish({
          score: { ...this.state.score },
          lastScorer: e.scorer,
          goalCount: this.deps.bridge.getSnapshot().goalCount + 1,
        });
        this.cameras.main.shake(180, 0.004);
      } else if (e.type === 'phase') {
        this.deps.bridge.publish({ phase: e.phase });
      }
    }
  }

  private handleCommand(command: UiCommand): void {
    if (command === 'pause') this.setPaused(true);
    else if (command === 'resume') this.setPaused(false);
    else if (command === 'restart') this.startNewMatch();
  }

  private setPaused(paused: boolean): void {
    if (this.state.phase === 'fullTime') paused = false;
    if (this.paused === paused) return;
    this.paused = paused;
    // Ao pausar/retomar, nenhuma tecla deve continuar "presa".
    this.actionInput.reset();
    this.accumulator = 0;
    this.deps.bridge.publish({ paused });
  }

  private publishHud(): void {
    this.deps.bridge.publish({
      score: { ...this.state.score },
      clockSeconds: Math.ceil(this.state.clock),
      phase: this.state.phase,
      paused: this.paused,
      lastScorer: null,
    });
  }

  private cleanup(): void {
    this.actionInput.detach();
    this.unsubscribeCommands?.();
    this.unsubscribeCommands = null;
    if (import.meta.env.DEV && window.__varzea?.scene === this) delete window.__varzea;
  }
}

declare global {
  interface Window {
    /** Gancho de depuração disponível apenas em desenvolvimento. */
    __varzea?: { getState: () => MatchState; input: InputManager; scene: MatchScene };
  }
}
