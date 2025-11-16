import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPagesQuery } from './get-pages.query';
import { GetPagesResponse } from '../../dto';
import { ArticlePageService } from '../../services';

@QueryHandler(GetPagesQuery)
export class GetPagesHandler implements IQueryHandler<GetPagesQuery> {
  constructor(private readonly articlePageService: ArticlePageService) {}

  async execute(query: GetPagesQuery): Promise<GetPagesResponse> {
    const pages = await this.articlePageService.getPages(query.articleId);

    return {
      pages: pages.map((page) => ({
        id: page.publicId,
        title: page.title,
        level: page.level,
        order: page.order,
      })),
    };
  }
}
