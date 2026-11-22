"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** 顶部 2px 滚动进度细线（灵感来自 Scrolltide） */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 34,
    restDelta: 0.001,
  });

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
