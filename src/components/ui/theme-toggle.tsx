"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function resolveTheme(): "light" | "dark" {
  const stored = localStorage.getItem("theme") as "light" | "dark" | null;
  if (stored) {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: "light" | "dark") {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return resolveTheme();
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- hydration guard
    const nextTheme = resolveTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
  }

  if (!mounted) {
    return (
      <button
        className="flex h-10 w-10 items-center justify-center border border-line bg-surface text-muted-foreground shadow-card"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        {theme === "dark" ? (
          <Sun className="h-3.5 w-3.5" />
        ) : (
          <Moon className="h-3.5 w-3.5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center border border-line bg-surface text-muted-foreground shadow-card transition hover:border-accent/30 hover:text-foreground"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? (
        <Sun className="h-3.5 w-3.5" />
      ) : (
        <Moon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
