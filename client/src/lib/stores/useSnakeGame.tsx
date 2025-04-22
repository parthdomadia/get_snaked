import { create } from "zustand";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";
import { GRID_SIZE } from "@/lib/constants";
import { useAudio } from "./useAudio";
import { LEVELS, LevelConfig, getNextLevel, getUnlockedLevels, unlockLevel } from "../levels";

// Types
export type GameState = "idle" | "playing" | "paused" | "game_over" | "level_complete" | "level_select";
export type Direction = "up" | "down" | "left" | "right";
export type Position = { x: number; y: number };

// Moving obstacle type with direction and movement properties
export type MovingObstacle = Position & { 
  direction: Direction; 
  moveCounter: number;
  moveFrequency: number; // How many game loops before movement
};

// Helper function to check if two positions are equal
const arePositionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

// Get a random direction
const getRandomDirection = (): Direction => {
  const directions: Direction[] = ["up", "down", "left", "right"];
  return directions[Math.floor(Math.random() * directions.length)];
};

// Calculate move frequency based on obstacle speed (lower = faster movement)
const calculateMoveFrequency = (speed: number): number => {
  if (speed <= 0) return Infinity; // No movement
  
  // Convert speed (0.1-3.0) to move frequency (20-2)
  // Higher speed = lower frequency = more frequent movement
  return Math.max(2, Math.floor(20 / speed));
};

// Interface for the game store
interface SnakeGameState {
  // State
  gameState: GameState;
  snake: Position[];
  food: Position;
  obstacles: MovingObstacle[];
  direction: Direction;
  nextDirection: Direction;
  score: number;
  highScore: number;
  speed: number;
  gridSize: number;
  gameLoopId: number | undefined;
  currentLevel: LevelConfig;
  unlockedLevels: number[];
  foodEaten: number;
  
  // Actions
  initializeGame: () => void;
  startGame: () => void;
  resetGame: () => void;
  moveSnake: (newDirection: Direction) => void;
  gameLoop: () => void;
  placeFood: () => void;
  generateObstacles: () => void;
  moveObstacles: () => void;
  checkCollisions: () => boolean;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  completeLevel: () => void;
  setLevel: (levelId: number) => void;
  isLevelUnlocked: (levelId: number) => boolean;
  showLevelSelect: () => void;
}

export const useSnakeGame = create<SnakeGameState>((set, get) => ({
  // Initial State
  gameState: "idle",
  snake: [{ x: 5, y: 5 }],
  food: { x: 10, y: 10 },
  obstacles: [],
  direction: "right",
  nextDirection: "right",
  score: 0,
  highScore: getLocalStorage("snakeHighScore") || 0,
  speed: LEVELS[0].initialSpeed,
  gridSize: GRID_SIZE,
  gameLoopId: undefined,
  currentLevel: LEVELS[0], // Default to level 1
  unlockedLevels: getUnlockedLevels(),
  foodEaten: 0,
  
  // Actions
  initializeGame: () => {
    set({
      snake: [{ x: 5, y: 5 }],
      food: { x: -1, y: -1 }, // Temporary invalid position
      obstacles: [],
      direction: "right",
      nextDirection: "right",
      score: 0,
      foodEaten: 0,
      gameState: "idle",
      unlockedLevels: getUnlockedLevels()
    });
    
    // Initialize background music
    const { setBackgroundMusic } = useAudio.getState();
    const music = new Audio("/sounds/dungeon-ambient.mp3");
    music.loop = true;
    music.volume = 0.5;
    setBackgroundMusic(music);
    
    // First place food, then generate obstacles to ensure they don't overlap
    get().placeFood();
    get().generateObstacles();
  },
  
  startGame: () => {
    if (get().gameState !== "idle" && get().gameState !== "game_over" && 
        get().gameState !== "level_complete" && get().gameState !== "paused") return;
    
    // Start or resume background music
    const { backgroundMusic, isMuted } = useAudio.getState();
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(e => console.error("Failed to play audio:", e));
    }
    
    set({ gameState: "playing" });
    
    // Start the game loop
    const gameLoopId = window.setInterval(() => {
      get().gameLoop();
    }, 1000 / get().speed);
    
    set({ gameLoopId });
  },
  
  resetGame: () => {
    // Clear the game loop
    const gameLoopId = get().gameLoopId;
    if (gameLoopId !== undefined) {
      window.clearInterval(gameLoopId);
    }
    
    // Reset the game state
    set({
      snake: [{ x: 5, y: 5 }],
      food: { x: -1, y: -1 },
      obstacles: [],
      direction: "right",
      nextDirection: "right",
      score: 0,
      foodEaten: 0,
      gameState: "idle",
      gameLoopId: undefined
    });
    
    // Re-generate food and obstacles
    get().placeFood();
    get().generateObstacles();
  },
  
  moveSnake: (newDirection: Direction) => {
    const { direction } = get();
    
    // Prevent 180-degree turns
    if (
      (direction === "up" && newDirection === "down") ||
      (direction === "down" && newDirection === "up") ||
      (direction === "left" && newDirection === "right") ||
      (direction === "right" && newDirection === "left")
    ) {
      return;
    }
    
    set({ nextDirection: newDirection });
  },
  
  gameLoop: () => {
    const { 
      snake, 
      nextDirection, 
      food, 
      score,
      speed,
      highScore,
      gameState,
      currentLevel,
      foodEaten
    } = get();
    
    if (gameState !== "playing") return;
    
    // Update direction
    set({ direction: nextDirection });
    
    // Move obstacles if speed > 0
    if (currentLevel.obstacleSpeed > 0) {
      get().moveObstacles();
    }
    
    // Move the snake
    const head = { ...snake[0] };
    
    switch (nextDirection) {
      case "up":
        head.y -= 1;
        break;
      case "down":
        head.y += 1;
        break;
      case "left":
        head.x -= 1;
        break;
      case "right":
        head.x += 1;
        break;
    }
    
    // Check for collisions
    if (get().checkCollisions()) {
      get().endGame();
      return;
    }
    
    // Create new snake array with new head
    const newSnake = [head, ...snake];
    
    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
      // Increment score
      const newScore = score + 1;
      const newHighScore = Math.max(newScore, highScore);
      const newFoodEaten = foodEaten + 1;
      
      // Increase speed up to level max
      const newSpeed = Math.min(
        speed + currentLevel.initialSpeed * 0.05,
        currentLevel.maxSpeed
      );
      
      // Save high score
      if (newScore > highScore) {
        setLocalStorage("snakeHighScore", newScore);
      }
      
      // Play success sound
      const { playSuccess } = useAudio.getState();
      playSuccess();
      
      // Set new score and food
      set({ 
        score: newScore,
        highScore: newHighScore,
        speed: newSpeed,
        foodEaten: newFoodEaten,
        food: { x: -1, y: -1 } // Temporary invalid position until placeFood is called
      });
      
      // Update game loop speed
      if (get().gameLoopId) {
        window.clearInterval(get().gameLoopId);
        const newGameLoopId = window.setInterval(() => {
          get().gameLoop();
        }, 1000 / newSpeed);
        set({ gameLoopId: newGameLoopId });
      }
      
      // Place new food
      get().placeFood();
      
      // Check if level is completed
      if (newFoodEaten >= currentLevel.foodCount) {
        get().completeLevel();
      }
    } else {
      // Remove the tail
      newSnake.pop();
    }
    
    set({ snake: newSnake });
  },
  
  placeFood: () => {
    const { snake, obstacles, gridSize } = get();
    
    // Find all available cells
    const availableCells: Position[] = [];
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Check if this position is occupied by snake
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        
        // Check if this position is occupied by obstacle
        const isObstacle = obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
        
        if (!isSnake && !isObstacle) {
          availableCells.push({ x, y });
        }
      }
    }
    
    // Randomly select a cell for food
    if (availableCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      set({ food: availableCells[randomIndex] });
    }
  },
  
  generateObstacles: () => {
    const { snake, food, gridSize, currentLevel } = get();
    const newObstacles: MovingObstacle[] = [];
    
    // Create a safety zone around the initial snake
    const safetyZone = [
      { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 },
      { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
      { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
    ];
    
    // Calculate move frequency for obstacles
    const moveFrequency = calculateMoveFrequency(currentLevel.obstacleSpeed);
    
    // Generate random obstacles
    for (let i = 0; i < currentLevel.obstacleCount; i++) {
      let validPosition = false;
      let position: Position = { x: 0, y: 0 };
      
      // Try to find a valid position
      let attempts = 0;
      while (!validPosition && attempts < 100) {
        attempts++;
        
        // Generate random position
        position = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        };
        
        // Check if position is in safety zone
        const isSafetyZone = safetyZone.some(
          pos => pos.x === position.x && pos.y === position.y
        );
        
        // Check if position is occupied by snake
        const isSnake = snake.some(
          segment => segment.x === position.x && segment.y === position.y
        );
        
        // Check if position is occupied by another obstacle
        const isObstacle = newObstacles.some(
          obstacle => obstacle.x === position.x && obstacle.y === position.y
        );
        
        // Check if position is occupied by food
        const isFood = food.x === position.x && food.y === position.y;
        
        // If position is valid, add it to obstacles
        if (!isSafetyZone && !isSnake && !isObstacle && !isFood) {
          validPosition = true;
          newObstacles.push({
            ...position,
            direction: getRandomDirection(),
            moveCounter: 0,
            moveFrequency: moveFrequency
          });
        }
      }
    }
    
    set({ obstacles: newObstacles });
  },
  
  moveObstacles: () => {
    const { obstacles, snake, food, gridSize } = get();
    const newObstacles = [...obstacles];
    
    newObstacles.forEach((obstacle, index) => {
      // Increment move counter
      obstacle.moveCounter += 1;
      
      // Skip if not time to move yet
      if (obstacle.moveCounter < obstacle.moveFrequency) {
        return;
      }
      
      // Reset counter
      obstacle.moveCounter = 0;
      
      // Calculate new position
      const newPosition = { ...obstacle };
      
      switch (obstacle.direction) {
        case "up":
          newPosition.y = (newPosition.y - 1 + gridSize) % gridSize;
          break;
        case "down":
          newPosition.y = (newPosition.y + 1) % gridSize;
          break;
        case "left":
          newPosition.x = (newPosition.x - 1 + gridSize) % gridSize;
          break;
        case "right":
          newPosition.x = (newPosition.x + 1) % gridSize;
          break;
      }
      
      // Check if the new position collides with snake, food, or other obstacles
      const snakeCollision = snake.some(segment => 
        segment.x === newPosition.x && segment.y === newPosition.y
      );
      
      const foodCollision = food.x === newPosition.x && food.y === newPosition.y;
      
      const obstacleCollision = obstacles.some((otherObstacle, otherIndex) => 
        index !== otherIndex && 
        otherObstacle.x === newPosition.x && 
        otherObstacle.y === newPosition.y
      );
      
      // If collision, change direction instead of moving
      if (snakeCollision || foodCollision || obstacleCollision) {
        newObstacles[index].direction = getRandomDirection();
      } else {
        // Move to new position
        newObstacles[index].x = newPosition.x;
        newObstacles[index].y = newPosition.y;
      }
    });
    
    set({ obstacles: newObstacles });
  },
  
  checkCollisions: () => {
    const { snake, obstacles, gridSize } = get();
    const head = snake[0];
    
    // Check wall collision
    if (
      head.x < 0 || 
      head.x >= gridSize || 
      head.y < 0 || 
      head.y >= gridSize
    ) {
      return true;
    }
    
    // Check collision with self (skip the head)
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return true;
      }
    }
    
    // Check collision with obstacles
    for (const obstacle of obstacles) {
      if (obstacle.x === head.x && obstacle.y === head.y) {
        return true;
      }
    }
    
    return false;
  },
  
  endGame: () => {
    const { gameLoopId } = get();
    
    // Play hit sound
    const { playHit } = useAudio.getState();
    playHit();
    
    // Clear the game loop
    if (gameLoopId) {
      window.clearInterval(gameLoopId);
    }
    
    set({ gameState: "game_over", gameLoopId: undefined });
  },
  
  pauseGame: () => {
    if (get().gameState !== "playing") return;
    
    // Clear the game loop
    const { gameLoopId } = get();
    if (gameLoopId) {
      window.clearInterval(gameLoopId);
    }
    
    // Pause background music
    const { backgroundMusic } = useAudio.getState();
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
    
    set({ gameState: "paused", gameLoopId: undefined });
  },
  
  resumeGame: () => {
    if (get().gameState !== "paused") return;
    
    // Resume background music if not muted
    const { backgroundMusic, isMuted } = useAudio.getState();
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(e => console.error("Failed to play audio:", e));
    }
    
    set({ gameState: "playing" });
    
    // Restart game loop
    const gameLoopId = window.setInterval(() => {
      get().gameLoop();
    }, 1000 / get().speed);
    
    set({ gameLoopId });
  },
  
  completeLevel: () => {
    // Clear the game loop
    const { gameLoopId } = get();
    if (gameLoopId) {
      window.clearInterval(gameLoopId);
    }
    
    const { currentLevel, unlockedLevels } = get();
    const nextLevel = getNextLevel(currentLevel.id);
    
    // Unlock next level if there is one
    if (nextLevel) {
      unlockLevel(nextLevel.id);
      const newUnlockedLevels = getUnlockedLevels();
      set({ unlockedLevels: newUnlockedLevels });
    }
    
    set({ 
      gameState: "level_complete",
      gameLoopId: undefined
    });
  },
  
  setLevel: (levelId: number) => {
    const levelIndex = LEVELS.findIndex(level => level.id === levelId);
    if (levelIndex === -1) return;
    
    // Clear any running game loop
    const { gameLoopId } = get();
    if (gameLoopId) {
      window.clearInterval(gameLoopId);
    }
    
    set({
      currentLevel: LEVELS[levelIndex],
      snake: [{ x: 5, y: 5 }],
      direction: "right",
      nextDirection: "right",
      score: 0,
      foodEaten: 0,
      speed: LEVELS[levelIndex].initialSpeed,
      gameState: "idle",
      gameLoopId: undefined
    });
    
    // Generate new food and obstacles
    get().placeFood();
    get().generateObstacles();
  },
  
  isLevelUnlocked: (levelId: number): boolean => {
    return get().unlockedLevels.includes(levelId);
  },
  
  showLevelSelect: () => {
    // Clear any running game loop
    const { gameLoopId } = get();
    if (gameLoopId) {
      window.clearInterval(gameLoopId);
    }
    
    set({ gameState: "level_select", gameLoopId: undefined });
  }
}));