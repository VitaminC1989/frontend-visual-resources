"use client";

import { useRef } from "react";
import { motion } from "motion/react";

interface Props {
  blueprint: boolean;
  onProgressHint: (remaining: number) => void;
  onToggleBlueprint: () => void;
}

/** 顶栏品牌标识：快速连点 5 次可解锁「设计稿透视」彩蛋 */
export function BrandMark({ blueprint, onProgressHint, onToggleBlueprint }: Props) {
  const clicks = useRef(0);
  const lastClick = useRef(0);

  const handleClick = () => {
    const now = Date.now();
    clicks.current = now - lastClick.current > 2200 ? 1 : clicks.current + 1;
    lastClick.current = now;

    if (clicks.current >= 5) {
      clicks.current = 0;
      onToggleBlueprint();
      return;
    }

    if (!blueprint && (clicks.current === 3 || clicks.current === 4)) {
      onProgressHint(5 - clicks.current);
    }
  };

  return (
    <motion.button
      type="button"
      className={blueprint ? "brand-btn is-blueprint" : "brand-btn"}
      onClick={handleClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 520, damping: 30 }}
      title="前端视觉资源导航"
    >
      <motion.span
        className="logo"
        whileHover={{ rotate: -6, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 450, damping: 22 }}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19 12 5l7 14" />
        </svg>
      </motion.span>
      <span>前端视觉资源导航</span>
      {blueprint && <span className="bp-pill">BLUEPRINT</span>}
    </motion.button>
  );
}
