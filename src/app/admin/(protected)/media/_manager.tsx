"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Copy, Trash2, Upload } from "lucide-react";

type Item = {
  key: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};

const PUBLIC = "https://media.okl.la";

function urlOf(key: string) {
  return `${PUBLIC}/${key}`;
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MediaManager({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploading(true);
    try {
      for (const file of arr) {
        const fd = new FormData();
        fd.append("file", file);
        const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!r.ok) {
          const d = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(d.error ?? `上传失败：${file.name}`);
        }
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    e.target.value = "";
    if (files) void uploadFiles(files);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      void uploadFiles(e.dataTransfer.files);
    }
  }

  async function copy(text: string, k: string) {
    await navigator.clipboard.writeText(text);
    setCopied(k);
    setTimeout(() => setCopied(null), 1500);
  }

  function remove(key: string) {
    if (!confirm(`删除「${key}」？R2 文件 + 数据库记录会一起删。`)) return;
    startTransition(async () => {
      const r = await fetch(`/api/admin/media/${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      if (!r.ok) {
        const d = (await r.json().catch(() => ({}))) as { error?: string };
        alert(d.error ?? "删除失败");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-8">
      {/* 上传区 */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="ring-focus flex items-center justify-between gap-6 border border-dashed border-border-strong bg-bg p-6 transition hover:border-fg"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            Upload
          </p>
          <p className="mt-2 text-sm font-medium">拖拽图片到这里 / 或点选文件</p>
          <p className="mt-1 text-xs text-fg-subtle">
            支持 JPG / PNG / WebP / GIF / AVIF / SVG · 单图 ≤ 15 MB · 多选一次传
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="ring-focus inline-flex items-center gap-2 bg-fg px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg transition hover:bg-accent-hover disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "上传中…" : "选择文件"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPickFile}
          hidden
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* 列表 */}
      {initial.length === 0 ? (
        <div className="mt-8 border border-dashed border-border p-14 text-center text-fg-muted">
          还没有图片。上传第一张吧。
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initial.map((it) => {
            const url = urlOf(it.key);
            return (
              <li key={it.key} className="border border-border bg-bg">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="ring-focus block aspect-[4/3] overflow-hidden bg-bg-subtle"
                  aria-label={`打开原图 ${it.filename}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={it.filename}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </a>
                <div className="space-y-2 p-3 text-xs">
                  <p className="truncate font-mono text-fg-muted" title={it.filename}>
                    {it.filename}
                  </p>
                  <p className="text-fg-subtle">
                    {fmtSize(it.size)} · {fmtDate(it.createdAt)}
                  </p>
                  <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                    <button
                      type="button"
                      onClick={() => copy(url, it.key)}
                      className="ring-focus inline-flex items-center gap-1 text-fg-muted transition hover:text-fg"
                    >
                      <Copy className="h-3 w-3" />
                      {copied === it.key ? "已复制" : "复制 URL"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(it.key)}
                      disabled={pending}
                      className="ring-focus inline-flex items-center gap-1 text-red-600 transition hover:text-red-700 disabled:opacity-40"
                    >
                      <Trash2 className="h-3 w-3" />
                      删除
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
