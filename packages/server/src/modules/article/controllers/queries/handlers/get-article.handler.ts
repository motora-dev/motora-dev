import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetArticleQuery } from '../impl/get-article.query';
import { GetArticleResponse } from '../../dto/article.dto';
import { ArticleService } from '@modules/article/providers/article.service';

@QueryHandler(GetArticleQuery)
export class GetArticleHandler implements IQueryHandler<GetArticleQuery> {
  constructor(private readonly articleService: ArticleService) {}

  async execute(query: GetArticleQuery): Promise<GetArticleResponse> {
    return await this.articleService.getArticle(query.articleId);
  }
}
