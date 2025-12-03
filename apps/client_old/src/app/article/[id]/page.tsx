import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getPages } from '$domains/article-page/api/get-pages.api';
import { isSuccessResponse } from '$shared/api/api-response';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: articleId } = await params;
  const response = await getPages(articleId);

  if (!isSuccessResponse(response)) {
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

  const pagesData = response.data;

  if (!pagesData || pagesData.pages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 mb-4">ページが見つかりません</div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 記事一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // order最小のページにリダイレクト
  const firstPage = pagesData.pages.reduce((min, page) => (page.order < min.order ? page : min), pagesData.pages[0]);

  redirect(`/article/${articleId}/${firstPage.id}`);
}
