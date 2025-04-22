import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useTheme } from "@/lib/ThemeProvider";
import { LEVELS } from "@/lib/levels";
import { Button } from "@/components/ui/button";
import { Lock, Trophy, ArrowLeft } from "lucide-react";

const LevelSelect = () => {
  const { unlockedLevels, setLevel, currentLevel } = useSnakeGame();
  const { theme } = useTheme();
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-10 transition-colors duration-300"
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)' }}>
      <div className={`p-8 rounded-lg shadow-xl w-full max-w-3xl text-center transition-all duration-300
                      ${theme === 'dark' 
                        ? 'bg-gray-900 border border-gray-700' 
                        : 'bg-white border border-gray-200'}`}>
        <h2 className="text-3xl font-bold text-primary mb-6">Select Level</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {LEVELS.map((level) => {
            const isUnlocked = unlockedLevels.includes(level.id);
            const isCurrentLevel = currentLevel.id === level.id;
            
            return (
              <div key={level.id} className="flex flex-col">
                <button
                  onClick={() => isUnlocked && setLevel(level.id)}
                  disabled={!isUnlocked}
                  className={`relative p-4 rounded-lg transition-all duration-200 flex flex-col items-center justify-center h-24
                              ${isUnlocked 
                                ? isCurrentLevel
                                  ? theme === 'dark' 
                                    ? 'bg-blue-900/50 border-2 border-blue-500 shadow-lg shadow-blue-500/20' 
                                    : 'bg-blue-100 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
                                  : theme === 'dark'
                                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' 
                                    : 'bg-gray-100 hover:bg-gray-50 border border-gray-300'
                                : theme === 'dark' 
                                  ? 'bg-gray-800/50 border border-gray-700 opacity-75 cursor-not-allowed' 
                                  : 'bg-gray-200/80 border border-gray-300 opacity-75 cursor-not-allowed'
                              }`}
                >
                  <span className="text-lg font-bold mb-1">
                    {level.id}
                  </span>
                  
                  {isUnlocked ? (
                    <span className="text-xs text-center opacity-90">
                      {level.name}
                    </span>
                  ) : (
                    <Lock size={18} className="mt-1 opacity-75" />
                  )}
                  
                  {isCurrentLevel && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                      <Trophy size={12} />
                    </div>
                  )}
                </button>
                
                {isUnlocked ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {level.obstacleSpeed === 0 ? "Static" : "Moving"} obstacles: {level.obstacleCount}
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Locked
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="flex items-center gap-2"
            onClick={() => setLevel(currentLevel.id)}
          >
            <ArrowLeft size={16} />
            Back to Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LevelSelect;