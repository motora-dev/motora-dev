import { ERROR_CODE } from '@monorepo/error-code';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

import { createServerSupabase } from '$adapters';
import { BusinessLogicError } from '$exceptions';
import { AuthRepository } from './repositories/auth.repository';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private authRepository: AuthRepository) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const supabase = createServerSupabase(req, res);

    /** ① access_token が無ければ未ログイン */
    const accessToken = req.cookies['sb-access-token'];
    const refreshToken = req.cookies['sb-refresh-token'];
    if (!accessToken) {
      throw new BusinessLogicError(ERROR_CODE.UNAUTHENTICATED);
    }

    /** ② JWT を検証 */
    const { data: userData, error } = await supabase.auth.getUser(accessToken);
    if (error) {
      throw new BusinessLogicError(ERROR_CODE.UNAUTHENTICATED, error.message);
    }

    /** ③ 期限が 5 分以内なら自動更新 */
    const payload: any = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8'));
    const in5min = payload.exp * 1000 - Date.now() < 5 * 60 * 1000;

    if (in5min && refreshToken) {
      const { data: ref, error: re } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      if (re) {
        throw new BusinessLogicError(ERROR_CODE.UNAUTHENTICATED, re.message);
      }

      // 新しいトークンを Cookie に上書き
      res.cookie('sb-access-token', ref.session?.access_token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false,
        maxAge: ref.session?.expires_in ? ref.session.expires_in * 1000 : 0,
      });
    }

    const user = await this.authRepository.getUserByProvider(
      userData.user.app_metadata.provider ?? '',
      userData.user.id,
    );

    req.user = {
      id: user?.id ?? 0,
      publicId: user?.publicId ?? 'unknown',
    };

    return true;
  }
}
