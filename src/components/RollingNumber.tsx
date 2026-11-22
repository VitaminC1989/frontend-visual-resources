"use client";

import { AnimatePresence, motion } from "motion/react";

interface Props {
  value: number;
  pad?: boolean;
  className?: string;
}

/** 纵滑滚动数字（灵感来自 Transitions.dev / motion-prompt） */
export function RollingNumber({ value, pad = false, className }: Props) {
  const formatted = pad ? String(value).padStart(2, "0") : String(value);
  const chars = formatted.split("");

  return (
    <span className={className ? `rolling-num ${className}` : "rolling-num"} aria-label={formatted}>
      {chars.map((ch, i) => {
        const placeKey = chars.length - 1 - i;
        return (
          <span key={placeKey} className="rolling-slot" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${placeKey}-${ch}`}
                className="rolling-char"
                initial={{ y: "0.75em", opacity: 0 }}
                animate={{ y: "0em", opacity: 1 }}
                exit={{ y: "-0.75em", opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              >
                {ch}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}
