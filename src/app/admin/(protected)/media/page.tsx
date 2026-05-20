import { listMedia } from "@/db/repo";
import { MediaManager } from "./_manager";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const rows = await listMedia(120);
  // 序列化为 client 安全的字段
  const items = rows.map((r) => ({
    key: r.key,
    filename: r.filename,
    mimeType: r.mimeType,
    size: r.size,
    width: r.width,
    height: r.height,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="p-8 lg:p-12">
      <p className="eyebrow">Media</p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">图片库</h1>
      <p className="mt-2 text-sm text-fg-muted">
        管理 R2 上传的所有图片。点缩略图可预览原图；点 URL 一键复制。
      </p>

      <MediaManager initial={items} />
    </div>
  );
}
