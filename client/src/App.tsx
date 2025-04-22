import SnakeGame from "@/components/game/SnakeGame";
import { ThemeProvider } from "@/lib/ThemeProvider";
import "@fontsource/inter";

function App() {
  return (
    <ThemeProvider>
      <div className="w-full h-full flex items-center justify-center bg-background overflow-hidden transition-colors duration-300">
        <SnakeGame />
      </div>
    </ThemeProvider>
  );
}

export default App;
