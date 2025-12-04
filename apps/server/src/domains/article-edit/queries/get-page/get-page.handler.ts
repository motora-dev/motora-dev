import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPageResponseDto } from '$domains/article-edit/dto';
import { ArticleEditService } from '$domains/article-edit/services';
import { GetPageQuery } from './get-page.query';

@QueryHandler(GetPageQuery)
export class GetPageHandler implements IQueryHandler<GetPageQuery> {
  constructor(private readonly articleEditService: ArticleEditService) {}

  async execute(query: GetPageQuery): Promise<GetPageResponseDto> {
    const page = await this.articleEditService.getPage(query.userId, query.articleId, query.pageId);

    return {
      id: page.publicId,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      title: page.title,
      description: page.description,
      content: page.content,
      level: page.level,
      order: page.order,
    };
  }
}
