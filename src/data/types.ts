export type Category = {
  slug: string;
  name: string;
  description?: string;
  color?: string;
};

export type Author = {
  slug: string;
  name: string;
  avatar?: string;
  bio?: string;
  url?: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  coverAlt?: string;
  category: Category;
  tags: string[];
  author: Author;
  publishedAt: string; // ISO
  readingMinutes: number;
  featured?: boolean;
  /** Rendered HTML body. In production this comes from MDX/Markdown stored in D1. */
  bodyHtml: string;
};
