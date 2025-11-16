import { markdownToHtml } from '@monorepo/markdown';
import Link from 'next/link';

import { getPage, getPages } from '$domains/article-page/api';
import { isSuccessResponse } from '$shared/api';
import { highlightHtml } from '$shared/ui/highlighter/highlight-server';
import { PageLayout } from '../_components/page-layout';

export default async function ArticlePagePage({ params }: { params: Promise<{ id: string; pageId: string }> }) {
  const { id: articleId, pageId } = await params;

  // サーバー側で並列データフェッチ（ISR有効）
  const [pagesResponse, pageResponse] = await Promise.all([getPages(articleId), getPage(articleId, pageId)]);

  // エラーハンドリング
  if (!isSuccessResponse(pagesResponse) || !isSuccessResponse(pageResponse)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 mb-4">ページの取得に失敗しました</div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 記事一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // MarkdownをHTMLに変換 + サーバー側でシンタックスハイライト
  const htmlWithoutHighlight = markdownToHtml(pageResponse.data.content);
  const html = highlightHtml(htmlWithoutHighlight);

  const page = {
    id: pageResponse.data.id,
    createdAt: pageResponse.data.createdAt,
    updatedAt: pageResponse.data.updatedAt,
    title: pageResponse.data.title,
    html,
    level: pageResponse.data.level,
    order: pageResponse.data.order,
  };

  return <PageLayout articleId={articleId} pageId={pageId} pages={pagesResponse.data.pages} page={page} />;
}
