import { CATEGORIES, LAST_UPDATED, RESOURCES, SOURCES } from "@/data/resources";
import { pad2 } from "@/lib/filter";
import { ResourceExplorer } from "@/components/ResourceExplorer";
import { ThemeToggle } from "@/components/ThemeToggle";

const STATS: [number, string][] = [
  [RESOURCES.length, "个网站"],
  [CATEGORIES.length, "个分类"],
  [RESOURCES.filter((r) => r.rec).length, "个推荐"],
];

export default function Home() {
  const sources = Object.values(SOURCES);

  return (
    <div className="wrap">
      <div className="topbar">
        <div className="brand">
          <span className="logo">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 19 12 5l7 14" />
            </svg>
          </span>
          前端视觉资源导航
        </div>
        <ThemeToggle />
      </div>

      <header className="hero">
        <div>
          <div className="eyebrow"><i />持续收集 · 最后更新 {LAST_UPDATED}</div>
          <h1>前端视觉资源导航<br /><em>组件、动效与灵感</em></h1>
          <p>UI 组件库、动效库和网页灵感画廊合集，每条都附中文简介、价格和出处，可以搜索和按分类筛选。</p>
        </div>
        <div className="stats">
          {STATS.map(([n, label]) => (
            <div className="stat" key={label}><b>{pad2(n)}</b><span>{label}</span></div>
          ))}
        </div>
      </header>

      <ResourceExplorer />

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
          样式与动效灵感：设计令牌和卡片、徽章、输入框、筛选组外观来自 shadcn/ui；卡片细节参考 Rare UI、Beautiful UI、beUI；缓动曲线与状态过渡参考 Transitions.dev；交错入场（Stagger）、聚光灯悬停（Spotlight hover）、悬停抬升（Hover lift）、分段控制滑块（Segmented control）取自 motion-prompt；排版参考 Curated、Minimal Gallery、landing.love。均为本站收录的资源。
        </div>
      </footer>
    </div>
  );
}
