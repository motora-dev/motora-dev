import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetArticleListQuery } from '../impl/get-article-list.query';
import { ArticleListService } from '../../../providers/article-list.service';
import { GetArticleListResponse } from '../../dto/article-list.dto';

@QueryHandler(GetArticleListQuery)
export class GetArticleListHandler implements IQueryHandler<GetArticleListQuery> {
  constructor(private readonly articleListService: ArticleListService) {}

  async execute(): Promise<GetArticleListResponse> {
    return await this.articleListService.getArticleList();
  }
}
