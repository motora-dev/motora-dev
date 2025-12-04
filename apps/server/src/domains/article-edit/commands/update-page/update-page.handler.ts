import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';

import { UpdatePageResponseDto } from '$domains/article-edit/dto';
import { ArticleEditService } from '$domains/article-edit/services';
import { UpdatePageCommand } from './update-page.command';

@CommandHandler(UpdatePageCommand)
export class UpdatePageHandler implements ICommandHandler<UpdatePageCommand> {
  constructor(private readonly articleEditService: ArticleEditService) {}

  async execute(command: UpdatePageCommand): Promise<UpdatePageResponseDto> {
    const page = await this.articleEditService.updatePage(
      command.userId,
      command.articleId,
      command.pageId,
      command.title,
      command.description,
      command.content,
    );

    return {
      id: page.publicId,
      title: page.title,
      description: page.description,
      content: page.content,
      level: page.level,
      order: page.order,
    };
  }
}
