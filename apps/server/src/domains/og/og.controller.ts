import { Controller, Get, HttpCode, HttpStatus, Query, Res } from '@nestjs/common';

import { OgService } from './og.service';

@Controller('og')
export class OgController {
  constructor(private readonly ogService: OgService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getOgImage(
    @Query('title') title: string = 'No Title',
    @Query('tags') tagsParam: string = '',
    @Res() res: any,
  ): Promise<void> {
    const tags = tagsParam ? tagsParam.split(',').slice(0, 3) : [];

    const png = await this.ogService.generateOgImage({
      title: title.slice(0, 100),
      tags,
    });

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(png);
  }
}
