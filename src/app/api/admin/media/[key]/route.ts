import { NextResponse } from "next/server";
import { requireAuthed } from "@/lib/auth";
import { deleteMedia } from "@/db/repo";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ key: string }> },
) {
  try {
    await requireAuthed();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { key } = await ctx.params;
  const decoded = decodeURIComponent(key);

  // 1) 删 R2 对象（prod）
  const r2 = await tryGetR2();
  if (r2) {
    try {
      await r2.delete(decoded);
    } catch {
      // R2 对象不存在不影响 db 清理
    }
  }

  // 2) 删 db 记录
  await deleteMedia(decoded);
  return NextResponse.json({ ok: true });
}

async function tryGetR2() {
  if (process.env.NODE_ENV === "development") return null;
  try {
    const mod = await import("@opennextjs/cloudflare").catch(() => null);
    if (!mod || typeof mod.getCloudflareContext !== "function") return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getCtx = mod.getCloudflareContext as any;
    const ctx = await getCtx({ async: true });
    return (ctx.env as { MEDIA?: { delete: (k: string) => Promise<unknown> } }).MEDIA ?? null;
  } catch {
    return null;
  }
}
