"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/** 统一尊重系统减弱动态效果偏好 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
