import React, { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle theme toggle - improved to handle system theme
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'system') {
      // If system theme is active, switch to explicitly light or dark
      // based on current system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'light' // If system is dark, switch to light
        : 'dark'  // If system is light, switch to dark
      setTheme(systemTheme)
    }
  }

  // Sunbeam animation variants
  const sunbeamVariants = {
    dark: {
      opacity: 0,
      scale: 0,
      rotate: 0,
    },
    light: {
      opacity: 1,
      scale: 1,
      rotate: 45,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
  }

  // Moon stars animation variants
  const moonStarsVariants = {
    dark: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
    light: {
      opacity: 0,
      x: 10,
      scale: 0.5,
    },
  }

  // Icon animation variants
  const iconVariants = {
    dark: {
      rotate: 40,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
    light: {
      rotate: 0,
    },
  }

  // Prevent hydration issues
  if (!isMounted) {
    return <div className="w-9 h-9" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-full"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : theme === 'light' ? 'dark' : 'system'} theme`}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={theme}
        animate={theme}
        variants={iconVariants}
      >
        {theme === "light" ? (
          <>
            <Sun className="h-5 w-5" />
            {/* Sunbeams */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-primary/90 h-1 w-[2px] origin-center"
                style={{
                  transform: `rotate(${i * 45}deg) translateX(7px)`,
                }}
                initial={theme}
                animate={theme}
                variants={sunbeamVariants}
              />
            ))}
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            {/* Moon stars */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-primary/90 h-[2px] w-[2px] rounded-full"
                style={{
                  top: `${4 + i * 3}px`,
                  right: `${3 + i * 3}px`,
                }}
                initial={theme}
                animate={theme}
                variants={moonStarsVariants}
              />
            ))}
          </>
        )}
      </motion.div>
    </Button>
  )
} 