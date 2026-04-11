import { db } from '../../services/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection, writeBatch, getDocs, runTransaction, query, where, arrayRemove } from 'firebase/firestore';
import { Game, Player } from '../../types';
import { generateGameCode } from '../../utils/gameUtils';
import { TASKS } from '../../data/tasks';
import { getTasksFromPacks } from '../tasks/taskService';
import { DifficultySetting } from '../../types/taskPack';
import { DEFAULT_AVATAR_ID, DEFAULT_MAX_REROLLS, MIN_PLAYERS_TO_START } from '../../constants';
import { shufflePlayers, buildTargetChain, computeEliminationUpdates } from './gameLogic';
import { serviceErrors } from '../../strings';

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
  
  // Create Game Doc
  const newGame: Game = {
    id: gameId,
    hostId,
    status: 'LOBBY',
    playerIds: [hostId],
    createdAt: Date.now(),
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

  const gameData = gameSnap.data() as Game;

  const playersRef = collection(db, 'games', gameId, 'players');
  const playersSnap = await getDocs(playersRef);
  const players = playersSnap.docs.map(d => ({ id: d.id, data: d.data() as Player }));

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

  if (gameData.status !== 'LOBBY') {
    throw new Error(serviceErrors.OPERATION_ALREADY_IN_PROGRESS);
  }

  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  const newPlayer: Player = {
    uid: playerId,
    callsign: callsign.trim(),
    avatarId: avatarId || DEFAULT_AVATAR_ID,
    status: 'ALIVE',
    emergencyPin: pin,
  };

  await setDoc(playerRef, newPlayer);

  await updateDoc(gameRef, {
    playerIds: arrayUnion(playerId)
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
  const gameData = gameSnap.data() as Game;
  
  const playersSnap = await getDocs(playersRef);
  
  if (playersSnap.size < MIN_PLAYERS_TO_START) {
    throw new Error(serviceErrors.NEED_AT_LEAST_2_PLAYERS);
  }

  const players: Player[] = [];
  playersSnap.forEach(d => players.push(d.data() as Player));
  shufflePlayers(players);

  const availableTasks = await resolveAvailableTasks(gameData);
  const assignments = buildTargetChain(players, availableTasks);
  const batch = writeBatch(db);

  for (const assignment of assignments) {
    const playerRef = doc(db, 'games', gameId, 'players', assignment.uid);
    batch.update(playerRef, {
      targetId: assignment.targetId,
      targetCallsign: assignment.targetCallsign,
      taskDescription: assignment.taskDescription,
      status: 'ALIVE',
      rerollsUsed: 0,
    });
  }

  // Update Game Status
  batch.update(gameRef, { status: 'ACTIVE' });

  await batch.commit();
};

export const challengeTarget = async (gameId: string, targetId: string, assassinId: string) => {
  const assassinRef = doc(db, 'games', gameId, 'players', assassinId);
  const assassinSnap = await getDoc(assassinRef);
  const assassinTask = assassinSnap.exists() ? (assassinSnap.data() as Player).taskDescription : undefined;

  const targetRef = doc(db, 'games', gameId, 'players', targetId);
  await updateDoc(targetRef, {
    pendingEliminationBy: assassinId,
    ...(assassinTask != null && { pendingTaskDescription: assassinTask }),
  });
};

export const denyElimination = async (gameId: string, targetId: string) => {
  const targetRef = doc(db, 'games', gameId, 'players', targetId);
  await updateDoc(targetRef, {
    pendingEliminationBy: null,
    pendingTaskDescription: null
  });
};

/**
 * Applies elimination updates (computed by gameLogic) within a Firestore transaction.
 */
const applyElimination = (
  transaction: Parameters<Parameters<typeof runTransaction>[1]>[0],
  gameId: string,
  targetRef: ReturnType<typeof doc>,
  targetData: Player,
  assassinId: string,
  assassinRef: ReturnType<typeof doc>,
  assassinDoc: { data: () => any },
  eliminatedBy: string,
  incrementKillCount: boolean,
) => {
  const { targetUpdate, assassinUpdate, isWin } = computeEliminationUpdates(
    targetData, assassinId, assassinDoc.data()?.killCount || 0, eliminatedBy, incrementKillCount,
  );

  transaction.update(targetRef, targetUpdate);
  transaction.update(assassinRef, assassinUpdate);

  if (isWin) {
    const gameRef = doc(db, 'games', gameId);
    transaction.update(gameRef, { status: 'COMPLETED', winnerId: assassinId });
  }
};

export const confirmElimination = async (gameId: string, targetId: string) => {
  await runTransaction(db, async (transaction) => {
    const targetRef = doc(db, 'games', gameId, 'players', targetId);
    const targetDoc = await transaction.get(targetRef);
    if (!targetDoc.exists()) throw new Error(serviceErrors.TARGET_NOT_FOUND);
    const targetData = targetDoc.data() as Player;

    const assassinId = targetData.pendingEliminationBy;
    if (!assassinId) throw new Error(serviceErrors.NO_PENDING_ELIMINATION);

    const assassinRef = doc(db, 'games', gameId, 'players', assassinId);
    const assassinDoc = await transaction.get(assassinRef);
    if (!assassinDoc.exists()) throw new Error(serviceErrors.ASSASSIN_NOT_FOUND);

    applyElimination(transaction, gameId, targetRef, targetData, assassinId, assassinRef, assassinDoc, assassinId, true);
  });
};

export const adminForceEliminate = async (gameId: string, targetId: string) => {
  const playersRef = collection(db, 'games', gameId, 'players');
  const snapshot = await getDocs(playersRef);
  const players = snapshot.docs.map(d => d.data() as Player);

  const assassin = players.find(p => p.targetId === targetId && (p.status === 'ALIVE' || p.status === 'PENDING_ELIMINATION'));

  if (!assassin) {
    const targetRef = doc(db, 'games', gameId, 'players', targetId);
    await updateDoc(targetRef, { 
      status: 'ELIMINATED', 
      eliminatedBy: 'ADMIN',
      eliminatedAt: Date.now()
    });
    return; 
  }

  const assassinId = assassin.uid;

  await runTransaction(db, async (transaction) => {
    const targetRef = doc(db, 'games', gameId, 'players', targetId);
    const targetDoc = await transaction.get(targetRef);
    if (!targetDoc.exists()) throw new Error(serviceErrors.TARGET_NOT_FOUND);
    const targetData = targetDoc.data() as Player;

    const assassinRef = doc(db, 'games', gameId, 'players', assassinId);
    const assassinDoc = await transaction.get(assassinRef);

    applyElimination(transaction, gameId, targetRef, targetData, assassinId, assassinRef, assassinDoc, 'ADMIN', false);
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
  
  const playerData = playerSnap.data() as Player;
  const gameData = gameSnap.data() as Game;
  
  const maxRerolls = gameData.maxRerolls ?? DEFAULT_MAX_REROLLS;
  const currentRerolls = playerData.rerollsUsed || 0;
  
  if (currentRerolls >= maxRerolls) {
    throw new Error(serviceErrors.NO_MORE_OBJECTIVE_CHANGES);
  }

  const availableTasks = await resolveAvailableTasks(gameData);
  const randomTask = pickRandomTask(availableTasks);
  
  await updateDoc(playerRef, {
    taskDescription: randomTask,
    rerollsUsed: currentRerolls + 1
  });
};

export const recoverIdentity = async (gameId: string, pin: string, newUid: string) => {
  const playersRef = collection(db, 'games', gameId, 'players');
  const q = query(playersRef, where('emergencyPin', '==', pin));
  const snapshot = await getDocs(q);

  if (snapshot.empty) throw new Error(serviceErrors.INVALID_RECOVERY_PIN);
  
  const oldDoc = snapshot.docs[0];
  const oldData = oldDoc.data() as Player;
  const oldUid = oldData.uid;

  if (oldUid === newUid) return; // Already recovered

  const allPlayersSnap = await getDocs(playersRef);
  const allPlayers = allPlayersSnap.docs.map(d => d.data() as Player);

  await runTransaction(db, async (transaction) => {
    // CRITICAL: ALL READS MUST COME FIRST
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await transaction.get(gameRef);
    const gameData = gameDoc.data() as Game;
    
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
      if (p.pendingEliminationBy === oldUid) transaction.update(pRef, { pendingEliminationBy: newUid });
    });

    // 5. Update game-level references (host/winner)
    if (gameData.hostId === oldUid) transaction.update(gameRef, { hostId: newUid });
    if (gameData.winnerId === oldUid) transaction.update(gameRef, { winnerId: newUid });
  });
};

/**
 * End the game early (host override)
 * Winner is determined by highest kill count
 * No winner if tie or all zeros
 */
export const endGame = async (gameId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const playersRef = collection(db, 'games', gameId, 'players');
  const playersSnap = await getDocs(playersRef);
  
  const players: Player[] = [];
  playersSnap.forEach(doc => players.push(doc.data() as Player));
  
  // Find player(s) with highest kill count
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
  
  const batch = writeBatch(db);
  
  // Determine winner: only if exactly one player has the most kills and kills > 0
  if (topKillers.length === 1 && maxKills > 0) {
    const winner = topKillers[0];
    
    // Update winner
    const winnerRef = doc(db, 'games', gameId, 'players', winner.uid);
    batch.update(winnerRef, {
      status: 'WINNER',
      targetId: null,
      targetCallsign: null,
      taskDescription: 'VICTORY ACHIEVED',
    });
    
    // Update game with winner
    batch.update(gameRef, {
      status: 'COMPLETED',
      winnerId: winner.uid,
    });
  } else {
    // No clear winner (tie or no kills)
    batch.update(gameRef, {
      status: 'COMPLETED',
      winnerId: null,
    });
  }
  
  await batch.commit();
};
