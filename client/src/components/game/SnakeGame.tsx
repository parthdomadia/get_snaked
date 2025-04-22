  import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { useTheme } from "@/lib/ThemeProvider";
import GameCanvas from "./GameCanvas";
import GameControls from "./GameControls";
import GameOver from "./GameOver";
import LevelComplete from "./LevelComplete";
import LevelSelect from "./LevelSelect";
import Scoreboard from "./Scoreboard";
import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

const SnakeGame = () => {
  const { 
    gameState, 
    initializeGame, 
    startGame, 
    resetGame, 
    pauseGame, 
    resumeGame,
    showLevelSelect,
    currentLevel 
  } = useSnakeGame();
  const { setHitSound, setSuccessSound } = useAudio();
  const { theme } = useTheme();

  // Initialize sounds
  useEffect(() => {
    // Setup sound effects
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);

    // Initialize the game
    initializeGame();
  }, [setHitSound, setSuccessSound, initializeGame]);

  // Add spacebar control to start/restart game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar to start or restart the game
      if (e.code === 'Space') {
        if (gameState === "idle") {
          startGame();
        } else if (gameState === "game_over") {
          resetGame();
        } else if (gameState === "paused") {
          resumeGame();
        } else if (gameState === "playing") {
          pauseGame();
        }
      }
      
      // Escape key to pause game
      if (e.code === 'Escape') {
        if (gameState === "playing") {
          pauseGame();
        } else if (gameState === "paused") {
          resumeGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, startGame, resetGame, pauseGame, resumeGame]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl p-4 transition-colors duration-300">
      <div className="flex justify-between items-center w-full max-w-2xl mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-primary transition-colors duration-300">
          Snake Game
        </h1>
        
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={showLevelSelect}
        >
          <Layers size={16} />
          <span className="hidden sm:inline">Level Select</span>
          <span className="inline sm:hidden">Levels</span>
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground mb-3 w-full max-w-2xl">
        <span className="font-semibold">Level {currentLevel.id}:</span> {currentLevel.name} - {currentLevel.description}
      </div>
      
      <div className="w-full max-w-2xl mb-3 flex justify-between items-center">
        <Scoreboard />
      </div>
      
      <div 
        className={`relative w-full aspect-square max-w-2xl rounded-lg shadow-xl overflow-hidden transition-all duration-300
                    ${theme === 'dark' 
                      ? 'shadow-blue-500/10 border border-gray-700' 
                      : 'shadow-blue-500/20 border border-gray-200'}`}
      >
        <GameCanvas />
        
        {gameState === "game_over" && <GameOver />}
        {gameState === "level_complete" && <LevelComplete />}
        {gameState === "level_select" && <LevelSelect />}
        
        {gameState === "paused" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10">
            <div className="bg-card p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">Game Paused</h2>
              <p className="text-sm text-muted-foreground mb-4">Press spacebar or resume button to continue</p>
              <Button onClick={resumeGame}>Resume Game</Button>
            </div>
          </div>
        )}
      </div>
      
      <GameControls />
    </div>
  );
};

export default SnakeGame;
