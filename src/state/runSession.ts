export type RunPhase = 'preparation' | 'active' | 'between-waves' | 'victory' | 'defeat';

export interface RunSession {
  readonly id: string;
  readonly startedAt: number;
  phase: RunPhase;
  wave: number;
  baseHealth: number;
  coins: number;
}

/** Run state lives only in memory. A page reload always starts a fresh session. */
export function createRunSession(): RunSession {
  return {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    phase: 'preparation',
    wave: 0,
    baseHealth: 100,
    coins: 450,
  };
}
