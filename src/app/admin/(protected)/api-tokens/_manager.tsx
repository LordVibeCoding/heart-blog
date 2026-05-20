"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, Plus, Trash2, X } from "lucide-react";

type TokenRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date | string | null;
  lastUsedAt: Date | string | null;
  revokedAt: Date | string | null;
};

export function TokensManager({ initial }: { initial: TokenRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<{ name: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fmt(d: Date | string | null): string {
    if (!d) return "—";
    const t = new Date(d);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(t);
  }

  function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    startTransition(async () => {
      const r = await fetch("/api/admin/api-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!r.ok) {
        const d = (await r.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "创建失败");
        return;
      }
      const { data } = (await r.json()) as {
        data: { name: string; token: string };
      };
      setNewToken({ name: data.name, token: data.token });
      setName("");
      router.refresh();
    });
  }

  function revoke(id: string) {
    if (!confirm("撤销后此 token 立即失效，不可恢复。继续？")) return;
    startTransition(async () => {
      await fetch(`/api/admin/api-tokens/${id}`, { method: "PATCH" });
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("彻底删除这条记录？")) return;
    startTransition(async () => {
      await fetch(`/api/admin/api-tokens/${id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  async function copyToken() {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* 刚创建的 token 一次性展示 */}
      {newToken && (
        <div className="mb-6 border-2 border-fg bg-bg p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
                New Token · {newToken.name}
              </p>
              <p className="mt-2 text-sm text-fg-muted">
                这是该 token 唯一一次完整展示，关闭窗口后无法再次查看。
                请立刻复制到你的脚本 / env 文件中。
              </p>
              <div className="mt-4 flex items-center gap-2">
                <code className="flex-1 break-all border border-border bg-bg-subtle px-3 py-2 font-mono text-sm">
                  {newToken.token}
                </code>
                <button
                  type="button"
                  onClick={copyToken}
                  className="ring-focus inline-flex items-center gap-1.5 border border-border-strong px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-fg-muted transition hover:border-fg hover:text-fg"
                >
                  <Copy className="h-3.5 w-3.5" /> {copied ? "已复制" : "复制"}
                </button>
              </div>
            </div>
            <button
              type="button"
              aria-label="关闭"
              onClick={() => setNewToken(null)}
              className="ring-focus -mr-1 rounded-full p-1.5 text-fg-subtle transition hover:bg-bg-subtle hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 创建表单 */}
      <form
        onSubmit={create}
        className="flex items-end gap-3 border border-dashed border-border-strong bg-bg p-5"
      >
        <label className="flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-muted">
            Token 名称（用途备注）
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：claude-agent / github-action / publish-script"
            required
            maxLength={64}
            className="ring-focus mt-2 w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="ring-focus inline-flex items-center gap-1.5 bg-fg px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg transition hover:bg-accent-hover disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> 创建
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* 列表 */}
      <div className="mt-8 border border-border bg-bg">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-subtle text-left text-[11px] uppercase tracking-[0.16em] text-fg-subtle">
            <tr>
              <th className="px-4 py-3 font-semibold">名称</th>
              <th className="px-4 py-3 font-semibold">Token 前缀</th>
              <th className="px-4 py-3 font-semibold">创建时间</th>
              <th className="px-4 py-3 font-semibold">最后使用</th>
              <th className="px-4 py-3 font-semibold">状态</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initial.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-fg-muted">
                  还没有 token。在上方创建第一个吧。
                </td>
              </tr>
            ) : (
              initial.map((t) => (
                <tr key={t.id} className="hover:bg-bg-subtle/50">
                  <td className="px-4 py-3 font-semibold">{t.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-fg-subtle">{t.prefix}…</code>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{fmt(t.createdAt)}</td>
                  <td className="px-4 py-3 text-fg-muted">{fmt(t.lastUsedAt)}</td>
                  <td className="px-4 py-3">
                    {t.revokedAt ? (
                      <span className="inline-flex items-center border border-border-strong px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                        已撤销
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-fg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bg">
                        有效
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3 text-[12px] font-semibold uppercase tracking-[0.14em]">
                      {!t.revokedAt && (
                        <button
                          type="button"
                          onClick={() => revoke(t.id)}
                          disabled={pending}
                          className="text-fg-muted transition hover:text-fg disabled:opacity-40"
                        >
                          撤销
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(t.id)}
                        disabled={pending}
                        className="inline-flex items-center gap-1 text-red-600 transition hover:text-red-700 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
