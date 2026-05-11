import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { recordMedia } from "@/db/repo";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

export type UploadResult = {
  key: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};

export async function saveUpload(file: File): Promise<UploadResult> {
  if (file.size > MAX_SIZE) {
    throw new Error(`文件过大（${(file.size / 1024 / 1024).toFixed(1)} MB），上限 15 MB`);
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error(`不支持的格式：${file.type}`);
  }

  const ext = extFor(file.type) ?? path.extname(file.name).replace(".", "") ?? "bin";
  const safeFilename = file.name.replace(/[^\w.-]+/g, "_").slice(0, 80);
  const key = `${new Date().toISOString().slice(0, 10)}/${nanoid(10)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const r2 = await tryGetR2();
  let url: string;
  if (r2) {
    await r2.put(key, bytes, { httpMetadata: { contentType: file.type } });
    const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
    url = publicBase ? `${publicBase}/${key}` : `/r2/${key}`;
  } else {
    // dev fallback：写到 public/uploads/
    const dir = path.join(process.cwd(), "public", "uploads", new Date().toISOString().slice(0, 10));
    fs.mkdirSync(dir, { recursive: true });
    const filename = `${nanoid(10)}.${ext}`;
    fs.writeFileSync(path.join(dir, filename), bytes);
    url = `/uploads/${new Date().toISOString().slice(0, 10)}/${filename}`;
  }

  await recordMedia({
    key,
    filename: safeFilename,
    mimeType: file.type,
    size: file.size,
  });

  return { key, url, filename: safeFilename, mimeType: file.type, size: file.size };
}

function extFor(mime: string): string | null {
  const m: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/svg+xml": "svg",
  };
  return m[mime] ?? null;
}

async function tryGetR2(): Promise<R2Bucket | null> {
  if (process.env.NODE_ENV === "development") return null;
  try {
    const mod = await import("@opennextjs/cloudflare").catch(() => null);
    if (!mod || typeof mod.getCloudflareContext !== "function") return null;
    const ctx = mod.getCloudflareContext();
    return (ctx.env as { MEDIA?: R2Bucket }).MEDIA ?? null;
  } catch {
    return null;
  }
}

// R2Bucket type from @cloudflare/workers-types
type R2Bucket = {
  put: (key: string, value: Uint8Array, options?: { httpMetadata?: { contentType?: string } }) => Promise<unknown>;
};
