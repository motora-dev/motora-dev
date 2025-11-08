import { ERROR_CODE } from '@monorepo/error-code';
import { Controller, Get, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';

import { createServerSupabase } from '$adapters';
import { Public } from '$decorators';
import { BusinessLogicError } from '$exceptions';
import { CreateUserCommand } from './commands/create-user/create-user.command';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  @Get('check-session')
  @HttpCode(HttpStatus.OK)
  async getSession(@Req() req: any, @Res() res: any) {
    const accessToken = req.cookies['sb-access-token'];

    if (!accessToken) {
      return res.json({ authenticated: false });
    }

    const supabase = createServerSupabase(req, res);
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);

    return res.json({
      authenticated: !!user,
    });
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res() res: any) {
    const supabase = createServerSupabase(req, res);
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new BusinessLogicError(ERROR_CODE.INTERNAL_SERVER_ERROR, error.message);
    }

    // callbackGoogleで設定したオプションと完全に同じオプションでCookieをクリア
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false, // callbackGoogleの実装に合わせる
    };
    // 一般的なSupabase関連クッキーもクリア
    const cookiesToClear = ['sb-access-token', 'sb-refresh-token'];
    for (const name of cookiesToClear) {
      // `expires`を過去日に設定するか、`maxAge`を0に設定することで削除
      res.cookie(name, '', { ...cookieOptions, maxAge: 0 });
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

    if (error) {
      throw new BusinessLogicError(ERROR_CODE.INTERNAL_SERVER_ERROR, error.message);
    }

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
      throw new BusinessLogicError(ERROR_CODE.UNAUTHENTICATED, error.message);
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
