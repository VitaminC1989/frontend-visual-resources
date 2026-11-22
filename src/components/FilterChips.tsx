"use client";

import { LayoutGroup, motion } from "motion/react";
import { FILTERS, filterCount, type Filter } from "@/lib/filter";
import { RollingNumber } from "./RollingNumber";

interface Props {
  active: Filter;
  savedSet: ReadonlySet<string>;
  onChange: (f: Filter) => void;
  reduceMotion: () => boolean;
}

/** 分段控制（Motion layoutId 弹簧滑块 + 收藏实时计数） */
export function FilterChips({ active, savedSet, onChange, reduceMotion }: Props) {
  return (
    <div className="chips-wrap">
      <LayoutGroup id="filter-chips">
        <div className="chips" role="group" aria-label="分类筛选">
          {FILTERS.map((c) => {
            const count = filterCount(c, savedSet);
            const isActive = c === active;
            return (
              <motion.button
                key={c}
                className="chip"
                type="button"
                aria-pressed={isActive}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 520, damping: 32 }}
                onClick={(e) => {
                  if (isActive) return;
                  e.currentTarget.scrollIntoView({
                    block: "nearest",
                    inline: "nearest",
                    behavior: reduceMotion() ? "auto" : "smooth",
                  });
                  onChange(c);
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="filter-active-pill"
                    className="chip-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 36, mass: 0.8 }}
                  />
                )}
                <span className="chip-label">
                  {c === "收藏" && (
                    <svg
                      className="chip-ico"
                      viewBox="0 0 24 24"
                      fill={savedSet.size > 0 ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  )}
                  {c}
                  <span className="n">
                    {c === "收藏" ? <RollingNumber value={count} /> : count}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
