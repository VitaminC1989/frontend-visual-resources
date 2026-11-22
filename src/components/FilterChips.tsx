"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { FILTERS, filterCount, type Filter } from "@/lib/filter";

interface Props {
  active: Filter;
  onChange: (f: Filter) => void;
  reduceMotion: () => boolean;
}

/** 分段控制（shadcn Toggle Group 外观 + 滑动背景指示器） */
export function FilterChips({ active, onChange, reduceMotion }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<CSSProperties>({});

  const moveInd = useCallback(() => {
    const b = boxRef.current?.querySelector<HTMLButtonElement>('.chip[aria-pressed="true"]');
    if (!b) return;
    setInd({ width: b.offsetWidth, transform: `translateX(${b.offsetLeft}px)` });
  }, []);

  useLayoutEffect(moveInd, [active, moveInd]);

  useEffect(() => {
    addEventListener("resize", moveInd);
    // 字体加载后按钮宽度会变，需要重新校正滑块
    document.fonts?.ready.then(moveInd);
    return () => removeEventListener("resize", moveInd);
  }, [moveInd]);

  return (
    <div className="chips" ref={boxRef} role="group" aria-label="分类筛选">
      <span className="chip-ind" style={ind} />
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
