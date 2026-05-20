import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteApiToken, revokeApiToken } from "@/lib/api-token";

export const runtime = "nodejs";

/** 软撤销（保留记录） */
export async function PATCH(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await revokeApiToken(id);
  return NextResponse.json({ ok: true });
}

/** 物理删除 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await deleteApiToken(id);
  return NextResponse.json({ ok: true });
}
