import { ERROR_CODE } from '@monorepo/error-code';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { OAuth2Client } from 'google-auth-library';

import { BusinessLogicError } from '$exceptions';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class GoogleCloudAuthGuard implements CanActivate {
  private client: OAuth2Client;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.client = new OAuth2Client();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BusinessLogicError(ERROR_CODE.UNAUTHENTICATED, 'No bearer token provided');
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Accept multiple audiences from CORS origins
    const apiUrl = this.configService.get<string>('API_URL') || '';

    // Verify token - will throw if invalid
    await this.client
      .verifyIdToken({
        idToken: idToken,
        audience: apiUrl,
      })
      .catch(() => {
        throw new BusinessLogicError(ERROR_CODE.UNAUTHENTICATED, 'Invalid token');
      });

    return true;
  }
}
