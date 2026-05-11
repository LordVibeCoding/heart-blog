import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/data/types";

/**
 * Aside 列表布局：1 篇大图 + N 篇紧凑列表（模板的 layout-aside）。
 */
export function AsideStack({
  articles,
  size = "md",
}: {
  articles: Article[];
  size?: "md" | "lg";
}) {
  const [hero, ...rest] = articles;
  if (!hero) return null;

  return (
    <div className="space-y-7">
      <ArticleCard article={hero} titleSize={size === "lg" ? "lg" : "md"} />
      {rest.length > 0 && (
        <ul className="divide-y divide-border [&>li]:py-5">
          {rest.map((a) => (
            <li key={a.slug}>
              <ArticleCard article={a} layout="compact" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
