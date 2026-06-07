import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Game, Player } from '@/types';
import { parseGame, parsePlayer } from '@/types/firestoreParse';
import { useGameErrors } from '@/strings';

export const useGame = (gameId: string) => {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const gameLoaded = useRef(false);
  const playersLoaded = useRef(false);

  const retry = useCallback(() => {
    setError(null);
    setGame(null);
    setLoading(true);
    gameLoaded.current = false;
    playersLoaded.current = false;
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    setError(null);
    gameLoaded.current = false;
    playersLoaded.current = false;

    const checkLoading = () => {
      if (gameLoaded.current && playersLoaded.current) {
        setLoading(false);
      }
    };

    const gameRef = doc(db, 'games', gameId);
    const unsubGame = onSnapshot(
      gameRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const parsed = parseGame(snapshot.data());
          setGame(parsed);
          if (!parsed) {
            setError(useGameErrors.CONNECTION_FAILED);
          }
        } else {
          setGame(null);
          setError(useGameErrors.OPERATION_NOT_FOUND);
        }
        gameLoaded.current = true;
        checkLoading();
      },
      (err) => {
        if (__DEV__) console.error(err);
        setError(useGameErrors.CONNECTION_FAILED);
        gameLoaded.current = true;
        setLoading(false);
      },
    );

    const playersRef = collection(db, 'games', gameId, 'players');
    const unsubPlayers = onSnapshot(
      playersRef,
      (snapshot) => {
        const playersList: Player[] = [];
        snapshot.forEach((playerDoc) => {
          const parsed = parsePlayer(playerDoc.data());
          if (parsed) playersList.push(parsed);
        });
        setPlayers(playersList);
        playersLoaded.current = true;
        checkLoading();
      },
      (err) => {
        if (__DEV__) console.error(err);
        setError(useGameErrors.CONNECTION_FAILED);
        playersLoaded.current = true;
        setLoading(false);
      },
    );

    return () => {
      unsubGame();
      unsubPlayers();
    };
  }, [gameId, retryKey]);

  return { game, players, loading, error, retry };
};
