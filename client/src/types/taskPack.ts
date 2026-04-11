/**
 * Task Pack Types
 * 
 * Defines the structure for task packs stored in Firestore
 * Collection: task_library/{packId}
 */

export interface Task {
  id: string;
  text: string;
  difficultyScale: 1 | 2 | 3; // 1 = Easy, 2 = Medium, 3 = Hard
}

export interface TaskPack {
  id: string;
  displayName: string;
  description: string;
  difficulty: 'Recruit' | 'Operative' | 'Elite';
  isPremium: boolean;
  tasks: Task[];
}

export type DifficultySetting = 'Mixed' | 'Easy' | 'Medium' | 'Hard';

// Mapping from DifficultySetting to difficultyScale values
export const DIFFICULTY_SCALE_MAP: Record<DifficultySetting, number[]> = {
  Mixed: [1, 2, 3],
  Easy: [1],
  Medium: [2],
  Hard: [3],
};
