import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Get initial theme from localStorage or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = getLocalStorage("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    
    // Check system preference
    if (typeof window !== "undefined" && window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    
    return "light";
  });

  // Update document class when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Save theme to localStorage
    setLocalStorage("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}