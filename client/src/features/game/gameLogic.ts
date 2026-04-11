import { Player } from '../../types';

export interface TargetAssignment {
  uid: string;
  targetId: string;
  targetCallsign: string;
  taskDescription: string;
}

/**
 * Fisher-Yates shuffle (in-place, returns same array reference).
 */
export function shufflePlayers<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Builds a circular target chain from an ordered list of players.
 * Each player targets the next; the last player targets the first.
 */
export function buildTargetChain(
  players: Pick<Player, 'uid' | 'callsign'>[],
  tasks: string[],
): TargetAssignment[] {
  return players.map((player, index) => {
    const target = players[(index + 1) % players.length];
    return {
      uid: player.uid,
      targetId: target.uid,
      targetCallsign: target.callsign,
      taskDescription: tasks[Math.floor(Math.random() * tasks.length)],
    };
  });
}

/**
 * Determines whether eliminating targetId results in a win for the assassin.
 * A win occurs when the target's target is the assassin (chain collapses to 1).
 */
export function detectWin(targetData: Pick<Player, 'targetId'>, assassinId: string): boolean {
  return targetData.targetId === assassinId;
}

/**
 * Computes the updates needed when a player is eliminated.
 * Pure computation -- no Firestore I/O.
 */
export function computeEliminationUpdates(
  targetData: Pick<Player, 'targetId' | 'targetCallsign' | 'taskDescription'>,
  assassinId: string,
  assassinKillCount: number,
  eliminatedBy: string,
  incrementKillCount: boolean,
): {
  targetUpdate: Record<string, unknown>;
  assassinUpdate: Record<string, unknown>;
  isWin: boolean;
} {
  const isWin = detectWin(targetData, assassinId);

  const targetUpdate: Record<string, unknown> = {
    status: 'ELIMINATED',
    pendingEliminationBy: null,
    pendingTaskDescription: null,
    eliminatedBy,
    eliminatedAt: Date.now(),
  };

  let assassinUpdate: Record<string, unknown>;

  if (isWin) {
    assassinUpdate = {
      status: 'WINNER',
      targetId: null,
      targetCallsign: null,
      taskDescription: 'VICTORY ACHIEVED',
      ...(incrementKillCount && { killCount: assassinKillCount + 1 }),
    };
  } else {
    assassinUpdate = {
      targetId: targetData.targetId,
      targetCallsign: targetData.targetCallsign,
      taskDescription: targetData.taskDescription,
      ...(incrementKillCount && { killCount: assassinKillCount + 1 }),
    };
  }

  return { targetUpdate, assassinUpdate, isWin };
}
