# Content API · 自动发文章对接文档

给 AI Agent / 自动化脚本对接的完整 API 文档。覆盖**登录 → 上传图片 → 创建文章**的全部接口。

> 域名：`https://okl.la`
> 默认编辑器：Tiptap（输出 HTML，存 D1 `articles.body_html`）
> 字符集：UTF-8
> 时区：UTC（`publishedAt` 是 ISO 8601）

## 目录

- [认证](#认证)
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

## 认证

所有 `/api/admin/*` 接口都需要登录态（HttpOnly cookie）。先调用登录拿到 `blog_session` cookie，后续请求带上即可。

### POST `/api/auth/login`

**Request**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "hylas520",
  "password": "your-password"
}
```

**Response · 200**
```json
{ "ok": true }
```
Set-Cookie 头返回 `blog_session=...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`（7 天有效）。

**Response · 401**
```json
{ "error": "账号或密码错误" }
```

**Response · 429**
```json
{ "error": "尝试过多，请稍后再试" }
```
每 IP 每分钟最多 5 次失败。

### POST `/api/auth/logout`
带 cookie 调用即销毁 session。

---

## 图片上传

把任意图片（截图、本地文件、网络下载到本地的图）上传到 R2，返回可直接放进 `<img src>` 的公网 URL。

### POST `/api/admin/upload`

**Request**
```http
POST /api/admin/upload
Cookie: blog_session=...
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
| file | File | ✓ | 单个文件，必须是 `image/*`，≤15 MB |

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

**Response · 400**
```json
{ "error": "文件过大（18.2 MB），上限 15 MB" }
{ "error": "不支持的格式：image/heic" }
{ "error": "缺少文件" }
```

### curl 示例

```bash
curl -X POST https://okl.la/api/admin/upload \
  -b cookies.txt \
  -F "file=@/path/to/screenshot.png"
```

### Python 示例

```python
import requests

with open("screenshot.png", "rb") as f:
    r = requests.post(
        "https://okl.la/api/admin/upload",
        files={"file": ("screenshot.png", f, "image/png")},
        cookies=cookies,  # 上一步 login 拿的
    )
url = r.json()["data"]["url"]
# url = "https://media.okl.la/2026-05-20/..."
```

### Node.js 示例

```js
import fs from "node:fs";

const fd = new FormData();
fd.append("file", new Blob([fs.readFileSync("shot.png")], { type: "image/png" }), "shot.png");
const r = await fetch("https://okl.la/api/admin/upload", {
  method: "POST",
  headers: { Cookie },
  body: fd,
});
const { data } = await r.json();
// data.url 直接用
```

---

## 创建文章

### POST `/api/admin/articles`

```http
POST /api/admin/articles
Cookie: blog_session=...
Content-Type: application/json

{
  "slug": "claude-code-skills-overview",
  "title": "Claude Code Skills 全景：让 Agent 长出习惯",
  "bodyHtml": "<p>正文段落…</p><img src=\"https://media.okl.la/...png\" alt=\"截图\"><p>结尾</p>",
  "categorySlug": "ai",
  "tags": ["Claude", "AI agent", "工作流"]
}
```

### 字段全集

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `slug` | string | ✓ | — | URL 路径，**小写英文/数字/连字符**，1-120 字符。建议从标题拼音生成 |
| `title` | string | ✓ | — | 文章标题，1-200 字符 |
| `bodyHtml` | string | ✓ | — | HTML 正文，至少 1 字符 |
| `categorySlug` | string | ✓ | — | 必须是已存在的分类 slug（见 `/api/admin/categories`）|
| `excerpt` | string | ✗ | 自动取正文首段前 200 字 | 摘要，0-400 字符 |
| `cover` | string \| null | ✗ | 自动取正文第一张 `<img>` 的 src；都没图就用 `/default-cover.svg` | 封面图 URL，绝对或相对路径 |
| `coverAlt` | string \| null | ✗ | null | 封面图无障碍描述 |
| `bodyMarkdown` | string \| null | ✗ | null | 可选的 markdown 备份 |
| `status` | `"draft"` \| `"published"` | ✗ | `"published"` | 草稿不会出现在前台，但可访问详情页 URL（如果知道）|
| `featured` | boolean | ✗ | `false` | 标记为「编辑推荐」，在首页 Hero / Editor's pick 展示 |
| `tags` | string[] | ✗ | `[]` | 标签数组，会自动 upsert 到 tags 表，多对多关联 |

**自动补全**（无需自己算）：
- `excerpt` 留空 → 取正文第一个 `<p>` 的纯文本前 200 字
- `cover` 留空 → 取 `bodyHtml` 中第一个 `<img src>`，都没图就 `/default-cover.svg`
- `readingMinutes` → 按字数自动算（220 字/分钟）
- `publishedAt` → 状态 `published` 时设为当前时间

### Response · 201

```json
{ "data": { "id": "dVx7zQ-CRrs-" } }
```

文章访问 URL：`https://okl.la/blog/{slug}`

### Response · 400

```json
{
  "error": "表单字段无效",
  "details": {
    "formErrors": [],
    "fieldErrors": {
      "slug": ["Invalid"],
      "categorySlug": ["Required"]
    }
  }
}
```

slug 规则不符（含中文、空格、大写）会落到 `fieldErrors.slug`。

### slug 推荐生成方式

```python
import re
def to_slug(title: str) -> str:
    from pypinyin import lazy_pinyin   # pip install pypinyin
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
Cookie: blog_session=...
Content-Type: application/json

{ "featured": true }
```

```http
PATCH /api/admin/articles/dVx7zQ-CRrs-
Content-Type: application/json

{
  "status": "draft",
  "tags": ["AI agent", "重写"]
}
```

**特殊**：把 `cover` 设为空字符串会触发「重新从正文提取」。同样 `excerpt`。

**Response · 200**
```json
{ "ok": true }
```

---

## 删除文章

### DELETE `/api/admin/articles/{id}`

```http
DELETE /api/admin/articles/dVx7zQ-CRrs-
Cookie: blog_session=...
```

```json
{ "ok": true }
```

会级联删除标签关联（`article_tags`），不删图片（R2 里的图片得通过 `/admin/media` 单独清理）。

---

## 获取分类列表

写文章前先拿可用的 `categorySlug`。

### GET `/api/admin/categories`

```json
{
  "data": [
    { "slug": "ai", "name": "AI", "description": "Claude / GPT / Cursor / LLM 工程实践" },
    { "slug": "coding", "name": "编码笔记", "description": "全栈、架构、调试、性能" },
    { "slug": "overseas", "name": "海外技术", "description": "Telegram、Cloudflare、Vercel 与海外生态" },
    { "slug": "tools", "name": "工具", "description": "效率、流程、自动化、生产力" },
    { "slug": "notes", "name": "随笔", "description": "想法、阅读、片段记录" }
  ]
}
```

---

## 创建分类

### POST `/api/admin/categories`

```json
{
  "slug": "rust",
  "name": "Rust",
  "description": "系统编程 / WASM / 工具链"
}
```

`slug` 规则：`^[a-z0-9一-龥-]+$`，1-64 字符。

---

## 完整流程示例

「截图 → 上传图片 → 用 URL 写文章」完整跑通。

### Bash（一行 curl 走完）

```bash
# 1) 登录
curl -s -c /tmp/cookie -X POST https://okl.la/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"hylas520","password":"YOUR_PWD"}'

# 2) 上传截图
URL=$(curl -s -b /tmp/cookie -X POST https://okl.la/api/admin/upload \
  -F "file=@./shot.png" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['url'])")

# 3) 发文章（cover / excerpt 都自动从正文提取）
curl -s -b /tmp/cookie -X POST https://okl.la/api/admin/articles \
  -H "Content-Type: application/json" \
  -d "{
    \"slug\": \"auto-test-$(date +%s)\",
    \"title\": \"AI 自动发文测试\",
    \"bodyHtml\": \"<p>这是 AI 自动生成的文章。下面是配图：</p><img src=\\\"$URL\\\" alt=\\\"测试截图\\\"><p>支持 Markdown 风格 HTML：<strong>粗体</strong>、<em>斜体</em>、<a href=\\\"https://okl.la\\\">链接</a>、列表、引用、代码块。</p>\",
    \"categorySlug\": \"ai\",
    \"tags\": [\"自动化\", \"测试\"]
  }"
```

### Python（完整封装）

```python
import requests, re
from pypinyin import lazy_pinyin

BASE = "https://okl.la"

class Blog:
    def __init__(self, username: str, password: str):
        self.s = requests.Session()
        r = self.s.post(f"{BASE}/api/auth/login", json={
            "username": username, "password": password,
        })
        r.raise_for_status()

    def upload(self, path: str, mime: str = "image/png") -> str:
        """上传图片，返回公网 URL"""
        with open(path, "rb") as f:
            r = self.s.post(
                f"{BASE}/api/admin/upload",
                files={"file": (path.split("/")[-1], f, mime)},
            )
        r.raise_for_status()
        return r.json()["data"]["url"]

    def slug(self, title: str) -> str:
        py = "-".join(lazy_pinyin(title))
        s = re.sub(r"[^a-z0-9-]+", "-", py.lower()).strip("-")
        return s[:80]

    def publish(self, title: str, body_html: str, *,
                category: str = "ai",
                tags: list[str] | None = None,
                featured: bool = False,
                slug: str | None = None) -> str:
        """发文章，返回文章 ID"""
        r = self.s.post(f"{BASE}/api/admin/articles", json={
            "slug": slug or self.slug(title),
            "title": title,
            "bodyHtml": body_html,
            "categorySlug": category,
            "tags": tags or [],
            "featured": featured,
        })
        r.raise_for_status()
        return r.json()["data"]["id"]


# 使用
blog = Blog("hylas520", "YOUR_PWD")
img = blog.upload("./shot.png")
body = f"""
<h2>Claude Code Skills 实战</h2>
<p>今天聊聊 Skills 这个超级实用的能力。</p>
<img src="{img}" alt="Skills 工作流截图">
<p>Skills 让 Agent 长出习惯，把人类专家的 SOP 持久化进 LLM 推理路径。</p>
<h3>用法</h3>
<pre><code>~/.claude/skills/my-skill/SKILL.md</code></pre>
"""
blog.publish(
    title="Claude Code Skills 实战",
    body_html=body,
    category="ai",
    tags=["Claude", "AI agent", "Skills"],
    featured=True,
)
```

### Node.js（完整封装）

```js
import fs from "node:fs";
import path from "node:path";

const BASE = "https://okl.la";

class Blog {
  cookies = "";

  async login(username, password) {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) throw new Error(`login failed: ${r.status}`);
    this.cookies = r.headers.getSetCookie().join("; ");
  }

  async upload(filePath, mime = "image/png") {
    const fd = new FormData();
    fd.append(
      "file",
      new Blob([fs.readFileSync(filePath)], { type: mime }),
      path.basename(filePath),
    );
    const r = await fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      headers: { Cookie: this.cookies },
      body: fd,
    });
    if (!r.ok) throw new Error(`upload failed: ${await r.text()}`);
    return (await r.json()).data.url;
  }

  async publish({ title, bodyHtml, slug, category = "ai", tags = [], featured = false }) {
    const r = await fetch(`${BASE}/api/admin/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: this.cookies },
      body: JSON.stringify({ slug, title, bodyHtml, categorySlug: category, tags, featured }),
    });
    if (!r.ok) throw new Error(`publish failed: ${await r.text()}`);
    return (await r.json()).data.id;
  }
}

// 使用
const blog = new Blog();
await blog.login("hylas520", process.env.BLOG_PWD);
const img = await blog.upload("./shot.png");
await blog.publish({
  slug: "tiptap-paste-image",
  title: "Tiptap 粘贴图片自动上传",
  bodyHtml: `<p>截图直接 ⌘V，自动上传：</p><img src="${img}" alt="">`,
});
```

---

## 错误码

| HTTP | 含义 | 处理 |
|---|---|---|
| 200 / 201 | 成功 | — |
| 400 | 字段无效 / 请求体格式错 | 看 `details.fieldErrors` |
| 401 | 未登录 / cookie 过期 | 重新登录 |
| 429 | 登录速率限制 | 等 60 秒重试 |
| 500 | 服务端异常 | 检查 wrangler logs，或重试 |

---

## 实战 · 让 AI 自动写文章

把上面的 Python 封装喂给你的 AI Agent（Claude / GPT），让它按下面的 system prompt 工作：

```text
你是一位资深技术博主。任务：
1. 阅读用户提供的素材（链接、笔记、截图）
2. 写一篇 600-1500 字的 HTML 格式技术文章
3. 配图自动上传（用 blog.upload(path)）
4. 调 blog.publish() 发布

格式要求：
- <h2> 一级章节 / <h3> 二级
- <p> 段落，每段一个完整想法，避免长段落
- <ul> / <ol> 列表
- <blockquote> 重要引用
- <pre><code> 代码块（保留缩进）
- <img src alt> 关键截图（先 upload 拿 URL）

slug：从标题拼音转，不超过 80 字符
分类：AI 相关 → ai / 工程 → coding / 海外资讯 → overseas / 工具 → tools / 随笔 → notes
标签：3-5 个英文 / 中文混合
featured：本周一篇推荐，其它 false
```

配合 [Anthropic Computer Use](https://docs.anthropic.com/en/docs/build-with-claude/computer-use) 截屏 + 此 API，可以做到「让 Agent 看屏幕 → 写文章 → 自动配图 → 发布」全链路。

---

## 限制 & 已知边界

- 单图 ≤ 15 MB，单文章正文 ≤ ~~5MB~~（D1 单列）
- 速率限制：登录 5 次/分钟/IP；其它 admin API 无显式限流（CF Workers 整体配额内）
- `slug` 全局唯一，重复会返回 400
- 草稿不会出现在 sitemap / RSS / 列表，但**草稿的 URL 公开可访问**（如果有人猜到 slug）。后续需要严格的草稿保护可以加 `?token=` 预览链接

---

## 修改密码

```bash
node scripts/hash-password.mjs 'new-strong-password'
# 输出的 ITER/SALT/HASH 三个值用 wrangler secret put 更新：
wrangler secret put ADMIN_PASSWORD_ITER --name lordvibecoding-blog
wrangler secret put ADMIN_PASSWORD_SALT --name lordvibecoding-blog
wrangler secret put ADMIN_PASSWORD_HASH --name lordvibecoding-blog
```

不需要重新部署，secrets 立即生效。
