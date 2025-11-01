import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CurrentUser } from '$decorators';
import { CreateUploadUrlCommand } from '$domains/media/commands';
import { CreateUploadUrlDto } from '$domains/media/dto';
import { SupabaseAuthGuard } from '$modules/auth/supabase-auth.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('upload')
  @UseGuards(SupabaseAuthGuard)
  createUploadUrl(@CurrentUser() user: Express.UserPayload, @Body() createUploadUrlDto: CreateUploadUrlDto) {
    return this.commandBus.execute(new CreateUploadUrlCommand(user.id, createUploadUrlDto));
  }
}
