import { CATEGORIES, RESOURCES, type Category, type Resource } from "@/data/resources";

export const FILTERS = ["全部", ...CATEGORIES, "推荐", "免费", "AI 友好", "收藏"] as const;
export type Filter = (typeof FILTERS)[number];

export const SORT_MODES = [
  { value: "group", label: "按分类分组" },
  { value: "rec", label: "推荐优先" },
  { value: "name", label: "按名称" },
] as const;
export type SortMode = (typeof SORT_MODES)[number]["value"];

/** 每个条目在数据中的原始序号，用作编号 */
const ORDER = new Map(RESOURCES.map((r, i) => [r, i]));
export const indexOf = (r: Resource) => ORDER.get(r) ?? 0;

export const pad2 = (n: number) => String(n).padStart(2, "0");

const isCategory = (f: string): f is Category => (CATEGORIES as readonly string[]).includes(f);

export function inFilter(r: Resource, f: Filter, saved?: ReadonlySet<string>): boolean {
  if (f === "全部") return true;
  if (f === "推荐") return !!r.rec;
  if (f === "收藏") return !!saved?.has(r.url);
  if (isCategory(f)) return r.category === f;
  return r.tags.includes(f);
}

/** 把搜索框内容拆成小写关键词 */
export function toTerms(q: string): string[] {
  return q.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function matches(r: Resource, filter: Filter, terms: string[], saved?: ReadonlySet<string>): boolean {
  if (!inFilter(r, filter, saved)) return false;
  if (!terms.length) return true;
  const hay = [r.name, r.url, r.desc, r.category, r.price, r.note ?? "", r.command ?? "", ...r.tags]
    .join(" ")
    .toLowerCase();
  return terms.every((w) => hay.includes(w));
}

export function sortResources(items: Resource[], mode: Exclude<SortMode, "group">): Resource[] {
  const copy = [...items];
  if (mode === "rec") {
    return copy.sort((a, b) => Number(!!b.rec) - Number(!!a.rec) || Number(!!a.warn) - Number(!!b.warn));
  }
  return copy.sort((a, b) => a.name.localeCompare(b.name, "zh"));
}

export const filterCount = (f: Filter, saved?: ReadonlySet<string>) =>
  f === "收藏" ? (saved?.size ?? 0) : RESOURCES.filter((r) => inFilter(r, f, saved)).length;
