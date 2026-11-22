"use client";

import { useEffect } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const sysDark = () => matchMedia("(prefers-color-scheme: dark)");

function isDark() {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : sysDark().matches;
}

function syncTheme() {
  document.documentElement.classList.toggle("dark-mode", isDark());
}

export function ThemeToggle() {
  useEffect(() => {
    syncTheme();
    const mq = sysDark();
    mq.addEventListener("change", syncTheme);
    return () => mq.removeEventListener("change", syncTheme);
  }, []);

  const toggle = () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    syncTheme();
  };

  return (
    <button className="icon-btn" type="button" onClick={toggle} aria-label="切换浅色/深色模式" title="切换浅色/深色模式">
      <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
