"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import MiniSearch, { type SearchResult } from "minisearch";
import { Search, X } from "lucide-react";

type Doc = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string;
  category: string;
  publishedAt: string;
  cover: string;
};

const FIELDS = ["title", "excerpt", "tags", "category", "body"] as const;
const STORE_FIELDS = ["slug", "title", "excerpt", "category", "cover", "publishedAt"] as const;

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(SearchResult & Doc)[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const indexRef = useRef<MiniSearch<Doc> | null>(null);

  // Cmd/Ctrl + K 全局快捷键 + 自定义事件触发
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpenEvent);
    };
  }, []);

  // 打开时聚焦 + 加载索引
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (indexRef.current) return;
    fetch("/api/search-index")
      .then((r) => r.json())
      .then((docs: Doc[]) => {
        const ms = new MiniSearch<Doc>({
          idField: "slug",
          fields: [...FIELDS],
          storeFields: [...STORE_FIELDS],
          searchOptions: {
            boost: { title: 4, excerpt: 2, tags: 2 },
            prefix: true,
            fuzzy: 0.2,
          },
        });
        ms.addAll(docs);
        indexRef.current = ms;
      })
      .catch(() => {
        // 静默失败：搜索不可用
      });
  }, [open]);

  // 读取最近搜索词
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recent-search");
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // 查询
  useEffect(() => {
    if (!query.trim() || !indexRef.current) {
      setResults([]);
      return;
    }
    const hits = indexRef.current.search(query, { combineWith: "AND" }) as (
      SearchResult & Doc
    )[];
    setResults(hits.slice(0, 12));
  }, [query]);

  const recordRecent = useCallback((q: string) => {
    const next = [q, ...recent.filter((r) => r !== q)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem("recent-search", JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [recent]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const showRecent = useMemo(() => !query.trim() && recent.length > 0, [query, recent]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="搜索"
      className="fixed inset-0 z-50 flex items-start justify-center bg-fg/40 px-4 py-[10vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-2xl overflow-hidden border border-border bg-bg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-5">
          <Search className="h-5 w-5 flex-shrink-0 text-fg-subtle" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、标签、分类…"
            className="w-full bg-transparent py-4 text-base outline-none placeholder:text-fg-subtle"
            aria-label="搜索输入"
          />
          <kbd className="hidden rounded border border-border bg-bg-subtle px-2 py-1 text-[11px] font-semibold text-fg-subtle sm:inline-block">
            ESC
          </kbd>
          <button
            type="button"
            aria-label="关闭"
            onClick={close}
            className="ring-focus rounded-full p-1.5 text-fg-subtle transition hover:bg-bg-subtle hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {showRecent && (
            <div className="px-5 py-4">
              <p className="eyebrow mb-3">最近搜索</p>
              <ul className="flex flex-wrap gap-2">
                {recent.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => setQuery(q)}
                      className="ring-focus rounded-full border border-border px-3 py-1 text-sm text-fg-muted transition hover:border-fg hover:text-fg"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-fg-muted">
              没有匹配「<span className="font-semibold text-fg">{query}</span>」的文章
            </p>
          )}

          {results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/blog/${r.slug}`}
                    onClick={() => {
                      recordRecent(query);
                      close();
                    }}
                    className="ring-focus group flex items-center gap-4 px-5 py-4 transition hover:bg-bg-subtle"
                  >
                    <div className="relative aspect-[4/3] w-20 flex-shrink-0 overflow-hidden bg-bg-subtle">
                      <Image src={r.cover} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">
                        {r.category}
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm font-semibold leading-snug group-hover:text-accent">
                        {r.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-fg-subtle">{r.excerpt}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-bg-subtle/50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
          <span>
            ↑↓ 浏览 · ↵ 打开 · ESC 关闭
          </span>
          <span>MiniSearch</span>
        </div>
      </div>
    </div>
  );
}
