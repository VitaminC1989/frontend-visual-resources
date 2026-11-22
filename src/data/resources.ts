// ===== 站点数据：新增条目时在 RESOURCES 里加一项即可 =====
// - category 取值必须在 CATEGORIES 中（类型系统会校验）
// - source 取值必须是 SOURCES 的键（类型系统会校验）
// - rec: true 显示「推荐」徽章；warn: 文本会显示警示徽章（优先于推荐）

/** 最后更新日期：页面顶部和页脚共用这一处 */
export const LAST_UPDATED = "2026-11-11";

export const SOURCES = {
  khyssabc: { label: "@khyssabc", url: "https://x.com/khyssabc/status/2120050574410269180" },
  chatgptastra: { label: "@chatgptastra", url: "https://x.com/chatgptastra/status/2120099245697147353" },
  VullnetAdemaj: { label: "@VullnetAdemaj", url: "https://x.com/VullnetAdemaj/status/2120279798090289570" },
} as const satisfies Record<string, { label: string; url: string }>;

export type SourceKey = keyof typeof SOURCES;

export const CATEGORIES = ["组件库", "动效", "灵感画廊", "落地页"] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Resource {
  name: string;
  url: string;
  category: Category;
  desc: string;
  tags: string[];
  price: string;
  note?: string;
  rec?: boolean;
  warn?: string;
  source: SourceKey;
}

export const RESOURCES: Resource[] = [
  {
    name: "shadcn/ui", url: "https://ui.shadcn.com", category: "组件库", rec: true,
    desc: "目前最主流的 React 组件基础库，组件代码直接拷进你的项目、可随意改。很多其他组件库（beUI、Rare UI 等）都用它的 CLI 安装。",
    tags: ["组件库", "React", "Tailwind", "AI 友好", "免费", "开源"],
    price: "免费，MIT 开源（GitHub 约 12.8 万星）",
    note: "支持 npx shadcn 命令安装；官方 MCP 可接入 Claude Code、Cursor、Codex。",
    source: "khyssabc",
  },
  {
    name: "beUI", url: "https://beui.dev", category: "组件库", rec: true,
    desc: "带动效的 React / React Native 组件库，基于 Motion + Tailwind，复制即用；含组件、区块、图表和 AI Agent 界面。",
    tags: ["组件库", "动效", "React", "React Native", "Tailwind", "AI 友好", "免费", "付费"],
    price: "免费版 MIT 可商用；Pro 网页版 $129 起，移动版 $149，单个模板 $39–$99",
    note: "首页标注 157 个 React 组件、73 个 React Native 组件；用 shadcn CLI 安装，Pro 提供 Agent Skill / MCP。",
    source: "khyssabc",
  },
  {
    name: "Rare UI", url: "https://rareui.com", category: "组件库",
    desc: "小众、有辨识度的 React 动画组件合集（如流体光球、OTP 输入），适合做作品集或想让页面显得与众不同。",
    tags: ["组件库", "动效", "React", "AI 友好", "免费", "开源"],
    price: "免费开源",
    note: "首页标注 28+ 个组件，每个组件一个文件；可用 shadcn CLI 或 MCP 安装。",
    source: "khyssabc",
  },
  {
    name: "Beautiful UI", url: "https://beautifului.dev", category: "组件库",
    desc: "专为 AI 产品设计的界面组件：思考过程、流式回答、审批卡片、工具调用、任务状态、对话框、提示输入栏等，可复制代码。",
    tags: ["组件库", "AI 界面", "React", "AI 友好", "免费", "开源"],
    price: "免费，页脚标注 MIT License",
    note: "官网未见具体组件总数或 CLI 安装命令。",
    source: "khyssabc",
  },
  {
    name: "Transitions.dev", url: "https://transitions.dev", category: "动效", rec: true,
    desc: "专注 UI 过渡动画：43+ 个精调过渡效果，加上给 AI 编程助手用的动效 Skill，和能扫描代码库、给动效打分并提 PR 修复的 Motion Agent。",
    tags: ["动效", "React", "Next.js", "AI 友好", "免费", "付费"],
    price: "免费版 $0（核心库 + Skill + 每月 100 积分）；Pro $12/月；Business $59/月（5 席）",
    note: "Skill 支持 Claude Code、Cursor、Codex；Motion Agent 用 npx transitions-agent 运行。",
    source: "khyssabc",
  },
  {
    name: "motion-prompt", url: "https://showheyohtaki.github.io/motion-prompt/", category: "动效", rec: true,
    desc: "192 个有专业名称的动效，每个都有在线演示和可直接复制给 AI 的提示词，解决“跟 AI 说不清想要什么动效”的问题。",
    tags: ["动效", "提示词", "AI 友好", "免费", "开源"],
    price: "免费，MIT 开源（GitHub 约 1.9k 星）",
    note: "可装成 Skill：npx skills add showheyohtaki/motion-prompt；仓库 github.com/showheyohtaki/motion-prompt",
    source: "chatgptastra",
  },
  {
    name: "landing.love", url: "https://www.landing.love/", category: "灵感画廊", rec: true,
    desc: "收录 2267 个网站，每个都录了从顶滚到底的整页视频，另有 11,712 段区块动效片段，看动效和交互最直观。",
    tags: ["灵感画廊", "动效", "落地页", "免费", "付费"],
    price: "浏览免费；Pro $9/月",
    note: "48 个分类。注意要用 https://www 访问，http 地址会报 500。",
    source: "chatgptastra",
  },
  {
    name: "Curated", url: "https://curated.design", category: "灵感画廊", rec: true,
    desc: "约 3000 个真实上线网站和约 3400 个区块页面，可按行业、风格、区块（首屏、定价、页脚等）浏览。",
    tags: ["灵感画廊", "落地页", "AI 友好", "免费", "付费"],
    price: "浏览免费；Pro $9/月（7 天试用）",
    note: "Pro 可导出 design.md，并提供接入 Claude Code / Cursor / Codex 的 MCP。",
    source: "chatgptastra",
  },
  {
    name: "Minimal Gallery", url: "https://minimal.gallery", category: "灵感画廊", rec: true,
    desc: "2013 年起运营，收录 3038 个网站、193 个模板、106 个工具，几乎每天更新；以个人站和作品集为主，适合练排版审美。",
    tags: ["灵感画廊", "作品集", "免费"],
    price: "免费",
    source: "chatgptastra",
  },
  {
    name: "Recent（原 Godly）", url: "https://recent.design", category: "灵感画廊",
    desc: "原 Godly 改名而来，收录 1292 个作品，除网页外还有品牌、动效、插画和海报，适合每天刷一刷。",
    tags: ["灵感画廊", "动效", "品牌", "免费"],
    price: "免费",
    note: "旧地址 godly.website 目前跳转失效（500），请直接访问 recent.design。",
    source: "chatgptastra",
  },
  {
    name: "Landingfolio", url: "https://www.landingfolio.com/", category: "落地页",
    desc: "961 个落地页、4652 个真实区块示例，另有“800+”可复制的 Tailwind / Webflow / Figma 组件，适合直接拿组件改。",
    tags: ["落地页", "灵感画廊", "Tailwind", "Figma", "付费"],
    price: "$49/年，或买断 $249",
    source: "chatgptastra",
  },
  {
    name: "Landingly", url: "https://www.landingly.co/", category: "落地页", warn: "不推荐 / 待观察",
    desc: "落地页灵感和 Figma 模板网站，但首页案例数显示为 0，定价页 404，目前内容不完整。",
    tags: ["落地页", "Figma"],
    price: "未知（定价页打不开）",
    source: "chatgptastra",
  },
  {
    name: "Motionin", url: "https://motionin.design/", category: "动效",
    desc: "54 个可交互网页区块（首屏、作品集、产品展示等），每个都附提示词和规格文件，复制后交给 AI 编程工具即可还原动效。",
    tags: ["动效", "提示词", "AI 友好", "免费", "付费"],
    price: "部分区块免费（首页可见 9 个）；包月 $9（每月解锁 3 个）；买断 $99（官网标注 11 月 15 日后调整为 $149）",
    note: "买断为创始价，库扩充后会上涨。官方条款允许用于客户和商业项目，但提示词本身不可转售或分享。",
    source: "VullnetAdemaj",
  },
  {
    name: "Scrolltide", url: "https://www.scrolltide.co/", category: "动效",
    desc: "滚动驱动的网页模板和 AI 提示词库，首页标注 145 个模板、95 个组件，复制提示词或源码即可用在 React / Next.js 等项目里。",
    tags: ["动效", "落地页", "提示词", "AI 友好", "付费"],
    price: "包月 $39（原价 $59，每周 10 个付费模板额度）；包年 $12/月（$144/年）；买断 $299（原价 $449）",
    note: "包年和买断含 3D 模板、UI 界面、Shader 背景，以及 Claude / Cursor / Codex 的 MCP。",
    source: "VullnetAdemaj",
  },
  {
    name: "Landdding", url: "https://landdding.com/", category: "灵感画廊",
    desc: "每日更新的网站和落地页灵感画廊，首页标注 2.7k 个设计、1.9k 位设计师、40 个分类，覆盖 Webflow、Framer、WordPress 等平台。",
    tags: ["灵感画廊", "落地页", "免费", "付费"],
    price: "浏览免费（有次数限制，信息流含广告）；PRO $4/月，或 $48/年",
    source: "VullnetAdemaj",
  },
  {
    name: "The Internet Designs", url: "https://theinternetdesigns.com/", category: "灵感画廊",
    desc: "从 X 和 Pinterest 精选的 UI 灵感画廊，可按界面、落地页、移动端、仪表盘、动效、品牌和插画等分类浏览。",
    tags: ["灵感画廊", "界面", "落地页", "免费"],
    price: "免费",
    note: "应用截图和创作者目录仍标为即将推出。开源仓库：github.com/iurvish/theinternetdesigns",
    source: "VullnetAdemaj",
  },
  {
    name: "CTA.gallery", url: "https://www.cta.gallery/", category: "灵感画廊",
    desc: "专门收集真实网站行动号召（按钮、表单、弹窗、定价和订阅等）的灵感画廊，站点地图中约有 524 个案例，适合做转化区块时对照。",
    tags: ["灵感画廊", "落地页", "CTA", "免费"],
    price: "免费",
    note: "截图版权归原网站所有，仅供参考。",
    source: "VullnetAdemaj",
  },
  {
    name: "Modulify Templates", url: "https://modulify.ai/templates", category: "落地页",
    desc: "Modulify（AI 建站工具）的可克隆网站模板库，页面上约有 120 个成品站，可预览后一键克隆到后台再改。",
    tags: ["落地页", "模板", "AI 友好", "免费", "付费"],
    price: "模板可免费克隆；Modulify 免费版 $0（一次性 35 积分、1 个站点）；Starter $20/月、Pro $40/月（均为年付价）",
    note: "出处推文作者的自家产品。模板需在 Modulify 里克隆使用，不是可直接拷走的通用前端代码。",
    source: "VullnetAdemaj",
  },
  {
    name: "Wedoflow", url: "https://www.wedoflow.com/", category: "落地页",
    desc: "付费 Webflow 模板商店，全库 216 套模板、1,300+ 个页面，覆盖作品集、机构、SaaS 和商务等品类。",
    tags: ["落地页", "Webflow", "模板", "付费"],
    price: "单套约 $24–$169；全库 All-Access：Basic $69/月，Elite $169/季，Pro $669（页标注年付，同时写 Lifetime / 一次买断，以结算页为准）",
    note: "长期大幅折扣宣传，具体价格以结算页为准。",
    source: "VullnetAdemaj",
  },
  {
    name: "Wonderlist", url: "https://wonderlist.design/", category: "落地页",
    desc: "127 套可在 Figma 中打开的付费网站设计（1,137 个页面），覆盖 SaaS、作品集、机构和咨询等品类，适合直接改稿开发。",
    tags: ["落地页", "Figma", "模板", "付费"],
    price: "买断：Lite $329（25 套 / 212 页）；Pro $599（127 套）；Business $999（3 人授权）",
    source: "VullnetAdemaj",
  },
];
