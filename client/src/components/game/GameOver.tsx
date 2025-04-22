import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useTheme } from "@/lib/ThemeProvider";

const GameOver = () => {
  const { score } = useSnakeGame();
  const { theme } = useTheme();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-10 transition-colors duration-300"
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)' }}>
      <div className={`p-8 rounded-lg shadow-xl max-w-sm w-full text-center transition-all duration-300
                      ${theme === 'dark' 
                        ? 'bg-gray-900 border border-gray-700' 
                        : 'bg-white border border-gray-200'}`}>
        <h2 className="text-3xl font-bold text-destructive mb-4">Game Over!</h2>
        <p className="text-xl mb-6">Your score: <span className="font-bold text-primary">{score}</span></p>
        <p className="text-sm text-muted-foreground">Press "Play Again" or spacebar to restart</p>
      </div>
    </div>
  );
};

export default GameOver;
