import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useTheme } from "@/lib/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Star, ChevronRight, Trophy } from "lucide-react";
import { getNextLevel } from "@/lib/levels";

const LevelComplete = () => {
  const { score, currentLevel, resetGame, setLevel, showLevelSelect } = useSnakeGame();
  const { theme } = useTheme();
  
  const nextLevel = getNextLevel(currentLevel.id);
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-10 transition-colors duration-300"
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)' }}>
      <div className={`p-8 rounded-lg shadow-xl max-w-md w-full text-center transition-all duration-300
                      ${theme === 'dark' 
                        ? 'bg-gray-900 border border-gray-700' 
                        : 'bg-white border border-gray-200'}`}>
        <div className="h-16 w-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
          <Trophy size={28} className="text-primary-foreground" />
        </div>
        
        <h2 className="text-3xl font-bold text-primary mb-2">Level Complete!</h2>
        <p className="text-lg mb-4">
          <span className="font-bold">{currentLevel.name}</span> cleared
        </p>
        
        <div className="flex justify-center mb-4">
          {[1, 2, 3].map((star) => (
            <Star 
              key={star}
              size={24} 
              className={`mx-1 ${score >= currentLevel.foodCount * (star/3) 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-400'}`} 
            />
          ))}
        </div>
        
        <p className="text-xl mb-6">Your score: <span className="font-bold text-primary">{score}</span></p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {nextLevel ? (
            <Button 
              className="px-6 py-2 flex items-center gap-2 bg-primary"
              onClick={() => setLevel(nextLevel.id)}
            >
              Next Level
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              className="px-6 py-2"
              onClick={() => showLevelSelect()}
            >
              Level Select
            </Button>
          )}
          
          <Button 
            variant="outline"
            className="px-6 py-2"
            onClick={() => resetGame()}
          >
            Replay Level
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;