"use client";

import { useEffect, type MouseEvent } from "react";
import { motion } from "motion/react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const sysDark = () => matchMedia("(prefers-color-scheme: dark)");

function isDark() {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : sysDark().matches;
}

function syncTheme() {
  document.documentElement.classList.toggle("dark-mode", isDark());
}

function applyTheme(next: "light" | "dark") {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {}
  syncTheme();
}

export function ThemeToggle() {
  useEffect(() => {
    syncTheme();
    const mq = sysDark();
    mq.addEventListener("change", syncTheme);
    return () => mq.removeEventListener("change", syncTheme);
  }, []);

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = isDark() ? "light" : "dark";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduce) {
      applyTheme(next);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const hasPointer = e.clientX !== 0 || e.clientY !== 0;
    const x = hasPointer ? e.clientX : rect.left + rect.width / 2;
    const y = hasPointer ? e.clientY : rect.top + rect.height / 2;
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const root = document.documentElement;
    root.classList.add("theme-transition");

    const vt = document.startViewTransition(() => applyTheme(next));

    vt.ready
      .then(() => {
        root.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 460,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});

    vt.finished
      .finally(() => {
        root.classList.remove("theme-transition");
      })
      .catch(() => {});
  };

  return (
    <motion.button
      className="icon-btn"
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      aria-label="切换浅色/深色模式"
      title="切换浅色/深色模式"
    >
      <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </motion.button>
  );
}
