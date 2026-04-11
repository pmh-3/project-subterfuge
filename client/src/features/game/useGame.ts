import { useState, useEffect, useRef } from 'react';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Game, Player } from '../../types';
import { useGameErrors } from '../../strings';

export const useGame = (gameId: string) => {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if both game and players have loaded at least once
  const gameLoaded = useRef(false);
  const playersLoaded = useRef(false);

  useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    gameLoaded.current = false;
    playersLoaded.current = false;

    const checkLoading = () => {
      if (gameLoaded.current && playersLoaded.current) {
        setLoading(false);
      }
    };

    // Subscribe to Game Document
    const gameRef = doc(db, 'games', gameId);
    const unsubGame = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        setGame(doc.data() as Game);
        gameLoaded.current = true;
        checkLoading();
      } else {
        setError(useGameErrors.OPERATION_NOT_FOUND);
      }
    }, (err) => {
      if (__DEV__) console.error(err);
      setError(useGameErrors.CONNECTION_FAILED);
    });

    // Subscribe to Players Collection
    const playersRef = collection(db, 'games', gameId, 'players');
    const unsubPlayers = onSnapshot(playersRef, (snapshot) => {
      const playersList: Player[] = [];
      snapshot.forEach((doc) => {
        playersList.push(doc.data() as Player);
      });
      setPlayers(playersList);
      playersLoaded.current = true;
      checkLoading();
    }, (err) => {
      if (__DEV__) console.error(err);
    });

    return () => {
      unsubGame();
      unsubPlayers();
    };
  }, [gameId]);

  return { game, players, loading, error };
};
