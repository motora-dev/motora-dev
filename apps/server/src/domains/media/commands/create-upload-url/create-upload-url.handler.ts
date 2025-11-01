import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MediaService } from '$domains/media/services';
import { CreateUploadUrlCommand } from './create-upload-url.command';

@CommandHandler(CreateUploadUrlCommand)
export class CreateUploadUrlHandler implements ICommandHandler<CreateUploadUrlCommand> {
  constructor(private readonly service: MediaService) {}

  async execute(command: CreateUploadUrlCommand) {
    return this.service.createUploadUrl(command.userId, command.createUploadUrlDto);
  }
}
