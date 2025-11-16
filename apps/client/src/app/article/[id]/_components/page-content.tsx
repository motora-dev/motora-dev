import { PageDto } from '$domains/article-page';
import { LowlightHighlighter } from '$shared/ui/highlighter/lowlight-highlighter';

interface PageContentProps {
  page: PageDto;
}

export function PageContent({ page }: PageContentProps) {
  return (
    <article className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">{page.title}</h1>
      <div className="prose prose-lg max-w-none">
        <LowlightHighlighter html={page.html} />
      </div>
    </article>
  );
}
