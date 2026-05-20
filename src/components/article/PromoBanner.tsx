import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const DEFAULT_BANNER_IMAGE = "/default-cover.svg";

/**
 * 全宽暗底 Promo Banner：左图 + 右大号 CTA。模板的 image+title+button 横幅复刻。
 */
export function PromoBanner({
  image,
  eyebrow,
  title,
  description,
  cta,
}: {
  image?: string | null;
  eyebrow: string;
  title: string;
  description: string;
  cta: { href: string; label: string };
}) {
  const src = image && image.trim() ? image : DEFAULT_BANNER_IMAGE;
  return (
    <section className="relative isolate overflow-hidden bg-[#0c0c0d] text-white">
      <div className="grid items-stretch md:grid-cols-2">
        <div className="relative aspect-[3/2] w-full md:aspect-auto md:min-h-[420px]">
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c0c0d]" />
        </div>

        <div className="flex flex-col justify-center gap-5 p-8 md:p-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            {eyebrow}
          </p>
          <h2 className="post-title max-w-xl text-[34px] leading-[1.05] tracking-tight text-white/70 md:text-[42px] [&_.highlight]:text-white">
            <span className="highlight">{title.split(" ").slice(0, Math.ceil(title.split(" ").length * 0.55)).join(" ")}</span>{" "}
            {title.split(" ").slice(Math.ceil(title.split(" ").length * 0.55)).join(" ")}
          </h2>
          <p className="max-w-xl text-white/70 md:text-lg">{description}</p>
          <Link
            href={cta.href}
            className="ring-focus mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0c0c0d] transition hover:bg-white/85"
          >
            {cta.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
