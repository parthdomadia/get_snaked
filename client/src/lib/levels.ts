import { GRID_SIZE } from './constants';

export interface LevelConfig {
  id: number;
  name: string;
  obstacleCount: number;
  obstacleSpeed: number; // 0 = no movement, 1 = slow, 2 = medium, 3 = fast
  foodCount: number;     // Number of food items to eat to clear level
  initialSpeed: number;  // Initial snake speed
  maxSpeed: number;      // Maximum snake speed
  description: string;
}

// Our 10 game levels with increasing difficulty
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Novice Crawler",
    obstacleCount: 5,
    obstacleSpeed: 0,
    foodCount: 10,
    initialSpeed: 8,
    maxSpeed: 16,
    description: "Static obstacles, perfect for beginners"
  },
  {
    id: 2,
    name: "Apprentice",
    obstacleCount: 7,
    obstacleSpeed: 0.2,
    foodCount: 12,
    initialSpeed: 8,
    maxSpeed: 16,
    description: "Obstacles with slight movement"
  },
  {
    id: 3,
    name: "Slither Master",
    obstacleCount: 8,
    obstacleSpeed: 0.4,
    foodCount: 15,
    initialSpeed: 8,
    maxSpeed: 16,
    description: "More obstacles and faster movement"
  },
  {
    id: 4,
    name: "Dungeon Explorer",
    obstacleCount: 10,
    obstacleSpeed: 0.6,
    foodCount: 18,
    initialSpeed: 9,
    maxSpeed: 17,
    description: "Navigate through a crowded dungeon"
  },
  {
    id: 5,
    name: "Shadow Serpent",
    obstacleCount: 12,
    obstacleSpeed: 0.8,
    foodCount: 20,
    initialSpeed: 9,
    maxSpeed: 17,
    description: "Faster obstacles and increased challenge"
  },
  {
    id: 6,
    name: "Venom Stalker",
    obstacleCount: 12,
    obstacleSpeed: 1.0,
    foodCount: 22,
    initialSpeed: 9,
    maxSpeed: 18,
    description: "Obstacles now move at your speed"
  },
  {
    id: 7,
    name: "Dungeon Lord",
    obstacleCount: 14,
    obstacleSpeed: 1.2,
    foodCount: 25,
    initialSpeed: 10,
    maxSpeed: 18,
    description: "A true test of your reflexes"
  },
  {
    id: 8,
    name: "Immortal Coil",
    obstacleCount: 16,
    obstacleSpeed: 1.5,
    foodCount: 28,
    initialSpeed: 10,
    maxSpeed: 19,
    description: "Chaotic obstacle movements"
  },
  {
    id: 9,
    name: "Abyss Diver",
    obstacleCount: 18,
    obstacleSpeed: 1.8,
    foodCount: 30,
    initialSpeed: 10,
    maxSpeed: 20,
    description: "The deep dungeon challenges your skills"
  },
  {
    id: 10,
    name: "Legendary Serpent",
    obstacleCount: 20,
    obstacleSpeed: 2.0,
    foodCount: 35,
    initialSpeed: 11,
    maxSpeed: 22,
    description: "Only legends complete this level"
  }
];

// Helper function to get the next level (if any)
export function getNextLevel(currentLevelId: number): LevelConfig | null {
  const nextLevelIndex = LEVELS.findIndex(level => level.id === currentLevelId) + 1;
  return nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;
}

// Map to store unlocked levels
export const getUnlockedLevels = (): number[] => {
  try {
    const saved = localStorage.getItem('unlockedLevels');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse unlocked levels:', e);
  }
  
  // Default: only level 1 is unlocked initially
  return [1];
};

export const saveUnlockedLevels = (unlockedLevels: number[]): void => {
  try {
    localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
  } catch (e) {
    console.error('Failed to save unlocked levels:', e);
  }
};

export const unlockLevel = (levelId: number): void => {
  const unlockedLevels = getUnlockedLevels();
  if (!unlockedLevels.includes(levelId)) {
    unlockedLevels.push(levelId);
    saveUnlockedLevels(unlockedLevels);
  }
};

export const isLevelUnlocked = (levelId: number): boolean => {
  return getUnlockedLevels().includes(levelId);
};