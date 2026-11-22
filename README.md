# 前端视觉资源导航

前端视觉、UI 组件、动效与落地页灵感网站合集。线上地址：<https://frontend-visual-resources.vercel.app>

基于 [Next.js](https://nextjs.org)（App Router）+ TypeScript 构建，页面在构建时静态预渲染。

## 本地开发

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 生产构建
npm run lint       # ESLint
npm run typecheck  # TypeScript 类型检查
```

## 目录结构

```
src/
  app/
    layout.tsx        # 根布局：元信息、字体、主题初始化脚本
    page.tsx          # 首页：顶栏、标题区、统计、页脚
    globals.css       # 全局样式与设计令牌（浅色/深色）
    icon.svg          # favicon
  components/
    ResourceExplorer.tsx  # 搜索、筛选、排序与列表（客户端组件）
    FilterChips.tsx       # 分段控制筛选 + 滑动指示器
    ResourceCard.tsx      # 资源卡片
    Highlight.tsx         # 搜索关键词高亮
    ThemeToggle.tsx       # 浅色/深色切换
  data/
    resources.ts      # ★ 站点数据：条目、分类、出处、最后更新日期
  lib/
    filter.ts         # 筛选 / 搜索 / 排序逻辑
    theme.ts          # 主题存储键与防闪烁脚本
public/
  v1/index.html       # 旧版页面，访问 /v1/
```

## 新增或修改条目

只需编辑 [`src/data/resources.ts`](src/data/resources.ts)：

- 在 `RESOURCES` 中加一项；`category` 必须是 `CATEGORIES` 之一，`source` 必须是 `SOURCES` 的键（写错会类型报错）。
- `rec: true` 显示「推荐」徽章；`warn: "..."` 显示警示徽章。
- 修改后同步更新 `LAST_UPDATED`（标题区和页脚共用）。

## 预览图

`preview.png`、`preview-mobile-dark.png` 为页面截图。
