import { listApiTokens } from "@/lib/api-token";
import { TokensManager } from "./_manager";

export const dynamic = "force-dynamic";

export default async function ApiTokensPage() {
  const rows = await listApiTokens();
  return (
    <div className="p-8 lg:p-12">
      <p className="eyebrow">API Tokens</p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">API Token 管理</h1>
      <p className="mt-2 text-sm text-fg-muted">
        给自动化脚本 / AI Agent 用。请求头加{" "}
        <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-xs">
          Authorization: Bearer &lt;token&gt;
        </code>
        即可调用所有 admin API。明文 token 仅在创建时显示一次。
      </p>

      <div className="mt-8 max-w-4xl">
        <TokensManager initial={rows} />
      </div>
    </div>
  );
}
