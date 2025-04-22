// Game constants
export const GRID_SIZE = 20;
export const INITIAL_SPEED = 8; // Frames per second
export const SPEED_INCREMENT = 0.5; // Speed increase per food
export const MAX_SPEED = 20; // Maximum speed
export const OBSTACLE_COUNT = 10; // Number of obstacles
export const CELL_SIZE = 0.9; // Size of cell from 0 to 1 (for rounded corners)

// Theme colors
export const THEME_COLORS = {
  light: {
    GRID_COLOR: "rgba(0, 0, 0, 0.07)",
    SNAKE_COLOR: "#3B82F6", // Blue
    SNAKE_HEAD_COLOR: "#1D4ED8", // Darker blue
    FOOD_COLOR: "#EF4444", // Red
    OBSTACLE_COLOR: "#6B7280", // Gray
    BACKGROUND_COLOR: "#f8fafc", // Light background
  },
  dark: {
    GRID_COLOR: "rgba(255, 255, 255, 0.07)",
    SNAKE_COLOR: "#60A5FA", // Lighter blue
    SNAKE_HEAD_COLOR: "#3B82F6", // Blue
    FOOD_COLOR: "#F87171", // Lighter red
    OBSTACLE_COLOR: "#9CA3AF", // Lighter gray
    BACKGROUND_COLOR: "#0f172a", // Dark background
  }
};
