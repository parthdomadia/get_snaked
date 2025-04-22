import { useEffect, useRef } from "react";
import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useTheme } from "@/lib/ThemeProvider";
import { CELL_SIZE, THEME_COLORS, GRID_SIZE } from "@/lib/constants";

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    gameState, 
    snake, 
    food, 
    obstacles, 
    gridSize,
    direction,
    moveSnake
  } = useSnakeGame();
  const { theme } = useTheme();
  
  // Get colors based on current theme
  const colors = THEME_COLORS[theme];

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      
      switch (e.key) {
        case "ArrowUp":
          if (direction !== "down") moveSnake("up");
          break;
        case "ArrowDown":
          if (direction !== "up") moveSnake("down");
          break;
        case "ArrowLeft":
          if (direction !== "right") moveSnake("left");
          break;
        case "ArrowRight":
          if (direction !== "left") moveSnake("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, direction, moveSnake]);

  // Draw game on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match parent's width
    const parentWidth = canvas.parentElement?.clientWidth || 400;
    canvas.width = parentWidth;
    canvas.height = parentWidth;
    
    // Calculate cell size based on canvas dimensions
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;
    
    // Clear canvas and set background
    ctx.fillStyle = colors.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = colors.GRID_COLOR;
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, canvas.height);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(canvas.width, i * cellHeight);
      ctx.stroke();
    }

    // Helper function to draw rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
      ctx.fill();
    };

    // Draw obstacles
    obstacles.forEach(obstacle => {
      const padding = (1 - CELL_SIZE) * cellWidth;
      drawRoundedRect(
        obstacle.x * cellWidth + padding / 2,
        obstacle.y * cellHeight + padding / 2,
        cellWidth - padding,
        cellHeight - padding,
        cellWidth * 0.2, // Rounded corners
        colors.OBSTACLE_COLOR
      );
    });

    // Draw food (apple) with shadow
    const foodCenterX = (food.x + 0.5) * cellWidth;
    const foodCenterY = (food.y + 0.5) * cellHeight;
    const foodRadius = (cellWidth / 2) * 0.8;
    
    // Shadow
    ctx.beginPath();
    ctx.arc(foodCenterX + 1, foodCenterY + 1, foodRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fill();
    
    // Main food circle
    ctx.beginPath();
    ctx.arc(foodCenterX, foodCenterY, foodRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors.FOOD_COLOR;
    ctx.fill();
    
    // Highlight on food (to give it dimension)
    ctx.beginPath();
    ctx.arc(foodCenterX - foodRadius * 0.3, foodCenterY - foodRadius * 0.3, foodRadius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fill();

    // Draw snake with connected segments
    snake.forEach((segment, index) => {
      const padding = (1 - CELL_SIZE) * cellWidth;
      // Head is a different color than the body
      const segmentColor = index === 0 ? colors.SNAKE_HEAD_COLOR : colors.SNAKE_COLOR;
      
      drawRoundedRect(
        segment.x * cellWidth + padding / 2,
        segment.y * cellHeight + padding / 2,
        cellWidth - padding,
        cellHeight - padding,
        cellWidth * 0.25, // More rounded corners for snake
        segmentColor
      );
      
      // Add eyes to the head
      if (index === 0) {
        // Position of eyes depends on direction
        const eyeSize = cellWidth * 0.12;
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        switch (direction) {
          case "up":
            leftEyeX = (segment.x + 0.3) * cellWidth;
            leftEyeY = (segment.y + 0.3) * cellHeight;
            rightEyeX = (segment.x + 0.7) * cellWidth;
            rightEyeY = (segment.y + 0.3) * cellHeight;
            break;
          case "down":
            leftEyeX = (segment.x + 0.3) * cellWidth;
            leftEyeY = (segment.y + 0.7) * cellHeight;
            rightEyeX = (segment.x + 0.7) * cellWidth;
            rightEyeY = (segment.y + 0.7) * cellHeight;
            break;
          case "left":
            leftEyeX = (segment.x + 0.3) * cellWidth;
            leftEyeY = (segment.y + 0.3) * cellHeight;
            rightEyeX = (segment.x + 0.3) * cellWidth;
            rightEyeY = (segment.y + 0.7) * cellHeight;
            break;
          case "right":
            leftEyeX = (segment.x + 0.7) * cellWidth;
            leftEyeY = (segment.y + 0.3) * cellHeight;
            rightEyeX = (segment.x + 0.7) * cellWidth;
            rightEyeY = (segment.y + 0.7) * cellHeight;
            break;
          default:
            leftEyeX = (segment.x + 0.3) * cellWidth;
            leftEyeY = (segment.y + 0.3) * cellHeight;
            rightEyeX = (segment.x + 0.7) * cellWidth;
            rightEyeY = (segment.y + 0.3) * cellHeight;
        }
        
        // Draw black eye backgrounds
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw white pupils
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(leftEyeX - eyeSize * 0.2, leftEyeY - eyeSize * 0.2, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightEyeX - eyeSize * 0.2, rightEyeY - eyeSize * 0.2, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

  }, [gameState, snake, food, obstacles, gridSize, direction, colors, theme]);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full transition-colors duration-300"
    />
  );
};

export default GameCanvas;
