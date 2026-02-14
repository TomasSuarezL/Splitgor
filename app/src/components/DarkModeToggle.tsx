import * as React from 'react'

export function DarkModeToggle() {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    // Check if the document already has the 'dark' class
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center size-10 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-all duration-300 border border-border"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <span className="text-xl" role="img" aria-label="Sun">☀️</span>
      ) : (
        <span className="text-xl" role="img" aria-label="Moon">🌙</span>
      )}
    </button>
  )
}
