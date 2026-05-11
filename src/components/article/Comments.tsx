"use client";

import { useEffect, useState } from "react";
import Giscus from "@giscus/react";

const repo = process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}` | undefined;
const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? "General";
const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

export function Comments({ term }: { term: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // 跟随 <html> 的 .dark class 实时切主题
  useEffect(() => {
    const sync = () => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // 未配置时给出占位
  if (!repo || !repoId || !categoryId) {
    return (
      <div className="rounded border border-dashed border-border p-6 text-sm text-fg-muted">
        评论尚未启用。设置 <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-xs">NEXT_PUBLIC_GISCUS_REPO</code>、
        <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-xs">NEXT_PUBLIC_GISCUS_REPO_ID</code> 和
        <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-xs">NEXT_PUBLIC_GISCUS_CATEGORY_ID</code>
        ，并在 GitHub 仓库启用 Discussions + 安装 Giscus app 后即可启用。
      </div>
    );
  }

  return (
    <Giscus
      id="comments"
      repo={repo}
      repoId={repoId}
      category={category}
      categoryId={categoryId}
      mapping="specific"
      term={term}
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === "dark" ? "dark_dimmed" : "light"}
      lang="zh-CN"
      loading="lazy"
    />
  );
}
