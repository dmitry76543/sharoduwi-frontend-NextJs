import Link from "next/link";

import { formatBlogDate, getBlogPostsSorted, type BlogPost } from "@/lib/blog";

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-card">
      <time className="blog-card-date" dateTime={post.publishedAt}>
        {formatBlogDate(post.publishedAt)}
      </time>
      <h2>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p>{post.description}</p>
      <div className="blog-card-meta">
        <span>{post.readingMinutes} мин чтения</span>
        <Link href={`/blog/${post.slug}`} className="blog-card-more">
          Читать →
        </Link>
      </div>
    </article>
  );
}

export function BlogIndexContent() {
  const posts = getBlogPostsSorted();

  return (
    <>
      <section className="sec info-page">
        <div className="wrap">
          <nav className="category-breadcrumb reveal" aria-label="Навигация">
            <Link href="/">Главная</Link>
            <span aria-hidden="true">/</span>
            <span>Полезное</span>
          </nav>

          <div className="info-hero reveal">
            <div className="sec-tag">
              <span className="dot" /> Блог
            </div>
            <h1>Гелиевые и воздушные шары: советы и идеи</h1>
            <p className="info-lead">
              Советы по выбору гелиевых и воздушных шаров, идеи оформления и ответы на частые вопросы — с ссылками на
              каталог и коллекции ШАРОДУВЫ.
            </p>
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="blog-grid reveal">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
