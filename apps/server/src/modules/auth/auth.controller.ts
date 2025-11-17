import { ERROR_CODE } from '@monorepo/error-code';
import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';

import { createServerSupabase } from '$adapters';
import { Public } from '$decorators';
import { CreateUserCommand } from '$domains/user/commands';
import { BusinessLogicError } from '$exceptions';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  @Public()
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res() res: any) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get('COOKIE_DOMAIN') || '';

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
      secure: isProd, // callbackGoogleの実装に合わせる
      domain: cookieDomain,
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
  async googleLogin(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const supabase = createServerSupabase(req, res);

    // リクエストから自分自身のURLを構築
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host'); // api.motora-dev.com or api.preview.motora-dev.com
    const backendUrl = `${protocol}://${host}`;
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
  async callbackGoogle(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get('COOKIE_DOMAIN') || '';
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send('missing code');
    }

    const supabase = createServerSupabase(req, res);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw new BusinessLogicError(ERROR_CODE.UNAUTHORIZED, error.message);
    }

    const { access_token, refresh_token, expires_in } = data.session;

    res.cookie('sb-access-token', access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      maxAge: expires_in * 1000,
      domain: cookieDomain,
    });

    res.cookie('sb-refresh-token', refresh_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      maxAge: expires_in * 1000,
      domain: cookieDomain,
    });

    // GETリクエストでDBを更新するアーキテクチャはNGなので後で修正する
    await this.commandBus.execute(
      new CreateUserCommand(data.user.app_metadata.provider ?? '', data.user.id ?? '', data.user.email ?? '', ''),
    );

    // Referer/Originからフロントエンドのドメインを取得
    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
    const frontendUrl = origin && this.isAllowedOrigin(origin) ? origin : '';
    res.writeHead(302, { Location: `${frontendUrl}/auth/callback` });
    res.end();
  }

  private isAllowedOrigin(url: string): boolean {
    const urlOrigin = new URL(url).origin;
    const domain = this.configService.get<string>('DOMAIN') || '';

    // 許可するパターン
    const allowedPatterns = [
      // ローカル開発
      'http://localhost:3000',
      // メインドメイン: https://motora-dev.com
      `https://${domain}`,
      // 任意のサブドメイン: https://*.motora-dev.com
      new RegExp(`^https://[a-z0-9-]+\\.${domain.replace('.', '\\.')}$`),
      // Vercelプレビュー: https://motora-dev-*.vercel.app
      new RegExp(`^https://${domain.split('.')[0]}-[a-z0-9-]+\\.vercel\\.app$`),
    ];

    return allowedPatterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(urlOrigin);
      }
      return urlOrigin === pattern;
    });
  }
}
