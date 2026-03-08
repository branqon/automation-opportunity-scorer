"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  if (!mounted) {
    return (
      <button
        className="flex items-center justify-center rounded-full border border-line/70 bg-surface px-2.5 py-1.5 text-muted-foreground transition hover:border-accent hover:text-foreground"
        aria-label="Toggle theme"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center rounded-full border border-line/70 bg-surface px-2.5 py-1.5 text-muted-foreground transition hover:border-accent hover:text-foreground"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Sun className="h-3.5 w-3.5" />
      ) : (
        <Moon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
