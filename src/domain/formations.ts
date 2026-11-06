/**
 * Formações do 5 contra 5. O goleiro é fixo e não entra na contagem.
 * Coordenadas táticas: `depth` 0 = próprio gol, 1 = gol adversário;
 * `lateral` -1 = lateral superior, 1 = lateral inferior.
 */
export type FormationId = '2-1-1' | '1-2-1' | '1-1-2';
export type FieldRole = 'def' | 'mid' | 'fwd';

export interface FormationSlot {
  readonly role: FieldRole;
  readonly depth: number;
  readonly lateral: number;
}

export const FORMATIONS: Readonly<Record<FormationId, readonly FormationSlot[]>> = {
  '2-1-1': [
    { role: 'def', depth: 0.18, lateral: -0.45 },
    { role: 'def', depth: 0.18, lateral: 0.45 },
    { role: 'mid', depth: 0.45, lateral: 0 },
    { role: 'fwd', depth: 0.7, lateral: 0 },
  ],
  '1-2-1': [
    { role: 'def', depth: 0.2, lateral: 0 },
    { role: 'mid', depth: 0.42, lateral: -0.5 },
    { role: 'mid', depth: 0.42, lateral: 0.5 },
    { role: 'fwd', depth: 0.7, lateral: 0 },
  ],
  '1-1-2': [
    { role: 'def', depth: 0.2, lateral: 0 },
    { role: 'mid', depth: 0.42, lateral: 0 },
    { role: 'fwd', depth: 0.68, lateral: -0.4 },
    { role: 'fwd', depth: 0.68, lateral: 0.4 },
  ],
};

export const GOALKEEPER_SLOT = { depth: 0.02, lateral: 0 } as const;
