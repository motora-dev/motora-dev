import { ICommand } from '@nestjs/cqrs';

import { CreateUploadUrlDto } from '$domains/media/dto';

export class CreateUploadUrlCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly createUploadUrlDto: CreateUploadUrlDto,
  ) {}
}
