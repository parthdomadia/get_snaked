import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useTheme } from "@/lib/ThemeProvider";

const Scoreboard = () => {
  const { score, highScore } = useSnakeGame();
  const { theme } = useTheme();

  return (
    <div className="w-full flex justify-between">
      <div 
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300
                   ${theme === 'dark' 
                    ? 'bg-gray-800 text-white border border-gray-700' 
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}`}
      >
        <span className="font-medium">Score: </span>
        <span className="font-bold text-primary text-lg">{score}</span>
      </div>
      
      <div 
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300
                   ${theme === 'dark' 
                    ? 'bg-gray-800 text-white border border-gray-700' 
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}`}
      >
        <span className="font-medium">High Score: </span>
        <span className="font-bold text-secondary text-lg">{highScore}</span>
      </div>
    </div>
  );
};

export default Scoreboard;
