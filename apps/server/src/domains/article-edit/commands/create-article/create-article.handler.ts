import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CreateArticleCommand } from './create-article.command';
import { CreateArticleResponseDto } from '../../dto';
import { ArticleEditService } from '../../services';

@QueryHandler(CreateArticleCommand)
export class CreateArticleHandler implements IQueryHandler<CreateArticleCommand> {
  constructor(private readonly articleEditService: ArticleEditService) {}

  async execute(command: CreateArticleCommand): Promise<CreateArticleResponseDto> {
    return await this.articleEditService.createArticle(command.userId);
  }
}
