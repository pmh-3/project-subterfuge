import { db } from '@/services/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection, writeBatch, getDocs, runTransaction, query, where, arrayRemove } from 'firebase/firestore';
import { Game, Player, PendingElimination } from '@/types';
import { parseGameOrThrow, parsePlayerOrThrow } from '@/types/firestoreParse';
import { generateGameCode } from '@/utils/gameUtils';
import { TASKS } from '@/data/tasks';
import { getTasksFromPacks } from '@/features/tasks/taskService';
import { DifficultySetting } from '@/types/taskPack';
import {
  DEFAULT_AVATAR_ID,
  DEFAULT_MAX_REROLLS,
  DEFAULT_INFINITE_KILL_GOAL,
  MIN_PLAYERS_TO_START,
  MAX_PLAYERS,
} from '@/constants';
import {
  shufflePlayers,
  buildTargetChain,
  computeEliminationUpdates,
  isClassicMode,
  isInfiniteMode,
  computeIndependentKill,
  computeIndependentJoin,
  computeForceRemoveReassignments,
  pickIndependentTarget,
  isGameOver,
} from '@/features/game/gameLogic';
import { serviceErrors } from '@/strings';

/** Resolves available task strings from configured packs, falling back to local TASKS. */
const resolveAvailableTasks = async (gameData: Game): Promise<string[]> => {
  if (gameData.selectedPacks && gameData.selectedPacks.length > 0) {
    const difficulty = (gameData.difficultySetting || 'Mixed') as DifficultySetting;
    const taskObjects = await getTasksFromPacks(gameData.selectedPacks, difficulty);
    if (taskObjects.length > 0) {
      return taskObjects.map(t => t.text);
    }
  }
  return [...TASKS];
};

const pickRandomTask = (tasks: string[]): string =>
  tasks[Math.floor(Math.random() * tasks.length)];

export const createGame = async (hostId: string, hostCallsign: string, pin: string, avatarId?: string): Promise<string> => {
  const gameId = generateGameCode();
  const gameRef = doc(db, 'games', gameId);
  
  // Create Game Doc. Defaults to Infinite (D4) so any bypass of the configure
  // screen (deep link, test, future caller) never yields a silent-Classic game.
  // configure.tsx's handleAuthorize overwrites all of these when the host saves.
  const newGame: Game = {
    id: gameId,
    hostId,
    status: 'LOBBY',
    playerIds: [hostId],
    createdAt: Date.now(),
    selectedPacks: ['basic_training'],
    difficultySetting: 'Easy',
    maxRerolls: DEFAULT_MAX_REROLLS,
    mode: 'INFINITE',
    infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: DEFAULT_INFINITE_KILL_GOAL } },
  };
  
  await setDoc(gameRef, newGame);

  // Add Host as Player
  const playerRef = doc(db, 'games', gameId, 'players', hostId);
  const hostPlayer: Player = {
    uid: hostId,
    callsign: hostCallsign.trim(),
    avatarId: avatarId || DEFAULT_AVATAR_ID,
    status: 'ALIVE',
    emergencyPin: pin,
  };

  await setDoc(playerRef, hostPlayer);
  
  return gameId;
};

export const joinGame = async (gameId: string, playerId: string, callsign: string, pin: string, avatarId?: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    throw new Error(serviceErrors.OPERATION_NOT_FOUND);
  }

  const gameData = parseGameOrThrow(gameSnap.data());

  const playersRef = collection(db, 'games', gameId, 'players');
  const playersSnap = await getDocs(playersRef);
  const players = playersSnap.docs.map(d => ({ id: d.id, data: parsePlayerOrThrow(d.data()) }));

  const existingPlayer = players.find(p => p.data.callsign.toUpperCase() === callsign.toUpperCase());

  if (existingPlayer) {
    if (existingPlayer.data.emergencyPin !== pin) {
      throw new Error(serviceErrors.IDENTITY_ACTIVE_INVALID_CREDENTIALS);
    }

    if (existingPlayer.id !== playerId) {
      await recoverIdentity(gameId, pin, playerId);
    }
    return;
  }

  const canJoin =
    gameData.status === 'LOBBY' ||
    (isInfiniteMode(gameData) && gameData.status === 'ACTIVE');

  if (!canJoin) {
    throw new Error(serviceErrors.OPERATION_ALREADY_IN_PROGRESS);
  }

  if (players.length >= MAX_PLAYERS) {
    throw new Error(serviceErrors.OPERATION_FULL);
  }

  if (gameData.status === 'LOBBY') {
    const playerRef = doc(db, 'games', gameId, 'players', playerId);
    const newPlayer: Player = {
      uid: playerId,
      callsign: callsign.trim(),
      avatarId: avatarId || DEFAULT_AVATAR_ID,
      status: 'ALIVE',
      emergencyPin: pin,
    };

    await setDoc(playerRef, newPlayer);
    await updateDoc(gameRef, { playerIds: arrayUnion(playerId) });
    return;
  }

  const availableTasks = await resolveAvailableTasks(gameData);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) throw new Error(serviceErrors.OPERATION_NOT_FOUND);
    const freshGame = parseGameOrThrow(gameDoc.data());

    if (!isInfiniteMode(freshGame) || freshGame.status !== 'ACTIVE') {
      throw new Error(serviceErrors.OPERATION_ALREADY_IN_PROGRESS);
    }

    const allPlayerDocs = await readPlayersInTransaction(transaction, gameId, freshGame.playerIds);
    if (allPlayerDocs.length >= MAX_PLAYERS) {
      throw new Error(serviceErrors.OPERATION_FULL);
    }

    const allPlayers = allPlayerDocs.map((d) => d.data);
    // Option E: the newcomer simply gets a random target + directive. No existing
    // player's target is disturbed (no anchor/bystander writes).
    const newPlayerFields = computeIndependentJoin(playerId, allPlayers, availableTasks);

    const newPlayerRef = doc(db, 'games', gameId, 'players', playerId);
    transaction.set(newPlayerRef, {
      uid: playerId,
      callsign: callsign.trim(),
      avatarId: avatarId || DEFAULT_AVATAR_ID,
      status: 'ALIVE',
      emergencyPin: pin,
      killCount: 0,
      respawnCount: 0,
      rerollsUsed: 0,
      pendingEliminations: [],
      ...newPlayerFields,
    });

    transaction.update(gameRef, { playerIds: arrayUnion(playerId) });
  });
};

export const startGame = async (gameId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const playersRef = collection(db, 'games', gameId, 'players');
  
  // Fetch game document to get task pack configuration
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) {
    throw new Error(serviceErrors.GAME_NOT_FOUND);
  }
  const gameData = parseGameOrThrow(gameSnap.data());
  
  const playersSnap = await getDocs(playersRef);
  
  if (playersSnap.size < MIN_PLAYERS_TO_START) {
    throw new Error(serviceErrors.NEED_AT_LEAST_2_PLAYERS);
  }

  const players: Player[] = [];
  playersSnap.forEach(d => players.push(parsePlayerOrThrow(d.data())));
  shufflePlayers(players);

  const availableTasks = await resolveAvailableTasks(gameData);
  const assignments = buildTargetChain(players, availableTasks);
  const batch = writeBatch(db);

  const isInfinite = isInfiniteMode(gameData);

  for (const assignment of assignments) {
    const playerRef = doc(db, 'games', gameId, 'players', assignment.uid);
    batch.update(playerRef, {
      targetId: assignment.targetId,
      targetCallsign: assignment.targetCallsign,
      taskDescription: assignment.taskDescription,
      status: 'ALIVE',
      rerollsUsed: 0,
      ...(isInfinite && { killCount: 0, respawnCount: 0 }),
    });
  }

  // Update Game Status
  batch.update(gameRef, { status: 'ACTIVE' });

  await batch.commit();
};

export const challengeTarget = async (gameId: string, targetId: string, assassinId: string) => {
  const gameRef = doc(db, 'games', gameId);
  const assassinRef = doc(db, 'games', gameId, 'players', assassinId);
  const targetRef = doc(db, 'games', gameId, 'players', targetId);

  // Read-modify-write on the target's queue must be transactional so concurrent
  // assassins do not clobber each other's stacked claims.
  await runTransaction(db, async (transaction) => {
    const gameSnap = await transaction.get(gameRef);
    if (!gameSnap.exists()) throw new Error(serviceErrors.GAME_NOT_FOUND);
    const gameData = parseGameOrThrow(gameSnap.data());
    if (gameData.status !== 'ACTIVE') throw new Error(serviceErrors.OPERATION_ALREADY_IN_PROGRESS);

    const assassinSnap = await transaction.get(assassinRef);
    const targetSnap = await transaction.get(targetRef);
    if (!assassinSnap.exists()) throw new Error(serviceErrors.ASSASSIN_NOT_FOUND);
    if (!targetSnap.exists()) throw new Error(serviceErrors.TARGET_NOT_FOUND);

    const assassin = parsePlayerOrThrow(assassinSnap.data());
    const target = parsePlayerOrThrow(targetSnap.data());

    if (assassin.status !== 'ALIVE') throw new Error(serviceErrors.PLAYER_NOT_ALIVE);
    if (target.status !== 'ALIVE') throw new Error(serviceErrors.TARGET_NOT_ALIVE);

    const queue = target.pendingEliminations ?? [];
    // Dedupe: ignore a double-tap from the same assassin.
    if (queue.some((e) => e.assassinId === assassinId)) return;

    const entry: PendingElimination = {
      assassinId,
      assassinCallsign: assassin.callsign,
      taskDescription: assassin.taskDescription ?? '',
      claimedAt: Date.now(),
    };

    transaction.update(targetRef, { pendingEliminations: [...queue, entry] });
  });
};

/**
 * Drop one queued claim without crediting anyone. Resolves the head of the queue
 * (victim's own screen) or a specific entry when `assassinId` is given (host panel).
 * Other queued entries remain.
 */
export const denyElimination = async (gameId: string, targetId: string, assassinId?: string) => {
  const targetRef = doc(db, 'games', gameId, 'players', targetId);

  await runTransaction(db, async (transaction) => {
    const targetSnap = await transaction.get(targetRef);
    if (!targetSnap.exists()) throw new Error(serviceErrors.TARGET_NOT_FOUND);
    const target = parsePlayerOrThrow(targetSnap.data());

    const queue = target.pendingEliminations ?? [];
    if (queue.length === 0) throw new Error(serviceErrors.NO_PENDING_ELIMINATION);

    const entry = assassinId ? queue.find((e) => e.assassinId === assassinId) : queue[0];
    if (!entry) throw new Error(serviceErrors.NO_PENDING_ELIMINATION);

    transaction.update(targetRef, {
      pendingEliminations: queue.filter((e) => e !== entry),
    });
  });
};

type Transaction = Parameters<Parameters<typeof runTransaction>[1]>[0];

const readPlayersInTransaction = async (
  transaction: Transaction,
  gameId: string,
  playerIds: string[],
): Promise<{ id: string; data: Player }[]> => {
  const results: { id: string; data: Player }[] = [];
  for (const pid of playerIds) {
    const ref = doc(db, 'games', gameId, 'players', pid);
    const snap = await transaction.get(ref);
    if (snap.exists()) {
      results.push({ id: pid, data: parsePlayerOrThrow(snap.data()) });
    }
  }
  return results;
};

const applyClassicElimination = (
  transaction: Transaction,
  gameId: string,
  targetRef: ReturnType<typeof doc>,
  targetData: Player,
  assassinId: string,
  assassinRef: ReturnType<typeof doc>,
  assassinKillCount: number,
  eliminatedBy: string,
  incrementKillCount: boolean,
) => {
  const { targetUpdate, assassinUpdate, isWin } = computeEliminationUpdates(
    targetData, assassinId, assassinKillCount, eliminatedBy, incrementKillCount,
  );

  transaction.update(targetRef, targetUpdate);
  transaction.update(assassinRef, assassinUpdate);

  if (isWin) {
    const gameRef = doc(db, 'games', gameId);
    transaction.update(gameRef, { status: 'COMPLETED', winnerId: assassinId });
  }
};

const applyInfiniteElimination = (
  transaction: Transaction,
  gameId: string,
  game: Game,
  targetRef: ReturnType<typeof doc>,
  targetData: Player,
  assassinId: string,
  assassinRef: ReturnType<typeof doc>,
  assassinKillCount: number,
  allPlayerDocs: { id: string; data: Player }[],
  tasks: string[],
  eliminatedBy: string,
  incrementKillCount: boolean,
  remainingQueue: PendingElimination[],
) => {
  const allPlayers = allPlayerDocs.map((d) => d.data);
  const { victimUpdate, assassinUpdate } = computeIndependentKill(
    targetData,
    assassinId,
    assassinKillCount,
    allPlayers,
    tasks,
    eliminatedBy,
    incrementKillCount,
  );

  // Remove only the resolved entry; stacked claims from other assassins remain.
  transaction.update(targetRef, { ...victimUpdate, pendingEliminations: remainingQueue });
  transaction.update(assassinRef, assassinUpdate);

  const playersAfter = allPlayers.map((p) => {
    if (p.uid === targetData.uid) return { ...p, ...victimUpdate, status: 'ALIVE' as const };
    if (p.uid === assassinId) {
      return {
        ...p,
        ...assassinUpdate,
        killCount: incrementKillCount ? assassinKillCount + 1 : p.killCount,
      };
    }
    return p;
  });

  const { over, winnerId } = isGameOver(game, playersAfter);
  if (over && winnerId) {
    const gameRef = doc(db, 'games', gameId);
    transaction.update(gameRef, { status: 'COMPLETED', winnerId });

    for (const { id } of allPlayerDocs) {
      const pRef = doc(db, 'games', gameId, 'players', id);
      if (id === winnerId) {
        transaction.update(pRef, {
          status: 'WINNER',
          targetId: null,
          targetCallsign: null,
          taskDescription: 'VICTORY ACHIEVED',
          pendingEliminations: [],
        });
      } else {
        transaction.update(pRef, {
          status: 'ELIMINATED',
          pendingEliminations: [],
        });
      }
    }
  }
};

export const confirmElimination = async (
  gameId: string,
  targetId: string,
  assassinId?: string,
) => {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) throw new Error(serviceErrors.GAME_NOT_FOUND);
  const availableTasks = await resolveAvailableTasks(parseGameOrThrow(gameSnap.data()));

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) throw new Error(serviceErrors.GAME_NOT_FOUND);
    const game = parseGameOrThrow(gameDoc.data());

    const allPlayerDocs = await readPlayersInTransaction(transaction, gameId, game.playerIds);

    const targetEntry = allPlayerDocs.find((p) => p.id === targetId);
    if (!targetEntry) throw new Error(serviceErrors.TARGET_NOT_FOUND);
    const targetData = targetEntry.data;
    const targetRef = doc(db, 'games', gameId, 'players', targetId);

    // Select the queued claim: a specific assassin's entry (host panel) or the
    // FIFO head (victim's own screen).
    const queue = targetData.pendingEliminations ?? [];
    const pending = assassinId
      ? queue.find((e) => e.assassinId === assassinId)
      : queue[0];
    if (!pending) throw new Error(serviceErrors.NO_PENDING_ELIMINATION);
    const resolvedAssassinId = pending.assassinId;
    const remainingQueue = queue.filter((e) => e !== pending);

    const assassinEntry = allPlayerDocs.find((p) => p.id === resolvedAssassinId);
    if (!assassinEntry) throw new Error(serviceErrors.ASSASSIN_NOT_FOUND);
    const assassinData = assassinEntry.data;
    const assassinRef = doc(db, 'games', gameId, 'players', resolvedAssassinId);

    if (isClassicMode(game)) {
      // Classic holds at most one entry; applyClassicElimination clears the queue.
      applyClassicElimination(
        transaction,
        gameId,
        targetRef,
        targetData,
        resolvedAssassinId,
        assassinRef,
        assassinData.killCount || 0,
        resolvedAssassinId,
        true,
      );
    } else {
      applyInfiniteElimination(
        transaction,
        gameId,
        game,
        targetRef,
        targetData,
        resolvedAssassinId,
        assassinRef,
        assassinData.killCount || 0,
        allPlayerDocs,
        availableTasks,
        resolvedAssassinId,
        true,
        remainingQueue,
      );
    }
  });
};

/**
 * Host "remove without credit" action (D7 / §4g). This is a permanent removal,
 * NOT a kill:
 * - Infinite: the target is marked ELIMINATED permanently (no respawn), their
 *   pending queue is cleared, and every agent who was hunting them is reassigned
 *   a fresh target via pickIndependentTarget (a legitimate, visible change — the
 *   target left the game). Crediting a real catch instead is a separate action:
 *   call confirmElimination(gameId, targetId, assassinId).
 * - Classic: unchanged — the target's hunter inherits (no kill credit).
 */
export const adminForceEliminate = async (gameId: string, targetId: string) => {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) throw new Error(serviceErrors.GAME_NOT_FOUND);
  const game = parseGameOrThrow(gameSnap.data());

  if (isInfiniteMode(game)) {
    await runTransaction(db, async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      const freshGame = parseGameOrThrow(gameDoc.data());
      const allPlayerDocs = await readPlayersInTransaction(transaction, gameId, freshGame.playerIds);

      const targetEntry = allPlayerDocs.find((p) => p.id === targetId);
      if (!targetEntry) throw new Error(serviceErrors.TARGET_NOT_FOUND);
      const targetRef = doc(db, 'games', gameId, 'players', targetId);

      // Permanent removal — no respawn.
      transaction.update(targetRef, {
        status: 'ELIMINATED',
        eliminatedBy: 'ADMIN',
        eliminatedAt: Date.now(),
        pendingEliminations: [],
      });

      // Reassign every ALIVE agent who was targeting the removed player. The pure
      // helper handles the no-eligible-target case (lone survivor at N=2) by
      // clearing the target instead of throwing, so the removal never aborts.
      const reassignments = computeForceRemoveReassignments(
        targetId,
        allPlayerDocs.map((d) => d.data),
      );
      for (const { uid, targetId: newTargetId, targetCallsign } of reassignments) {
        const pRef = doc(db, 'games', gameId, 'players', uid);
        transaction.update(pRef, { targetId: newTargetId, targetCallsign });
      }
    });
    return;
  }

  // --- Classic mode (unchanged) ---
  const playersRef = collection(db, 'games', gameId, 'players');
  const snapshot = await getDocs(playersRef);
  const players = snapshot.docs.map((d) => parsePlayerOrThrow(d.data()));

  const assassin = players.find(
    (p) => p.targetId === targetId && (p.status === 'ALIVE' || p.status === 'PENDING_ELIMINATION'),
  );

  if (!assassin) {
    const targetRef = doc(db, 'games', gameId, 'players', targetId);
    await updateDoc(targetRef, {
      status: 'ELIMINATED',
      eliminatedBy: 'ADMIN',
      eliminatedAt: Date.now(),
    });
    return;
  }

  const assassinId = assassin.uid;

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    const freshGame = parseGameOrThrow(gameDoc.data());

    const allPlayerDocs = await readPlayersInTransaction(transaction, gameId, freshGame.playerIds);

    const targetEntry = allPlayerDocs.find((p) => p.id === targetId);
    if (!targetEntry) throw new Error(serviceErrors.TARGET_NOT_FOUND);
    const targetData = targetEntry.data;
    const targetRef = doc(db, 'games', gameId, 'players', targetId);

    const assassinEntry = allPlayerDocs.find((p) => p.id === assassinId);
    if (!assassinEntry) throw new Error(serviceErrors.ASSASSIN_NOT_FOUND);
    const assassinData = assassinEntry.data;
    const assassinRef = doc(db, 'games', gameId, 'players', assassinId);

    // Infinite is handled by the early return above; this path is classic-only.
    applyClassicElimination(
      transaction,
      gameId,
      targetRef,
      targetData,
      assassinId,
      assassinRef,
      assassinData.killCount || 0,
      'ADMIN',
      false,
    );
  });
};

export const scrambleTask = async (gameId: string, playerId: string) => {
  const gameRef = doc(db, 'games', gameId);
  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  
  const [gameSnap, playerSnap] = await Promise.all([
    getDoc(gameRef),
    getDoc(playerRef)
  ]);
  
  if (!playerSnap.exists()) throw new Error(serviceErrors.PLAYER_NOT_FOUND);
  if (!gameSnap.exists()) throw new Error(serviceErrors.GAME_NOT_FOUND);
  
  const playerData = parsePlayerOrThrow(playerSnap.data());
  const gameData = parseGameOrThrow(gameSnap.data());

  if (playerData.status !== 'ALIVE') {
    throw new Error(serviceErrors.PLAYER_NOT_ALIVE);
  }

  const maxRerolls = gameData.maxRerolls ?? DEFAULT_MAX_REROLLS;
  const currentRerolls = playerData.rerollsUsed || 0;
  
  if (currentRerolls >= maxRerolls) {
    throw new Error(serviceErrors.NO_MORE_SWAPS);
  }

  const availableTasks = await resolveAvailableTasks(gameData);
  const randomTask = pickRandomTask(availableTasks);
  
  await updateDoc(playerRef, {
    taskDescription: randomTask,
    rerollsUsed: currentRerolls + 1
  });
};

/**
 * Swap the caller's TARGET (infinite-only, D2). Shares the same per-game reroll
 * budget as scrambleTask (directive swap) — only the caller's doc changes.
 */
export const swapTarget = async (gameId: string, playerId: string) => {
  const gameRef = doc(db, 'games', gameId);
  const playerRef = doc(db, 'games', gameId, 'players', playerId);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) throw new Error(serviceErrors.GAME_NOT_FOUND);
    const game = parseGameOrThrow(gameDoc.data());

    if (!isInfiniteMode(game)) throw new Error(serviceErrors.TARGET_SWAP_CLASSIC_ONLY);

    const allPlayerDocs = await readPlayersInTransaction(transaction, gameId, game.playerIds);
    const playerEntry = allPlayerDocs.find((p) => p.id === playerId);
    if (!playerEntry) throw new Error(serviceErrors.PLAYER_NOT_FOUND);
    const player = playerEntry.data;

    if (player.status !== 'ALIVE') throw new Error(serviceErrors.PLAYER_NOT_ALIVE);

    const maxRerolls = game.maxRerolls ?? DEFAULT_MAX_REROLLS;
    const currentRerolls = player.rerollsUsed || 0;
    if (currentRerolls >= maxRerolls) throw new Error(serviceErrors.NO_MORE_SWAPS);

    const newTargetId = pickIndependentTarget(
      playerId,
      allPlayerDocs.map((d) => d.data),
      player.targetId ?? undefined,
    );
    const newTarget = allPlayerDocs.find((d) => d.id === newTargetId)?.data;

    transaction.update(playerRef, {
      targetId: newTargetId,
      targetCallsign: newTarget?.callsign ?? '',
      rerollsUsed: currentRerolls + 1,
    });
  });
};

export const recoverIdentity = async (gameId: string, pin: string, newUid: string) => {
  const playersRef = collection(db, 'games', gameId, 'players');
  const q = query(playersRef, where('emergencyPin', '==', pin));
  const snapshot = await getDocs(q);

  if (snapshot.empty) throw new Error(serviceErrors.INVALID_RECOVERY_PIN);
  
  const oldDoc = snapshot.docs[0];
  const oldData = parsePlayerOrThrow(oldDoc.data());
  const oldUid = oldData.uid;

  if (oldUid === newUid) return; // Already recovered

  const allPlayersSnap = await getDocs(playersRef);
  const allPlayers = allPlayersSnap.docs.map(d => parsePlayerOrThrow(d.data()));

  await runTransaction(db, async (transaction) => {
    // CRITICAL: ALL READS MUST COME FIRST
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await transaction.get(gameRef);
    const gameData = parseGameOrThrow(gameDoc.data());
    
    // NOW DO ALL WRITES
    // 1. Delete old player document
    transaction.delete(oldDoc.ref);
    
    // 2. Create new player document with new UID
    const newRef = doc(db, 'games', gameId, 'players', newUid);
    transaction.set(newRef, {
      ...oldData,
      uid: newUid
    });

    // 3. Update game roster
    transaction.update(gameRef, {
      playerIds: arrayRemove(oldUid)
    });
    transaction.update(gameRef, {
      playerIds: arrayUnion(newUid)
    });

    // 4. Update all player references to the old UID
    allPlayers.forEach(p => {
      const pRef = doc(db, 'games', gameId, 'players', p.uid);
      if (p.targetId === oldUid) transaction.update(pRef, { targetId: newUid });
      if (p.eliminatedBy === oldUid) transaction.update(pRef, { eliminatedBy: newUid });
      if ((p.pendingEliminations ?? []).some((e) => e.assassinId === oldUid)) {
        transaction.update(pRef, {
          pendingEliminations: (p.pendingEliminations ?? []).map((e) =>
            e.assassinId === oldUid ? { ...e, assassinId: newUid } : e,
          ),
        });
      }
    });

    // 5. Update game-level references (host/winner)
    if (gameData.hostId === oldUid) transaction.update(gameRef, { hostId: newUid });
    if (gameData.winnerId === oldUid) transaction.update(gameRef, { winnerId: newUid });
  });
};

/**
 * End an infinite game — sets all non-winners to ELIMINATED.
 */
export const endInfiniteGame = async (gameId: string, winnerId?: string | null): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    const game = parseGameOrThrow(gameDoc.data());
    const allPlayerDocs = await readPlayersInTransaction(transaction, gameId, game.playerIds);

    transaction.update(gameRef, {
      status: 'COMPLETED',
      winnerId: winnerId ?? null,
    });

    for (const playerDoc of allPlayerDocs) {
      const pRef = doc(db, 'games', gameId, 'players', playerDoc.id);

      if (winnerId && playerDoc.id === winnerId) {
        transaction.update(pRef, {
          status: 'WINNER',
          targetId: null,
          targetCallsign: null,
          taskDescription: 'VICTORY ACHIEVED',
          pendingEliminations: [],
        });
      } else {
        transaction.update(pRef, {
          status: 'ELIMINATED',
          pendingEliminations: [],
        });
      }
    }
  });
};

const resolveTopKiller = (players: Player[]): { winnerId: string | null } => {
  let maxKills = 0;
  let topKillers: Player[] = [];

  for (const player of players) {
    const kills = player.killCount || 0;
    if (kills > maxKills) {
      maxKills = kills;
      topKillers = [player];
    } else if (kills === maxKills && kills > 0) {
      topKillers.push(player);
    }
  }

  if (topKillers.length === 1 && maxKills > 0) {
    return { winnerId: topKillers[0]!.uid };
  }
  return { winnerId: null };
};

/**
 * End the game early (host override)
 * Winner is determined by highest kill count
 * No winner if tie or all zeros
 */
export const endGame = async (gameId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) throw new Error(serviceErrors.GAME_NOT_FOUND);
  const game = parseGameOrThrow(gameSnap.data());

  const playersRef = collection(db, 'games', gameId, 'players');
  const playersSnap = await getDocs(playersRef);

  const players: Player[] = [];
  playersSnap.forEach((d) => players.push(parsePlayerOrThrow(d.data())));

  if (isInfiniteMode(game)) {
    const { winnerId } = resolveTopKiller(players);
    await endInfiniteGame(gameId, winnerId);
    return;
  }

  const { winnerId } = resolveTopKiller(players);
  const batch = writeBatch(db);

  if (winnerId) {
    const winnerRef = doc(db, 'games', gameId, 'players', winnerId);
    batch.update(winnerRef, {
      status: 'WINNER',
      targetId: null,
      targetCallsign: null,
      taskDescription: 'VICTORY ACHIEVED',
    });
    batch.update(gameRef, { status: 'COMPLETED', winnerId });
  } else {
    batch.update(gameRef, { status: 'COMPLETED', winnerId: null });
  }

  await batch.commit();
};
