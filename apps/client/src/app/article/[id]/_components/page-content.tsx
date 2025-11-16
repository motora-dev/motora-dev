import { PageDto } from '$domains/article-page';

interface PageContentProps {
  page: PageDto;
}

export function PageContent({ page }: PageContentProps) {
  return (
    <article className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">{page.title}</h1>
      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: page.html }} />
    </article>
  );
}
