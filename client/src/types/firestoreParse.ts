import { Game, Player } from '@/types';
import { TaskPack } from '@/types/taskPack';
import { GameSchema, PlayerSchema, TaskPackSchema } from '@/types/schemas';

function logParseFailure(label: string, error: unknown): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[firestore] Invalid ${label}:`, error);
  }
}

/** Lenient parse for real-time subscriptions — drops invalid documents. */
export function parseGame(data: unknown): Game | null {
  const result = GameSchema.safeParse(data);
  if (!result.success) {
    logParseFailure('Game document', result.error.flatten());
    return null;
  }
  return result.data as Game;
}

/** Lenient parse for real-time subscriptions — drops invalid player docs. */
export function parsePlayer(data: unknown): Player | null {
  const result = PlayerSchema.safeParse(data);
  if (!result.success) {
    logParseFailure('Player document', result.error.flatten());
    return null;
  }
  return result.data as Player;
}

/** Strict parse for service-layer reads inside mutations. */
export function parseGameOrThrow(data: unknown): Game {
  const result = GameSchema.safeParse(data);
  if (!result.success) {
    throw new Error('Invalid game document');
  }
  return result.data as Game;
}

/** Strict parse for service-layer reads inside mutations. */
export function parsePlayerOrThrow(data: unknown): Player {
  const result = PlayerSchema.safeParse(data);
  if (!result.success) {
    throw new Error('Invalid player document');
  }
  return result.data as Player;
}

export function parseTaskPack(data: unknown): TaskPack | null {
  const result = TaskPackSchema.safeParse(data);
  if (!result.success) {
    logParseFailure('TaskPack', result.error.flatten());
    return null;
  }
  return result.data as TaskPack;
}
