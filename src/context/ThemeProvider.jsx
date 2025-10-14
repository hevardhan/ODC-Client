import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = "light", ...props }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove both light and dark classes first
    root.classList.remove("light", "dark")
    
    // Add the current theme class
    if (theme === "dark") {
      root.classList.add("dark")
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme) => {
      setTheme(newTheme)
    }
  }

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
