import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPagesResponseDto } from '$domains/article-edit/dto';
import { ArticleEditService } from '$domains/article-edit/services';
import { GetPagesQuery } from './get-pages.query';

@QueryHandler(GetPagesQuery)
export class GetPagesHandler implements IQueryHandler<GetPagesQuery> {
  constructor(private readonly articleEditService: ArticleEditService) {}

  async execute(query: GetPagesQuery): Promise<GetPagesResponseDto> {
    const pages = await this.articleEditService.getPages(query.userId, query.articleId);

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
