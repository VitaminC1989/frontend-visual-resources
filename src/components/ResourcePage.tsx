"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import { CATEGORIES, CATEGORY_META, LAST_UPDATED, RESOURCES, SOURCES, type Resource } from "@/data/resources";
import { SORT_MODES, matches, pad2, sortResources, toTerms, type Filter, type SortMode } from "@/lib/filter";
import { setViewMode, toggleSavedUrl, useSavedUrls, useViewMode } from "@/lib/storage";
import { BrandMark } from "./BrandMark";
import { FilterChips } from "./FilterChips";
import { ResourceCard } from "./ResourceCard";
import { RollingNumber } from "./RollingNumber";
import { StatusToast, type ToastItem } from "./StatusToast";
import { ThemeToggle } from "./ThemeToggle";

const REC_COUNT = RESOURCES.filter((r) => r.rec).length;
const EGG_QUERY_RE = /^(彩蛋|egg|surprise|blueprint|线稿)$/i;

const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

export function ResourcePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [active, setActive] = useState<Filter>("全部");
  const [sort, setSort] = useState<SortMode>("group");
  const [firstPaint, setFirstPaint] = useState(true);
  const [stuck, setStuck] = useState(false);
  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [diceSpin, setDiceSpin] = useState(0);

  const savedUrls = useSavedUrls();
  const view = useViewMode();
  const savedSet = useMemo(() => new Set(savedUrls), [savedUrls]);

  const inputRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const toastId = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPicked = useRef<string | null>(null);
  const scrollRaf = useRef<number[]>([]);

  useEffect(() => {
    if (query === debouncedQuery) return;
    const t = setTimeout(() => setDebouncedQuery(query), 60);
    return () => clearTimeout(t);
  }, [query, debouncedQuery]);

  const terms = useMemo(() => toTerms(debouncedQuery), [debouncedQuery]);
  const items = useMemo(
    () => RESOURCES.filter((r) => matches(r, active, terms, savedSet)),
    [active, terms, savedSet],
  );
  const pickedResource = useMemo(
    () => (pickedUrl ? RESOURCES.find((r) => r.url === pickedUrl) ?? null : null),
    [pickedUrl],
  );

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const showToast = useCallback((next: Omit<ToastItem, "id">, durationMs = 2800) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastId.current += 1;
    const id = toastId.current;
    setToast({ ...next, id });
    if (durationMs > 0) {
      toastTimer.current = setTimeout(() => {
        setToast((cur) => (cur?.id === id ? null : cur));
      }, durationMs);
    }
  }, []);

  const clearQuery = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
  }, []);

  const changeFilter = useCallback((f: Filter) => {
    setFirstPaint(false);
    setActive(f);
  }, []);

  const changeSort = useCallback((s: SortMode) => {
    setFirstPaint(false);
    setSort(s);
  }, []);

  const resetAll = useCallback(() => {
    setFirstPaint(false);
    clearQuery();
    setActive("全部");
  }, [clearQuery]);

  const setBlueprintMode = useCallback(
    (next: boolean) => {
      setBlueprint(next);
      if (next) {
        document.documentElement.dataset.blueprint = "true";
        showToast(
          {
            kind: "blueprint",
            text: "✦ 设计稿透视模式已开启（Shift+B 可切换）",
            actionLabel: "退出",
            onAction: () => {
              setBlueprint(false);
              delete document.documentElement.dataset.blueprint;
              showToast({ kind: "blueprint", text: "已退出设计稿透视模式" }, 2000);
            },
          },
          5200,
        );
      } else {
        delete document.documentElement.dataset.blueprint;
        showToast({ kind: "blueprint", text: "已退出设计稿透视模式" }, 2000);
      }
    },
    [showToast],
  );

  const toggleBlueprint = useCallback(() => {
    setBlueprintMode(!blueprint);
  }, [blueprint, setBlueprintMode]);

  const handleBlueprintHint = useCallback(
    (remaining: number) => {
      showToast({ kind: "hint", text: `再点 ${remaining} 次解锁隐藏透视视图` }, 1400);
    },
    [showToast],
  );

  const handleCopy = useCallback(
    (value: string, label: string) => {
      void copyText(value).then((ok) => {
        if (ok) {
          showToast({ kind: "copy", text: `已复制 ${label}` }, 2200);
        }
      });
    },
    [showToast],
  );

  const handleToggleSave = useCallback(
    (r: Resource) => {
      const added = toggleSavedUrl(r.url);
      showToast({ kind: "save", text: added ? `已收藏 ${r.name}` : `已取消收藏 ${r.name}` }, 2000);
      return added;
    },
    [showToast],
  );

  const handleTagClick = useCallback(
    (tag: string) => {
      setFirstPaint(false);
      const normalized = tag.trim().toLowerCase();
      if (query.trim().toLowerCase() === normalized) {
        clearQuery();
        return;
      }
      setQuery(tag);
      setDebouncedQuery(tag);
    },
    [clearQuery, query],
  );

  const pickRandom = useCallback(() => {
    const candidates = RESOURCES.filter((r) => !r.warn);
    const pool =
      candidates.length > 1 && lastPicked.current
        ? candidates.filter((r) => r.url !== lastPicked.current)
        : candidates;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    if (!chosen) return;

    lastPicked.current = chosen.url;
    setFirstPaint(false);
    setDiceSpin((n) => n + 1);

    const visibleNow = items.some((r) => r.url === chosen.url);
    if (!visibleNow) {
      setActive("全部");
      clearQuery();
    }

    setPickedUrl(chosen.url);
    if (pickTimer.current) clearTimeout(pickTimer.current);
    pickTimer.current = setTimeout(() => {
      setPickedUrl((cur) => (cur === chosen.url ? null : cur));
    }, 4200);

    showToast(
      {
        kind: "pick",
        text: `✦ 今日灵感：${chosen.name}`,
        actionLabel: "打开 ↗",
        actionHref: chosen.url,
      },
      4600,
    );

    scrollRaf.current.forEach((id) => cancelAnimationFrame(id));
    scrollRaf.current = [];
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(`[data-url="${CSS.escape(chosen.url)}"]`);
        el?.scrollIntoView({
          behavior: reduceMotion() ? "auto" : "smooth",
          block: "center",
        });
      });
      scrollRaf.current.push(r2);
    });
    scrollRaf.current.push(r1);
  }, [clearQuery, items, showToast]);

  // 清理全局 DOM 属性与定时器
  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.blueprint;
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (pickTimer.current) clearTimeout(pickTimer.current);
      scrollRaf.current.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  // 键盘快捷键（保持无闭包过期）
  const keyHandlers = useRef({
    view,
    toast,
    pickedResource,
    pickRandom,
    toggleBlueprint,
    clearQuery,
    dismissToast,
  });
  useEffect(() => {
    keyHandlers.current = {
      view,
      toast,
      pickedResource,
      pickRandom,
      toggleBlueprint,
      clearQuery,
      dismissToast,
    };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const h = keyHandlers.current;
      const input = inputRef.current;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input?.focus();
        return;
      }

      if (e.key === "Escape") {
        if (input && document.activeElement === input) {
          h.clearQuery();
          input.blur();
          return;
        }
        if (h.toast || h.pickedResource) {
          h.dismissToast();
          setPickedUrl(null);
        }
        return;
      }

      if (isTypingTarget(e.target)) return;

      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "/") {
          e.preventDefault();
          input?.focus();
          return;
        }
        const lower = e.key.toLowerCase();
        if (lower === "r" && !e.shiftKey) {
          e.preventDefault();
          h.pickRandom();
          return;
        }
        if (lower === "v" && !e.shiftKey) {
          e.preventDefault();
          setFirstPaint(false);
          setViewMode(h.view === "grid" ? "list" : "grid");
          return;
        }
        if (lower === "b" && e.shiftKey) {
          e.preventDefault();
          h.toggleBlueprint();
          return;
        }
        if (
          e.key === "Enter" &&
          h.pickedResource &&
          !(e.target instanceof HTMLElement && e.target.closest("a, button, input, select, textarea"))
        ) {
          window.open(h.pickedResource.url, "_blank", "noopener,noreferrer");
        }
      }
    };

    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

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
      const card = p?.target instanceof Element ? p.target.closest<HTMLElement>(".card, .row-card") : null;
      if (!p || !card) return;
      const b = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${p.x - b.left}px`);
      card.style.setProperty("--my", `${p.y - b.top}px`);
    });
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  let n = 0;
  const renderCard = (r: Resource) => (
    <ResourceCard
      key={r.url}
      resource={r}
      position={n++}
      terms={terms}
      reveal={firstPaint}
      view={view}
      saved={savedSet.has(r.url)}
      picked={pickedUrl === r.url}
      onToggleSave={handleToggleSave}
      onCopy={handleCopy}
      onTagClick={handleTagClick}
    />
  );

  const sources = Object.values(SOURCES);
  const isEggQuery = EGG_QUERY_RE.test(query.trim());

  return (
    <div className="wrap">
      <div className="page-glow" aria-hidden="true" />

      <div className="topbar">
        <BrandMark
          blueprint={blueprint}
          onProgressHint={handleBlueprintHint}
          onToggleBlueprint={toggleBlueprint}
        />
        <div className="topbar-actions">
          <motion.button
            type="button"
            className="action-btn"
            onClick={pickRandom}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            title="随机推荐一个灵感网站 (快捷键 R)"
          >
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ rotate: diceSpin * 180 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              aria-hidden="true"
            >
              <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
              <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
            </motion.svg>
            <span>随便逛逛</span>
          </motion.button>
          <ThemeToggle />
        </div>
      </div>

      <header className="hero">
        <div>
          <div className="eyebrow">
            <i />
            持续收集 · 更新于 {LAST_UPDATED}
          </div>
          <h1>
            前端视觉资源导航
            <br />
            <em>组件、动效与设计灵感</em>
          </h1>
          <p>
            UI 组件库、动效库和网页灵感画廊合集，每条都附中文简介、价格和出处，支持搜索、一键复制与本地收藏。
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <b><RollingNumber value={RESOURCES.length} pad /></b>
            <span>收录站点</span>
          </div>
          <div className="stat">
            <b><RollingNumber value={CATEGORIES.length} pad /></b>
            <span>精选分类</span>
          </div>
          <button
            type="button"
            className={active === "推荐" ? "stat stat-btn is-active" : "stat stat-btn"}
            onClick={() => changeFilter(active === "推荐" ? "全部" : "推荐")}
            title="点击筛选编辑推荐站点"
          >
            <b><RollingNumber value={REC_COUNT} pad /></b>
            <span>编辑推荐</span>
          </button>
        </div>
      </header>

      <div className={stuck ? "controls stuck" : "controls"} ref={controlsRef}>
        <div className={query ? "searchbox has-q" : "searchbox"}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            className="search"
            type="search"
            placeholder="搜索名称、标签或描述，如：动效、shadcn、免费"
            autoComplete="off"
            aria-label="搜索"
            value={query}
            onChange={(e) => {
              setFirstPaint(false);
              setQuery(e.target.value);
            }}
          />
          <span className="kbd" aria-hidden="true">/</span>
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
          <FilterChips
            active={active}
            savedSet={savedSet}
            onChange={changeFilter}
            reduceMotion={reduceMotion}
          />
          <span className="spacer" />
          <div className="row-tools">
            <div className="view-toggle" role="group" aria-label="视图切换">
              {(["grid", "list"] as const).map((mode) => {
                const isSelected = view === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    className="view-btn"
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (isSelected) return;
                      setFirstPaint(false);
                      setViewMode(mode);
                    }}
                    title={mode === "grid" ? "网格卡片视图 (V)" : "紧凑索引列表视图 (V)"}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="view-mode-pill"
                        className="view-pill"
                        transition={{ type: "spring", stiffness: 520, damping: 36 }}
                      />
                    )}
                    <span className="view-label">
                      {mode === "grid" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="3" width="7" height="7" rx="1.5" />
                          <rect x="3" y="14" width="7" height="7" rx="1.5" />
                          <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                      )}
                      <span>{mode === "grid" ? "网格" : "列表"}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <label className="select" htmlFor="sort">
              <span className="select-lbl">排列方式</span>
              <select id="sort" value={sort} onChange={(e) => changeSort(e.target.value as SortMode)}>
                {SORT_MODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>

            <span className="count">
              共 <RollingNumber value={items.length} /> / {RESOURCES.length} 个
            </span>
          </div>
        </div>
      </div>

      <main onPointerMove={onPointerMove}>
        {!items.length ? (
          isEggQuery ? (
            <div className="empty empty-egg">
              <p className="empty-title">✦ 你发现了一个隐藏入口</p>
              <p>可以切换「设计稿透视模式」，查看页面栅格与卡片坐标；也可以随机抽取今日灵感站点。</p>
              <div className="empty-actions">
                <button type="button" className="empty-primary" onClick={toggleBlueprint}>
                  {blueprint ? "退出透视模式" : "开启设计稿透视模式"}
                </button>
                <button type="button" onClick={pickRandom}>随机抽一个站点</button>
                <button type="button" onClick={resetAll}>清空搜索</button>
              </div>
            </div>
          ) : active === "收藏" && savedUrls.length === 0 && !terms.length ? (
            <div className="empty">
              还没有收藏任何站点，点击卡片右上角的书签图标即可加入收藏。
              <br />
              <button type="button" onClick={() => changeFilter("全部")}>浏览全部站点</button>
            </div>
          ) : (
            <div className="empty">
              没有找到匹配的网站，换个关键词试试。
              <br />
              <button type="button" onClick={resetAll}>清除搜索和筛选</button>
            </div>
          )
        ) : sort === "group" ? (
          CATEGORIES.map((c, gi) => {
            const group = items.filter((r) => r.category === c);
            if (!group.length) return null;
            const meta = CATEGORY_META[c];
            return (
              <section key={c}>
                <h2 className="group">
                  <span className="cat-dot" data-cat={meta.key} aria-hidden="true" />
                  <span className="gi">{pad2(gi + 1)}</span>
                  <span>{c}</span>
                  <span className="ge">{meta.en}</span>
                  <span className="line" />
                  <span className="gn">{group.length} 个</span>
                </h2>
                <div className={view === "list" ? "list-rows" : "grid"}>
                  {group.map(renderCard)}
                </div>
              </section>
            );
          })
        ) : (
          <div className={view === "list" ? "list-rows" : "grid"} style={{ marginTop: 28 }}>
            {sortResources(items, sort).map(renderCard)}
          </div>
        )}
      </main>

      <footer>
        <div>
          最后更新：{LAST_UPDATED} · 价格和数量以各网站当天页面为准 · 出处：
          {sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && "、"}
              <a href={s.url} target="_blank" rel="noopener">{s.label}</a>
            </span>
          ))}
          {" "}· 无追踪、无需登录 · 历史版本：<a href="/v1/">v1（旧版）</a>
        </div>
        <div className="credits">
          样式与动效灵感：设计令牌、卡片与徽章参考 shadcn/ui、Beautiful UI、Rare UI；弹簧微交互参考 beUI；缓动曲线与数值过渡参考 Transitions.dev、motion-prompt；滚动进度与局部细线参考 Scrolltide、Motionin；列表密度与排版参考 Minimal Gallery、Curated、landing.love、CTA.gallery。均为本站收录的资源。
        </div>
        <div className="kbd-bar" aria-hidden="true">
          <span><kbd>/</kbd> 搜索</span>
          <span><kbd>R</kbd> 随机灵感</span>
          <span><kbd>V</kbd> 切换网格/列表</span>
          <span><kbd>Shift</kbd>+<kbd>B</kbd> 设计稿透视（或连点左上角图标 5 次）</span>
        </div>
      </footer>

      <StatusToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
