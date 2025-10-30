import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';

import { UpdateArticleCommand } from './update-article.command';
import { UpdateArticleResponseDto } from '../../dto';
import { ArticleEditService } from '../../services';

@CommandHandler(UpdateArticleCommand)
export class UpdateArticleHandler implements ICommandHandler<UpdateArticleCommand> {
  constructor(private readonly articleEditService: ArticleEditService) {}

  async execute(query: UpdateArticleCommand): Promise<UpdateArticleResponseDto> {
    return await this.articleEditService.updateArticle(query.articleId, query.title, query.tags);
  }
}
