import { PageDto } from '$domains/article-page';

interface PageContentProps {
  page: PageDto;
}

export function PageContent({ page }: PageContentProps) {
  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-8 pt-16 lg:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gray-900">{page.title}</h1>
      <div
        className="w-full prose prose-base max-w-none break-words overflow-hidden"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </article>
  );
}
