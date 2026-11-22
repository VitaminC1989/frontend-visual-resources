"use client";

import { useSyncExternalStore } from "react";

export type ViewMode = "grid" | "list";

export const SAVED_KEY = "fvr-saved";
export const VIEW_KEY = "fvr-view";
const STORAGE_EVENT = "fvr-storage";

const EMPTY_SAVED: readonly string[] = [];

let cachedRaw: string | null = null;
let cachedList: readonly string[] = EMPTY_SAVED;

function parseSavedList(raw: string | null): readonly string[] {
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  if (!raw) {
    cachedList = EMPTY_SAVED;
    return cachedList;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      cachedList = parsed;
      return cachedList;
    }
  } catch {}
  cachedList = EMPTY_SAVED;
  return cachedList;
}

function subscribe(callback: () => void) {
  const onChange = () => callback();
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

function getSavedSnapshot(): readonly string[] {
  try {
    return parseSavedList(localStorage.getItem(SAVED_KEY));
  } catch {
    return EMPTY_SAVED;
  }
}

const getSavedServerSnapshot = (): readonly string[] => EMPTY_SAVED;

export function useSavedUrls(): readonly string[] {
  return useSyncExternalStore(subscribe, getSavedSnapshot, getSavedServerSnapshot);
}

export function toggleSavedUrl(url: string): boolean {
  const current = getSavedSnapshot();
  const exists = current.includes(url);
  const next = exists ? current.filter((item) => item !== url) : [...current, url];
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event(STORAGE_EVENT));
  return !exists;
}

function getViewSnapshot(): ViewMode {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

const getViewServerSnapshot = (): ViewMode => "grid";

export function useViewMode(): ViewMode {
  return useSyncExternalStore(subscribe, getViewSnapshot, getViewServerSnapshot);
}

export function setViewMode(mode: ViewMode): void {
  try {
    localStorage.setItem(VIEW_KEY, mode);
  } catch {}
  window.dispatchEvent(new Event(STORAGE_EVENT));
}
