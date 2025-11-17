import { PageDto } from '$domains/article-page';

interface PageContentProps {
  page: PageDto;
}

export function PageContent({ page }: PageContentProps) {
  return (
    <article className="max-w-4xl lg:pl-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gray-900">{page.title}</h1>
      <div className="prose prose-base md:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: page.html }} />
    </article>
  );
}
