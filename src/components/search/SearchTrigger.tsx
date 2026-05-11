"use client";

import { Search } from "lucide-react";

export function SearchTrigger() {
  return (
    <button
      type="button"
      aria-label="搜索"
      onClick={() => window.dispatchEvent(new Event("open-search"))}
      className="ring-focus inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition hover:bg-bg-subtle hover:text-fg"
    >
      <Search className="h-[18px] w-[18px]" />
    </button>
  );
}
