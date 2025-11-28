import Link from 'next/link';

import { ArticleDto } from '../model/article-list.schema';

interface ArticleCardProps {
  article: ArticleDto;
}

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-xl p-5 md:p-6 relative transition-shadow duration-300 cursor-pointer">
      <Link href={`/article/${article.id}`} className="absolute inset-0 z-10" />
      <div className="relative pointer-events-none">
        <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 truncate">{article.title}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-sm">
          <time className="text-gray-600">{formatDate(article.createdAt)}</time>
          <span className="text-blue-600 font-medium">続きを読む →</span>
        </div>
      </div>
    </article>
  );
}
