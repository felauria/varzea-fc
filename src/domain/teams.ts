import type { FormationId } from './formations';
import type { TeamKit } from './kit';

/** Dados de um clube fictício usados pela partida. */
export interface TeamProfile {
  readonly name: string;
  readonly shortName: string;
  readonly formation: FormationId;
  readonly kit: TeamKit;
  readonly goalkeeperKit: TeamKit;
}

/** Clube do usuário (provisório até existir a criação de carreira e o editor de uniforme). */
export const DEFAULT_USER_TEAM: TeamProfile = {
  name: 'Várzea FC',
  shortName: 'VFC',
  formation: '2-1-1',
  kit: {
    primary: '#1f5fd1',
    secondary: '#f2f2f2',
    detail: '#0d2a66',
    pattern: 'verticalStripes',
    shorts: '#f2f2f2',
    socks: '#1f5fd1',
  },
  goalkeeperKit: {
    primary: '#2fbf71',
    secondary: '#1a7a45',
    detail: '#0f3d22',
    pattern: 'solid',
    shorts: '#1a1a1a',
    socks: '#2fbf71',
  },
};

/** Adversário fictício da primeira fatia jogável. */
export const DEFAULT_OPPONENT_TEAM: TeamProfile = {
  name: 'Unidos do Morro',
  shortName: 'UDM',
  formation: '1-2-1',
  kit: {
    primary: '#d63a2f',
    secondary: '#f5c84c',
    detail: '#6b1410',
    pattern: 'solid',
    shorts: '#2b2b2b',
    socks: '#d63a2f',
  },
  goalkeeperKit: {
    primary: '#8e44ad',
    secondary: '#5b2370',
    detail: '#2e1038',
    pattern: 'solid',
    shorts: '#2b2b2b',
    socks: '#8e44ad',
  },
};
