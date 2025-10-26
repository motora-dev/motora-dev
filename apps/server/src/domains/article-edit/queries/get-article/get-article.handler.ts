import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetArticleQuery } from './get-article.query';
import { GetArticleResponseDto } from '../../dto';
import { ArticleEditService } from '../../services';

@QueryHandler(GetArticleQuery)
export class GetArticleHandler implements IQueryHandler<GetArticleQuery> {
  constructor(private readonly articleEditService: ArticleEditService) {}

  async execute(query: GetArticleQuery): Promise<GetArticleResponseDto> {
    return await this.articleEditService.getArticle(query.articleId);
  }
}
