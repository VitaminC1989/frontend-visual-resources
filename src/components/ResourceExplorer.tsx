"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { flushSync } from "react-dom";
import { CATEGORIES, RESOURCES } from "@/data/resources";
import { SORT_MODES, matches, pad2, sortResources, toTerms, type Filter, type SortMode } from "@/lib/filter";
import { FilterChips } from "./FilterChips";
import { ResourceCard } from "./ResourceCard";

const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 状态切换：支持 View Transitions 时卡片平滑移位/淡入淡出，否则直接更新 */
function withTransition(fn: () => void) {
  if (document.startViewTransition && !reduceMotion()) {
    document.startViewTransition(() => flushSync(fn));
  } else {
    fn();
  }
}

export function ResourceExplorer() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [active, setActive] = useState<Filter>("全部");
  const [sort, setSort] = useState<SortMode>("group");
  /** 仅首屏卡片播放交错入场动画 */
  const [firstPaint, setFirstPaint] = useState(true);
  const [stuck, setStuck] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  // 输入防抖 60ms
  useEffect(() => {
    if (query === debouncedQuery) return;
    const t = setTimeout(() => setDebouncedQuery(query), 60);
    return () => clearTimeout(t);
  }, [query, debouncedQuery]);

  const terms = useMemo(() => toTerms(debouncedQuery), [debouncedQuery]);
  const items = useMemo(() => RESOURCES.filter((r) => matches(r, active, terms)), [active, terms]);

  const clearQuery = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
  }, []);

  const changeFilter = (f: Filter) => {
    withTransition(() => {
      setFirstPaint(false);
      setActive(f);
    });
  };

  const changeSort = (s: SortMode) => {
    withTransition(() => {
      setFirstPaint(false);
      setSort(s);
    });
  };

  const resetAll = () => {
    withTransition(() => {
      setFirstPaint(false);
      clearQuery();
      setActive("全部");
    });
  };

  // 键盘：「/」聚焦搜索，Esc 清空并失焦
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const input = inputRef.current;
      if (!input) return;
      if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key === "/" && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
      } else if (e.key === "Escape" && document.activeElement === input) {
        clearQuery();
        input.blur();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [clearQuery]);

  // 控制栏吸顶后显示底边线
  useEffect(() => {
    const el = controlsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setStuck(en.intersectionRatio < 1), {
      threshold: [1],
      rootMargin: "-1px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 聚光灯：记录指针在卡片内的位置（rAF 节流）
  const raf = useRef(0);
  const lastPointer = useRef<{ x: number; y: number; target: EventTarget | null }>(null);
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    lastPointer.current = { x: e.clientX, y: e.clientY, target: e.target };
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const p = lastPointer.current;
      const card = p?.target instanceof Element ? p.target.closest<HTMLElement>(".card") : null;
      if (!p || !card) return;
      const b = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${p.x - b.left}px`);
      card.style.setProperty("--my", `${p.y - b.top}px`);
    });
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  let n = 0;
  const renderCard = (r: (typeof RESOURCES)[number]) => (
    <ResourceCard key={r.url} resource={r} position={n++} terms={terms} reveal={firstPaint} />
  );

  return (
    <>
      <div className={stuck ? "controls stuck" : "controls"} ref={controlsRef}>
        <div className={query ? "searchbox has-q" : "searchbox"}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            className="search"
            type="search"
            placeholder="搜索名称、简介或标签，例如：动效、shadcn、免费"
            autoComplete="off"
            aria-label="搜索"
            value={query}
            onChange={(e) => {
              setFirstPaint(false);
              setQuery(e.target.value);
            }}
          />
          <span className="kbd">/</span>
          <button
            className="clear"
            type="button"
            onClick={() => {
              clearQuery();
              inputRef.current?.focus();
            }}
          >
            清除
          </button>
        </div>
        <div className="row">
          <FilterChips active={active} onChange={changeFilter} reduceMotion={reduceMotion} />
          <span className="spacer" />
          <label className="select" htmlFor="sort">
            排列方式
            <select id="sort" value={sort} onChange={(e) => changeSort(e.target.value as SortMode)}>
              {SORT_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
          <span className="count">共 {items.length} / {RESOURCES.length} 个</span>
        </div>
      </div>

      <main onPointerMove={onPointerMove}>
        {!items.length ? (
          <div className="empty">
            没有找到匹配的网站，换个关键词试试。
            <br />
            <button type="button" onClick={resetAll}>清除搜索和筛选</button>
          </div>
        ) : sort === "group" ? (
          CATEGORIES.map((c, gi) => {
            const group = items.filter((r) => r.category === c);
            if (!group.length) return null;
            return (
              <section key={c}>
                <h2 className="group" style={{ viewTransitionName: `g${gi}` }}>
                  <span className="gi">{pad2(gi + 1)}</span>
                  {c}
                  <span className="line" />
                  <span className="gn">{group.length} 个</span>
                </h2>
                <div className="grid">{group.map(renderCard)}</div>
              </section>
            );
          })
        ) : (
          <div className="grid" style={{ marginTop: 28 }}>
            {sortResources(items, sort).map(renderCard)}
          </div>
        )}
      </main>
    </>
  );
}
