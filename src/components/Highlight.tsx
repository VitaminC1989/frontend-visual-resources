import { Fragment } from "react";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 把文本中命中搜索关键词的部分包上 <mark>（React 自动转义，无 XSS 风险） */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const ordered = [...terms].sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${ordered.map(escapeRegExp).join("|")})`, "gi");
  // split 带捕获组时，奇数下标就是命中的片段
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}
