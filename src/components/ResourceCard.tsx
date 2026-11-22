import type { CSSProperties } from "react";
import { SOURCES, type Resource } from "@/data/resources";
import { indexOf, pad2 } from "@/lib/filter";
import { Highlight } from "./Highlight";

interface Props {
  resource: Resource;
  /** 在当前列表中的位置，用于交错入场延迟 */
  position: number;
  terms: string[];
  reveal: boolean;
}

export function ResourceCard({ resource: r, position, terms, reveal }: Props) {
  const src = SOURCES[r.source];
  const host = r.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const initial = r.name.replace(/[^A-Za-z0-9]/g, "")[0] || r.name[0];
  const style = { "--i": position, viewTransitionName: `c${indexOf(r)}` } as CSSProperties;

  return (
    <article className={reveal ? "card reveal" : "card"} style={style}>
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
        <div className="badges">
          {r.warn ? (
            <span className="badge warn">{r.warn}</span>
          ) : r.rec ? (
            <span className="badge rec">★ 推荐</span>
          ) : null}
          <span className="idx">{pad2(indexOf(r) + 1)}</span>
        </div>
      </div>

      <p className="desc"><Highlight text={r.desc} terms={terms} /></p>

      {r.note && (
        <div className="note"><Highlight text={r.note} terms={terms} /></div>
      )}

      <div className="tags">
        {r.tags.map((t) => (
          <span key={t} className={terms.some((w) => t.toLowerCase().includes(w)) ? "tag hit" : "tag"}>{t}</span>
        ))}
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
