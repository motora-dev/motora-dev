import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { OAuth2Client } from 'google-auth-library';

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
      throw new UnauthorizedException('No bearer token provided');
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Accept multiple audiences from CORS origins
    const corsOrigins = this.configService.get<string>('CORS_ORIGINS') || '';
    const validAudiences = corsOrigins
      .split(',')
      .map((origin: string) => origin.trim())
      .filter((origin: string) => origin.length > 0);

    console.log('🔍 Verifying token with audiences:', validAudiences);

    // Verify token - will throw if invalid
    await this.client
      .verifyIdToken({
        idToken: idToken,
        audience: validAudiences,
      })
      .then(() => {
        console.log('✅ Token verified');
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid token');
      });

    return true;
  }
}
