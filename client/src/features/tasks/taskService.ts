/**
 * Task Service
 * 
 * Handles fetching task packs from Firestore and seeding initial data
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Task, TaskPack, DifficultySetting, DIFFICULTY_SCALE_MAP } from '../../types/taskPack';
import { taskPackStrings } from '../../strings';

const PACKS_COLLECTION = 'packs';
const MISSIONS_COLLECTION = 'missions';

// Metadata mapping as requested (since description/difficulty are not in DB)
const PACK_METADATA: Record<string, { description: string, difficulty: 'Recruit' | 'Operative' | 'Elite' }> = {
  basic_training: {
    description: taskPackStrings.basic_training_description,
    difficulty: 'Recruit'
  },
  party: {
    description: taskPackStrings.party_description,
    difficulty: 'Operative'
  },
  ice_breaker: {
    description: taskPackStrings.ice_breaker_description,
    difficulty: 'Recruit'
  },
  far_away: {
    description: taskPackStrings.far_away_description,
    difficulty: 'Elite'
  }
};

/**
 * Fetch all available task packs
 */
export const fetchTaskPacks = async (): Promise<TaskPack[]> => {
  // Fetch packs
  const packsRef = collection(db, PACKS_COLLECTION);
  const packsSnap = await getDocs(packsRef);
  
  // Fetch all missions to populate the packs (needed for UI preview/counts)
  const missionsRef = collection(db, MISSIONS_COLLECTION);
  const missionsSnap = await getDocs(missionsRef);
  
  const missionsByPack: Record<string, Task[]> = {};
  
  missionsSnap.forEach(doc => {
    const data = doc.data();
    const packId = data.pack_id;
    if (!missionsByPack[packId]) missionsByPack[packId] = [];
    
    missionsByPack[packId].push({
      id: doc.id,
      text: data.directive,
      difficultyScale: data.difficulty as 1 | 2 | 3
    });
  });
  
  const packs: TaskPack[] = [];
  packsSnap.forEach((doc) => {
    const data = doc.data();
    const packId = doc.id;
    const metadata = PACK_METADATA[packId] || { description: taskPackStrings.fallback_description, difficulty: taskPackStrings.fallback_difficulty };
    
    packs.push({ 
      id: packId, 
      displayName: data.display_name,
      isPremium: data.is_premium,
      description: metadata.description,
      difficulty: metadata.difficulty,
      tasks: missionsByPack[packId] || []
    } as TaskPack);
  });
  
  return packs;
};

/**
 * Get tasks from selected packs, filtered by difficulty
 */
export const getTasksFromPacks = async (
  packIds: string[],
  difficultySetting: DifficultySetting
): Promise<Task[]> => {
  const allowedScales = DIFFICULTY_SCALE_MAP[difficultySetting];
  const allTasks: Task[] = [];
  
  // We can query missions directly without fetching full packs
  for (const packId of packIds) {
    const missionsRef = collection(db, MISSIONS_COLLECTION);
    const q = query(missionsRef, where('pack_id', '==', packId));
    const snapshot = await getDocs(q);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const difficulty = data.difficulty as number;
      
      if (allowedScales.includes(difficulty)) {
        allTasks.push({
          id: doc.id,
          text: data.directive,
          difficultyScale: difficulty as 1 | 2 | 3
        });
      }
    });
  }
  
  return allTasks;
};

