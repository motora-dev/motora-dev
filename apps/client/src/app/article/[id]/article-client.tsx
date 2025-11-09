'use client';
import { useArticleQuery } from '$domains/article';
import { LowlightHighlighter } from '$shared/ui/highlighter/lowlight-highlighter';

export function ArticleClient({ id }: { id: string }) {
  const { data } = useArticleQuery(id);

  if (!data) return null;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">{data.title}</h1>
      <LowlightHighlighter html={data.html} />
    </>
  );
}
