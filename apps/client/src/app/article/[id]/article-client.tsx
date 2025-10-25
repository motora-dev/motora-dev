'use client';

import { useArticleQuery } from '@domains/article';
import { PrismHighlighter } from '@shared/ui/prism-highlighter';

export function ArticleClient({ id }: { id: string }) {
  const { data } = useArticleQuery(id);

  if (!data) return null;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">{data.title}</h1>
      <PrismHighlighter html={data.html} />
    </>
  );
}
