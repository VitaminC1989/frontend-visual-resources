"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORY_META, SOURCES, type Resource } from "@/data/resources";
import { indexOf, pad2 } from "@/lib/filter";
import type { ViewMode } from "@/lib/storage";
import { Highlight } from "./Highlight";

interface Props {
  resource: Resource;
  /** 在当前列表中的位置，用于首屏交错入场延迟 */
  position: number;
  terms: string[];
  reveal: boolean;
  view: ViewMode;
  saved: boolean;
  picked: boolean;
  onToggleSave: (r: Resource) => boolean;
  onCopy: (value: string, label: string) => void;
  onTagClick: (tag: string) => void;
}

const SPARK_ANGLES = [0, 60, 120, 180, 240, 300];

export function ResourceCard({
  resource: r,
  position,
  terms,
  reveal,
  view,
  saved,
  picked,
  onToggleSave,
  onCopy,
  onTagClick,
}: Props) {
  const src = SOURCES[r.source];
  const catMeta = CATEGORY_META[r.category];
  const host = r.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const initial = r.name.replace(/[^A-Za-z0-9]/g, "")[0] || r.name[0];
  const idxLabel = pad2(indexOf(r) + 1);
  const style = { "--i": Math.min(position, 12) } as CSSProperties;

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cmdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sparkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (urlTimer.current) clearTimeout(urlTimer.current);
      if (cmdTimer.current) clearTimeout(cmdTimer.current);
      if (sparkTimer.current) clearTimeout(sparkTimer.current);
    };
  }, []);

  const handleCopyUrl = () => {
    onCopy(r.url, r.name);
    setCopiedUrl(true);
    if (urlTimer.current) clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(() => setCopiedUrl(false), 1500);
  };

  const handleCopyCmd = () => {
    if (!r.command) return;
    onCopy(r.command, r.command);
    setCopiedCmd(true);
    if (cmdTimer.current) clearTimeout(cmdTimer.current);
    cmdTimer.current = setTimeout(() => setCopiedCmd(false), 1500);
  };

  const handleSave = () => {
    const added = onToggleSave(r);
    if (added) {
      setJustSaved(true);
      if (sparkTimer.current) clearTimeout(sparkTimer.current);
      sparkTimer.current = setTimeout(() => setJustSaved(false), 620);
    } else {
      setJustSaved(false);
    }
  };

  const actionButtons = (
    <div className="card-actions">
      <motion.button
        type="button"
        className={copiedUrl ? "mini-btn is-done" : "mini-btn"}
        onClick={handleCopyUrl}
        whileTap={{ scale: 0.86 }}
        transition={{ type: "spring", stiffness: 520, damping: 28 }}
        aria-label={`复制 ${r.name} 网址`}
        title="复制链接"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copiedUrl ? (
            <motion.svg
              key="check"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <path d="M20 6 9 17l-5-5" />
            </motion.svg>
          ) : (
            <motion.svg
              key="copy"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.14 }}
            >
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      <motion.button
        type="button"
        className={saved ? "mini-btn is-saved" : "mini-btn"}
        onClick={handleSave}
        whileTap={{ scale: 0.82 }}
        transition={{ type: "spring", stiffness: 540, damping: 24 }}
        aria-pressed={saved}
        aria-label={saved ? `取消收藏 ${r.name}` : `收藏 ${r.name}`}
        title={saved ? "取消收藏" : "加入收藏"}
      >
        <AnimatePresence>
          {justSaved && (
            <motion.svg
              key="spark"
              className="save-spark"
              viewBox="0 0 32 32"
              initial={{ scale: 0.5, opacity: 0.95 }}
              animate={{ scale: 1.55, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              {SPARK_ANGLES.map((deg) => (
                <line
                  key={deg}
                  x1="16"
                  y1="3.5"
                  x2="16"
                  y2="7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 16 16)`}
                />
              ))}
            </motion.svg>
          )}
        </AnimatePresence>
        <motion.svg
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ scale: saved ? [1, 1.24, 1] : 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </motion.svg>
      </motion.button>
    </div>
  );

  if (view === "list") {
    return (
      <article
        className={reveal ? "row-card reveal" : "row-card"}
        style={style}
        data-cat={catMeta.key}
        data-url={r.url}
        data-picked={picked ? "true" : undefined}
      >
        <span className="bp-tag" aria-hidden="true">#{idxLabel} · {catMeta.en.toLowerCase()}</span>
        <div className="row-lead">
          <span className="idx">{idxLabel}</span>
          <span className="fav fav-sm" aria-hidden="true">{initial}</span>
          <div className="row-title-wrap">
            <h3>
              <a href={r.url} target="_blank" rel="noopener">
                <Highlight text={r.name} terms={terms} />
                <span className="arr" aria-hidden="true">↗</span>
              </a>
            </h3>
            <div className="url">{host}</div>
          </div>
          {r.warn ? (
            <span className="badge warn">{r.warn}</span>
          ) : r.rec ? (
            <span className="badge rec">★ 推荐</span>
          ) : null}
        </div>

        <div className="row-body">
          <p className="row-desc"><Highlight text={r.desc} terms={terms} /></p>
          <div className="row-sub">
            <div className="tags">
              {r.tags.slice(0, 4).map((t) => {
                const hit = terms.some((w) => t.toLowerCase().includes(w));
                return (
                  <button
                    key={t}
                    type="button"
                    className={hit ? "tag hit" : "tag"}
                    onClick={() => onTagClick(t)}
                    title={`按「${t}」筛选`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <span className="row-price"><b>价格</b><Highlight text={r.price} terms={terms} /></span>
            <span className="row-src">
              <a href={src.url} target="_blank" rel="noopener">{src.label}</a>
            </span>
          </div>
        </div>

        <div className="row-trail">
          {actionButtons}
        </div>
      </article>
    );
  }

  return (
    <article
      className={reveal ? "card reveal" : "card"}
      style={style}
      data-cat={catMeta.key}
      data-url={r.url}
      data-picked={picked ? "true" : undefined}
    >
      <span className="bp-tag" aria-hidden="true">#{idxLabel} · {catMeta.en.toLowerCase()}</span>

      <div className="top">
        <div className="ttl">
          <span className="fav" aria-hidden="true">{initial}</span>
          <div>
            <h3>
              <a href={r.url} target="_blank" rel="noopener">
                <Highlight text={r.name} terms={terms} />
                <span className="arr" aria-hidden="true">↗</span>
              </a>
            </h3>
            <div className="url">{host}</div>
          </div>
        </div>
        <div className="top-right">
          <div className="badges">
            {r.warn ? (
              <span className="badge warn">{r.warn}</span>
            ) : r.rec ? (
              <span className="badge rec">★ 推荐</span>
            ) : null}
            <span className="idx">{idxLabel}</span>
          </div>
          {actionButtons}
        </div>
      </div>

      <p className="desc"><Highlight text={r.desc} terms={terms} /></p>

      {r.note && (
        <div className="note"><Highlight text={r.note} terms={terms} /></div>
      )}

      {r.command && (
        <motion.button
          type="button"
          className={copiedCmd ? "cmd-pill is-done" : "cmd-pill"}
          onClick={handleCopyCmd}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 520, damping: 32 }}
          title="点击复制安装/运行命令"
        >
          <span className="cmd-prompt" aria-hidden="true">$</span>
          <code className="cmd-code"><Highlight text={r.command} terms={terms} /></code>
          <span className="cmd-action">{copiedCmd ? "已复制 ✓" : "复制命令"}</span>
        </motion.button>
      )}

      <div className="tags">
        {r.tags.map((t) => {
          const hit = terms.some((w) => t.toLowerCase().includes(w));
          return (
            <motion.button
              key={t}
              type="button"
              className={hit ? "tag hit" : "tag"}
              onClick={() => onTagClick(t)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 540, damping: 30 }}
              title={`按「${t}」筛选`}
            >
              {t}
            </motion.button>
          );
        })}
      </div>

      <div className="meta">
        <div><b>价格</b><Highlight text={r.price} terms={terms} /></div>
        <div>
          <b>出处</b>
          <a href={src.url} target="_blank" rel="noopener">{src.label} 的帖子</a>
        </div>
      </div>
    </article>
  );
}
