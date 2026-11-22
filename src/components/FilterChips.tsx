"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { FILTERS, filterCount, type Filter } from "@/lib/filter";

interface Props {
  active: Filter;
  onChange: (f: Filter) => void;
  reduceMotion: () => boolean;
}

/** 分段控制（shadcn Toggle Group 外观 + 滑动背景指示器） */
export function FilterChips({ active, onChange, reduceMotion }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);

  const moveInd = useCallback((animate: boolean) => {
    const b = boxRef.current?.querySelector<HTMLButtonElement>('.chip[aria-pressed="true"]');
    const ind = indRef.current;
    if (!b || !ind) return;
    const shouldAnimate = animate && ind.hasAttribute("data-ready");
    if (!shouldAnimate) ind.style.transition = "none";
    ind.style.width = `${b.offsetWidth}px`;
    ind.style.transform = `translateX(${b.offsetLeft}px)`;
    ind.dataset.ready = "";
    if (!shouldAnimate) {
      void ind.offsetWidth;
      ind.style.transition = "";
    }
  }, []);

  useLayoutEffect(() => {
    moveInd(true);
  }, [active, moveInd]);

  useEffect(() => {
    let alive = true;
    const onResize = () => moveInd(false);
    addEventListener("resize", onResize);
    // 字体加载后按钮宽度会变，需要重新校正滑块
    document.fonts?.ready.then(() => {
      if (alive) moveInd(false);
    });
    return () => {
      alive = false;
      removeEventListener("resize", onResize);
    };
  }, [moveInd]);

  return (
    <div className="chips" ref={boxRef} role="group" aria-label="分类筛选">
      <span className="chip-ind" ref={indRef} />
      {FILTERS.map((c) => (
        <button
          key={c}
          className="chip"
          type="button"
          aria-pressed={c === active}
          onClick={(e) => {
            if (c === active) return;
            e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion() ? "auto" : "smooth" });
            onChange(c);
          }}
        >
          {c}
          <span className="n">{filterCount(c)}</span>
        </button>
      ))}
    </div>
  );
}
