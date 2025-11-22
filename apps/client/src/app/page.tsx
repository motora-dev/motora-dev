import { getArticleList } from '$domains/article-list/api/get-article-list.api';
import { ArticleCard } from '$domains/article-list/components/article-card';
import { isSuccessResponse } from '$shared/api';

export default async function HomePage() {
  const response = await getArticleList();

  if (!isSuccessResponse(response)) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 md:mb-10 lg:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">記事一覧</h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">技術記事やチュートリアルを掲載しています</p>
        </div>
        <div className="text-center py-16 md:py-20 lg:py-24 bg-gray-50 rounded-lg">
          <p className="text-base md:text-lg text-gray-600">記事の取得に失敗しました</p>
        </div>
      </main>
    );
  }

  const { articleList } = response.data;

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8 md:mb-10 lg:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">記事一覧</h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-600">技術記事やチュートリアルを掲載しています</p>
      </div>

      {articleList.length === 0 ? (
        <div className="text-center py-16 md:py-20 lg:py-24 bg-gray-50 rounded-lg">
          <p className="text-base md:text-lg text-gray-600">記事がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {articleList.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
