import { extractTableOfContents, markdownToHtml } from '@monorepo/markdown';
import { Metadata } from 'next';
import Link from 'next/link';

import { getPage, getPages } from '$domains/article-page/api';
import { isSuccessResponse } from '$shared/api';
import { highlightHtml } from '$shared/ui/highlighter/highlight-server';
import { PageLayout } from '../_components/page-layout';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>;
}): Promise<Metadata> {
  const { id: articleId, pageId } = await params;
  const pageResponse = await getPage(articleId, pageId);

  if (!isSuccessResponse(pageResponse)) {
    return {
      title: 'ページが見つかりません',
    };
  }

  const { title, content } = pageResponse.data;
  // 本文の最初の100文字をdescriptionとして使用（Markdown記号除去などは簡易的）
  const description = content.slice(0, 120).replace(/[#*`\[\]]/g, '') + '...';

  return {
    title: `${title} | もとら's dev`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200'}/article/${articleId}/${pageId}`,
    },
  };
}

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

  // 目次を抽出
  const toc = extractTableOfContents(pageResponse.data.content);

  const page = {
    id: pageResponse.data.id,
    createdAt: pageResponse.data.createdAt,
    updatedAt: pageResponse.data.updatedAt,
    title: pageResponse.data.title,
    html,
    level: pageResponse.data.level,
    order: pageResponse.data.order,
  };

  return <PageLayout articleId={articleId} pageId={pageId} pages={pagesResponse.data.pages} page={page} toc={toc} />;
}
