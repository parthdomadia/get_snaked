import { Button } from "@/components/ui/button";
import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useAudio } from "@/lib/stores/useAudio";
import { useTheme } from "@/lib/ThemeProvider";
import { VolumeX, Volume2, Sun, Moon } from "lucide-react";

const GameControls = () => {
  const { gameState, startGame, resetGame } = useSnakeGame();
  const { isMuted, toggleMute } = useAudio();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
      {gameState === "idle" && (
        <Button 
          className="px-8 py-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={startGame}
        >
          Start Game
        </Button>
      )}
      
      {gameState === "game_over" && (
        <Button 
          className="px-8 py-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={resetGame}
        >
          Play Again
        </Button>
      )}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="px-4 py-2 flex items-center gap-2 transition-colors"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          {isMuted ? "Unmute" : "Mute"}
        </Button>
        
        <Button
          variant="outline"
          className="px-4 py-2 flex items-center gap-2 transition-colors"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>
      
      <div className="mt-4 sm:mt-0 text-sm text-muted-foreground">
        <p>Use arrow keys to move the snake</p>
        <p>Press spacebar to start or restart the game</p>
      </div>
    </div>
  );
};

export default GameControls;
