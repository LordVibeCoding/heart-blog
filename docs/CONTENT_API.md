# Content API · 自动发文章对接文档

给 AI Agent / 自动化脚本对接的完整 API。用 **Bearer Token** 鉴权，无需账号密码。

> 域名：`https://okl.la`
> 鉴权：`Authorization: Bearer lvc_xxxxx`（在后台 `/admin/api-tokens` 创建）
> 编辑器：Tiptap（输出 HTML）
> 字符集：UTF-8
> 时区：UTC（`publishedAt` 是 ISO 8601）

## 目录

- [创建 Token](#创建-token)
- [认证用法](#认证用法)
- [图片上传](#图片上传)
- [创建文章](#创建文章)
- [更新文章](#更新文章)
- [删除文章](#删除文章)
- [获取分类列表](#获取分类列表)
- [创建分类](#创建分类)
- [完整流程示例](#完整流程示例)
- [错误码](#错误码)
- [实战 · 让 AI 自动写文章](#实战--让-ai-自动写文章)

---

## 创建 Token

1. 浏览器登录后台：`https://okl.la/admin/login`
2. 左侧导航 → **API Tokens**
3. 填一个名称（如 `claude-agent`），点 **创建**
4. **立刻复制** 弹出来的 `lvc_xxxxxxxxxxxx...`（关闭窗口后不再展示）
5. 把 token 塞进 env：`BLOG_TOKEN=lvc_xxxxx`

每个 token 独立可撤销，建议**一个用途一个 token**（备份方便也利于审计 `lastUsedAt`）。

---

## 认证用法

所有 `/api/admin/*` 接口都需要 `Authorization: Bearer <token>` 请求头：

```bash
curl https://okl.la/api/admin/categories \
  -H "Authorization: Bearer lvc_xxxxxxxxxxxx..."
```

被撤销 / 不存在的 token 返回 401。

---

## 图片上传

把截图、本地文件、网图（自己先下载到本地）上传到 R2，返回公网 URL。

### POST `/api/admin/upload`

```http
POST /api/admin/upload
Authorization: Bearer lvc_xxxxx
Content-Type: multipart/form-data; boundary=...

----boundary
Content-Disposition: form-data; name="file"; filename="screenshot.png"
Content-Type: image/png

<binary bytes>
----boundary--
```

**字段**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| file | File | ✓ | 单个文件，必须 `image/*`，≤15 MB |

**允许的 MIME**：`image/jpeg`、`image/png`、`image/webp`、`image/gif`、`image/avif`、`image/svg+xml`

**Response · 200**
```json
{
  "data": {
    "key": "2026-05-20/x9k3jPq1Rb.png",
    "url": "https://media.okl.la/2026-05-20/x9k3jPq1Rb.png",
    "filename": "screenshot.png",
    "mimeType": "image/png",
    "size": 124533
  }
}
```

### curl

```bash
curl -X POST https://okl.la/api/admin/upload \
  -H "Authorization: Bearer $BLOG_TOKEN" \
  -F "file=@/path/to/screenshot.png"
```

### Python

```python
import requests, os

with open("screenshot.png", "rb") as f:
    r = requests.post(
        "https://okl.la/api/admin/upload",
        headers={"Authorization": f"Bearer {os.environ['BLOG_TOKEN']}"},
        files={"file": ("screenshot.png", f, "image/png")},
    )
url = r.json()["data"]["url"]
```

### Node.js

```js
import fs from "node:fs";
import path from "node:path";

const fd = new FormData();
fd.append(
  "file",
  new Blob([fs.readFileSync("shot.png")], { type: "image/png" }),
  "shot.png",
);
const r = await fetch("https://okl.la/api/admin/upload", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.BLOG_TOKEN}` },
  body: fd,
});
const { data } = await r.json();
```

---

## 创建文章

### POST `/api/admin/articles`

```http
POST /api/admin/articles
Authorization: Bearer lvc_xxxxx
Content-Type: application/json

{
  "slug": "claude-code-skills-overview",
  "title": "Claude Code Skills 全景",
  "bodyHtml": "<p>正文段落…</p><img src=\"https://media.okl.la/...png\" alt=\"截图\"><p>结尾</p>",
  "categorySlug": "ai",
  "tags": ["Claude", "AI agent"]
}
```

### 字段全集

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `slug` | string | ✓ | — | URL 路径，**小写英文/数字/连字符**，1-120 字符 |
| `title` | string | ✓ | — | 文章标题，1-200 字符 |
| `bodyHtml` | string | ✓ | — | HTML 正文 |
| `categorySlug` | string | ✓ | — | 必须是已存在的分类 slug |
| `excerpt` | string | ✗ | 自动取正文首段前 200 字 | 摘要，0-400 字符 |
| `cover` | string \| null | ✗ | 正文第一张 `<img src>`；都没图就用 `/default-cover.svg` | 封面图 URL |
| `coverAlt` | string \| null | ✗ | null | 封面图无障碍描述 |
| `bodyMarkdown` | string \| null | ✗ | null | 可选 markdown 备份 |
| `status` | `"draft"` \| `"published"` | ✗ | `"published"` | 草稿不在前台展示 |
| `featured` | boolean | ✗ | `false` | 标记为「编辑推荐」 |
| `tags` | string[] | ✗ | `[]` | 标签数组，自动 upsert |

**自动补全**（不用自己算）：
- `excerpt` 留空 → 取正文第一个 `<p>` 的纯文本前 200 字
- `cover` 留空 → 取 `bodyHtml` 第一个 `<img src>`，都没图 → `/default-cover.svg`
- `readingMinutes` → 按字数自动算
- `publishedAt` → 状态 `published` 时设为当前时间

### Response · 201

```json
{ "data": { "id": "dVx7zQ-CRrs-" } }
```

URL：`https://okl.la/blog/{slug}`

### Response · 400

```json
{
  "error": "表单字段无效",
  "details": {
    "fieldErrors": {
      "slug": ["Invalid"],
      "categorySlug": ["Required"]
    }
  }
}
```

### slug 推荐生成

```python
import re
from pypinyin import lazy_pinyin   # pip install pypinyin

def to_slug(title: str) -> str:
    py = "-".join(lazy_pinyin(title))
    s = re.sub(r"[^a-z0-9-]+", "-", py.lower()).strip("-")
    return s[:80]

to_slug("Claude Code Skills 全景：让 Agent 长出习惯")
# → "claude-code-skills-quan-jing-rang-agent-zhang-chu-xi-guan"
```

---

## 更新文章

### PATCH `/api/admin/articles/{id}`

任意字段单独传，未传字段不变。

```http
PATCH /api/admin/articles/dVx7zQ-CRrs-
Authorization: Bearer lvc_xxxxx
Content-Type: application/json

{ "featured": true }
```

把 `cover` / `excerpt` 设为空字符串 → 触发**重新从正文提取**。

---

## 删除文章

```http
DELETE /api/admin/articles/dVx7zQ-CRrs-
Authorization: Bearer lvc_xxxxx
```

会级联删除标签关联，不删图片（R2 物理文件需另外清理）。

---

## 获取分类列表

发文章前先查可用 `categorySlug`：

```bash
curl https://okl.la/api/admin/categories \
  -H "Authorization: Bearer $BLOG_TOKEN"
```

```json
{
  "data": [
    { "slug": "ai", "name": "AI", "description": "..." },
    { "slug": "coding", "name": "编码笔记", "description": "..." },
    { "slug": "overseas", "name": "海外技术", "description": "..." },
    { "slug": "tools", "name": "工具", "description": "..." },
    { "slug": "notes", "name": "随笔", "description": "..." }
  ]
}
```

---

## 创建分类

```http
POST /api/admin/categories
Authorization: Bearer lvc_xxxxx

{
  "slug": "rust",
  "name": "Rust",
  "description": "系统编程 / WASM"
}
```

---

## 完整流程示例

「截图 → 上传 → 用 URL 写文章」一气呵成。

### Bash

```bash
TOKEN="lvc_xxxxxxxxxxxx..."

# 1) 上传截图
URL=$(curl -s -X POST https://okl.la/api/admin/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./shot.png" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['url'])")

# 2) 发文章（cover / excerpt 自动从正文提取）
curl -s -X POST https://okl.la/api/admin/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"slug\": \"auto-$(date +%s)\",
    \"title\": \"AI 自动发文测试\",
    \"bodyHtml\": \"<p>下面是配图：</p><img src=\\\"$URL\\\" alt=\\\"\\\"><p><strong>支持</strong> 富文本</p>\",
    \"categorySlug\": \"ai\",
    \"tags\": [\"自动化\"]
  }"
```

### Python（完整封装）

```python
import os, re, requests
from pypinyin import lazy_pinyin

BASE = "https://okl.la"

class Blog:
    def __init__(self, token: str | None = None):
        self.token = token or os.environ["BLOG_TOKEN"]
        self.h = {"Authorization": f"Bearer {self.token}"}

    def upload(self, path: str, mime: str = "image/png") -> str:
        with open(path, "rb") as f:
            r = requests.post(
                f"{BASE}/api/admin/upload",
                headers=self.h,
                files={"file": (path.split("/")[-1], f, mime)},
            )
        r.raise_for_status()
        return r.json()["data"]["url"]

    def slug(self, title: str) -> str:
        py = "-".join(lazy_pinyin(title))
        s = re.sub(r"[^a-z0-9-]+", "-", py.lower()).strip("-")
        return s[:80]

    def publish(self, *, title: str, body_html: str,
                category: str = "ai",
                tags: list[str] | None = None,
                featured: bool = False,
                slug: str | None = None) -> str:
        r = requests.post(
            f"{BASE}/api/admin/articles",
            headers={**self.h, "Content-Type": "application/json"},
            json={
                "slug": slug or self.slug(title),
                "title": title,
                "bodyHtml": body_html,
                "categorySlug": category,
                "tags": tags or [],
                "featured": featured,
            },
        )
        r.raise_for_status()
        return r.json()["data"]["id"]


# 使用
blog = Blog()  # 从 env 读 BLOG_TOKEN
img = blog.upload("./shot.png")
body = f"""
<h2>Claude Code Skills 实战</h2>
<p>把人类专家的 SOP 持久化进 LLM 推理路径。</p>
<img src="{img}" alt="Skills 工作流截图">
<p><strong>用法</strong>：放一个 SKILL.md 到 ~/.claude/skills 即可。</p>
"""
blog.publish(
    title="Claude Code Skills 实战",
    body_html=body,
    category="ai",
    tags=["Claude", "Skills"],
    featured=True,
)
```

### Node.js（完整封装）

```js
import fs from "node:fs";
import path from "node:path";

const BASE = "https://okl.la";
const TOKEN = process.env.BLOG_TOKEN;
const headers = { Authorization: `Bearer ${TOKEN}` };

async function upload(filePath, mime = "image/png") {
  const fd = new FormData();
  fd.append(
    "file",
    new Blob([fs.readFileSync(filePath)], { type: mime }),
    path.basename(filePath),
  );
  const r = await fetch(`${BASE}/api/admin/upload`, {
    method: "POST",
    headers,
    body: fd,
  });
  if (!r.ok) throw new Error(`upload failed: ${await r.text()}`);
  return (await r.json()).data.url;
}

async function publish({ slug, title, bodyHtml, category = "ai", tags = [], featured = false }) {
  const r = await fetch(`${BASE}/api/admin/articles`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ slug, title, bodyHtml, categorySlug: category, tags, featured }),
  });
  if (!r.ok) throw new Error(`publish failed: ${await r.text()}`);
  return (await r.json()).data.id;
}

// 用法
const img = await upload("./shot.png");
await publish({
  slug: "tiptap-paste-image",
  title: "Tiptap 粘贴图片自动上传",
  bodyHtml: `<p>截图 ⌘V：</p><img src="${img}" alt="">`,
});
```

---

## 错误码

| HTTP | 含义 | 处理 |
|---|---|---|
| 200 / 201 | 成功 | — |
| 400 | 字段无效 / 请求体格式错 | 看 `details.fieldErrors` |
| 401 | Token 缺失 / 失效 / 已撤销 | 在 `/admin/api-tokens` 创建新 token |
| 500 | 服务端异常 | 检查 wrangler logs 或重试 |

---

## 实战 · 让 AI 自动写文章

把下面这段贴进 Claude / GPT 的 system prompt（配合上面的 Python 封装类）：

```text
你是一位资深技术博主，专攻 AI 编码、海外技术、独立开发。

工具：
- blog.upload(path) → 上传本地图片到 R2，返回公网 URL
- blog.publish(title, body_html, category, tags, featured) → 发文章

任务：
1. 阅读用户给的素材（链接、笔记、截图路径）
2. 写一篇 600-1500 字的 HTML 格式技术文章
3. 配图：先 blog.upload(path) 拿 URL，再嵌进 body_html 的 <img src>
4. 调 blog.publish 发布

HTML 规范：
- <h2> 一级章节 / <h3> 二级
- <p> 段落，每段一个完整想法
- <ul>/<ol> 列表，<blockquote> 引用，<pre><code> 代码块
- 重要图片用 <img src="..." alt="...">（alt 必填）

slug：让 blog.publish 自动生成（不传即可）
分类：AI 工程 → "ai" / 全栈 → "coding" / 海外资讯 → "overseas" / 工具 → "tools" / 随笔 → "notes"
标签：3-5 个，中英文混合
featured：只有真正值得置顶的才设 true
```

配合 [Anthropic Computer Use](https://docs.anthropic.com/en/docs/build-with-claude/computer-use) 截屏 + 此 API，可以做到「Agent 看屏幕 → 写文章 → 自动配图 → 发布」全链路。

---

## 安全建议

- **Token 一次性展示**：创建后立刻复制到 env / secret manager，不要明文存代码或聊天记录
- **一个用途一个 token**：方便 lastUsedAt 审计、按需撤销
- **泄漏立即撤销**：在 `/admin/api-tokens` 点"撤销"，token 即时失效（DB 校验，零延迟）
- **不要把 token 嵌进前端**：API 都是 admin 权限，前端泄漏 = 任何人可发文
- Token 在传输中加密（站点强制 HTTPS + TLS 1.3）
- Token 在 DB 中以 **SHA-256 hash** 存储，明文丢失不可找回，只能撤销重建

---

## 限制 & 边界

- 单图 ≤ 15 MB
- `slug` 全局唯一，重复 → 400
- 草稿不在 sitemap / RSS / 列表，但**草稿 URL 公开可访问**（猜中 slug 即可看）
- 文件存 R2，访问走 `media.okl.la`（已配 CDN 自动加速）

---

## 修改密码 / 重置 Token

**修改后台登录密码**：
```bash
node scripts/hash-password.mjs 'new-strong-password'
# 把输出的 ITER/SALT/HASH 用 wrangler secret put 更新
wrangler secret put ADMIN_PASSWORD_ITER --name lordvibecoding-blog
wrangler secret put ADMIN_PASSWORD_SALT --name lordvibecoding-blog
wrangler secret put ADMIN_PASSWORD_HASH --name lordvibecoding-blog
```
立即生效，无需重新部署。

**重置 API Token**：直接在 `/admin/api-tokens` 撤销 + 重新创建，DB 单表操作，无需重启。
