import type { FieldRole, FormationId } from '../../domain/formations';
import type { Vec2 } from './vec2';

export type TeamSide = 'home' | 'away';
export type PlayerRole = 'gk' | FieldRole;
export type MatchPhase = 'kickoff' | 'playing' | 'goal' | 'fullTime';
export type KickKind = 'short' | 'through' | 'long' | 'shot' | 'clearance';

/** Posição tática de referência do atleta na formação. */
export interface TacticalSlot {
  readonly depth: number;
  readonly lateral: number;
}

/** O que o atleta quer fazer neste passo (definido pelo usuário ou pela IA). */
export interface PlayerIntent {
  move: Vec2;
  sprint: boolean;
}

export interface PlayerState {
  readonly id: string;
  readonly team: TeamSide;
  readonly role: PlayerRole;
  readonly number: number;
  readonly slot: TacticalSlot;
  pos: Vec2;
  vel: Vec2;
  /** Direção para onde o atleta está virado (sempre unitária). */
  facing: Vec2;
  intent: PlayerIntent;
  kickLockout: number;
  tackleCooldown: number;
  stun: number;
  lunge: number;
  protection: number;
  aiTimer: number;
  holdTimer: number;
}

export interface BallState {
  pos: Vec2;
  vel: Vec2;
  /** Altura acima do gramado. */
  z: number;
  vz: number;
  ownerId: string | null;
  lastTouch: TeamSide | null;
}

export interface PendingPass {
  receiverId: string;
  target: Vec2;
  ttl: number;
}

export type Score = Readonly<Record<TeamSide, number>>;

export interface MatchState {
  phase: MatchPhase;
  phaseTimer: number;
  /** Tempo restante em segundos. */
  clock: number;
  score: Record<TeamSide, number>;
  players: PlayerState[];
  ball: BallState;
  readonly userTeam: TeamSide;
  controlledId: string | null;
  kickoffTeam: TeamSide;
  pendingPass: PendingPass | null;
  lastScorer: TeamSide | null;
  readonly formations: Readonly<Record<TeamSide, FormationId>>;
}

/** Comandos abstratos do usuário para um passo da simulação. */
export interface ControlCommands {
  /** Direção já normalizada (comprimento 0 ou 1). */
  move: Vec2;
  sprint: boolean;
  shortPass: boolean;
  throughPass: boolean;
  longPass: boolean;
  shoot: boolean;
  switchPlayer: boolean;
  tackle: boolean;
  /** Tecla de desarme mantida pressionada: pressiona o portador. */
  pressure: boolean;
}

export type MatchEvent =
  | { type: 'goal'; scorer: TeamSide }
  | { type: 'kick'; kind: KickKind; team: TeamSide }
  | { type: 'possession'; team: TeamSide | null }
  | { type: 'tackle'; team: TeamSide; success: boolean }
  | { type: 'phase'; phase: MatchPhase }
  | { type: 'controlChanged'; playerId: string };
