import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';

import { createServerSupabase } from '@adapters';
import { Public } from '@decorators';

import { CreateUserCommand } from './commands/create-user/create-user.command';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  @Post('check-session')
  @HttpCode(HttpStatus.OK)
  async getSession(@Req() req: any, @Res() res: any) {
    const supabase = createServerSupabase(req, res);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return res.json({
      authenticated: !!session,
    });
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res() res: any) {
    // 直接Cookie情報を取得
    const sbCookieName = Object.keys(req.cookies).find(
      (name) => name.startsWith('sb-') && name.includes('-auth-token'),
    );

    if (sbCookieName) {
      // 既存のクッキーを削除
      res.clearCookie(sbCookieName);
      res.cookie(sbCookieName, '', {
        expires: new Date(0),
        maxAge: 0,
        httpOnly: true,
        path: '/',
      });
    }

    // 一般的なSupabase関連クッキーもクリア
    const otherPossibleCookies = ['sb-access-token', 'sb-refresh-token'];
    for (const name of otherPossibleCookies) {
      res.clearCookie(name);
      res.cookie(name, '', {
        expires: new Date(0),
        maxAge: 0,
        httpOnly: true,
        path: '/',
      });
    }

    // 明示的にレスポンスを返す
    return res.json({ success: true });
  }

  @Public()
  @Get('login/google')
  async googleLogin(@Req() req: any, @Res() res: any) {
    const supabase = createServerSupabase(req, res);

    const backendUrl = this.configService.get('API_URL') || '';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${backendUrl}/auth/callback/google`,
      },
    });
    if (error) throw new InternalServerErrorException(error.message);

    // data.url は Google 認証画面への 302 URL
    return res.redirect(data.url);
  }

  @Public()
  @Get('callback/google')
  @HttpCode(HttpStatus.OK)
  async callbackGoogle(@Req() req: any, @Res() res: any) {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send('missing code');
    }

    const supabase = createServerSupabase(req, res);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw new UnauthorizedException(error.message);
    }

    const { access_token, refresh_token, expires_in } = data.session;

    /** ② 既存の sb-access-token も残したい場合はそのまま */
    res.cookie('sb-access-token', access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
      maxAge: expires_in * 1000,
    });

    /** ② 既存の sb-refresh-token も残したい場合はそのまま */
    res.cookie('sb-refresh-token', refresh_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
      maxAge: expires_in * 1000,
    });

    await this.commandBus.execute(
      new CreateUserCommand(data.user.app_metadata.provider ?? '', data.user.id ?? '', data.user.email ?? ''),
    );

    const frontendUrl = this.configService.get('APP_URL') || '';
    return req.res.redirect(`${frontendUrl}/auth/callback`);
  }
}
