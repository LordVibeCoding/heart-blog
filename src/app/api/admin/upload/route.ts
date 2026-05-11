import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "请求体无效" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少文件" }, { status: 400 });
  }

  try {
    const result = await saveUpload(file);
    return NextResponse.json({ data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "上传失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
