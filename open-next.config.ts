import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  // 使用本地的轻量 cache（R2 启用前的过渡方案）
  incrementalCache: undefined,
});
