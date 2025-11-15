import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetArticleResponseDto } from '$domains/article-edit/dto';
import { ArticleEditService } from '$domains/article-edit/services';
import { GetArticleQuery } from './get-article.query';

@QueryHandler(GetArticleQuery)
export class GetArticleHandler implements IQueryHandler<GetArticleQuery> {
  constructor(private readonly articleEditService: ArticleEditService) {}

  async execute(query: GetArticleQuery): Promise<GetArticleResponseDto> {
    const article = await this.articleEditService.getArticle(query.userId, query.articleId);
    return { id: article.publicId, title: article.title, tags: article.tags, description: article.description ?? '' };
  }
}
