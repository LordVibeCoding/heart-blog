"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!r.ok) {
        const data = (await r.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "登录失败");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg-subtle px-4">
      <div className="w-full max-w-sm border border-border bg-bg p-8 shadow-sm">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-3 font-sans text-2xl font-bold tracking-tight">登录后台</h1>
        <p className="mt-2 text-sm text-fg-muted">仅限管理员，未授权访问会被拦截。</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Field
            label="用户名"
            type="text"
            autoComplete="username"
            value={username}
            onChange={setUsername}
            required
          />
          <Field
            label="密码"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            required
          />

          {error && (
            <p role="alert" className="rounded border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ring-focus w-full bg-fg py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "登录中…" : "登 录"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-muted">
        {label}
      </span>
      <input
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ring-focus mt-2 block w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
      />
    </label>
  );
}
