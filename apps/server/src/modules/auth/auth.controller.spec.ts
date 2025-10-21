import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';

// Supabase factoryとそのモックの作成
const mockSupabaseAuth = {
  signInWithOAuth: jest.fn().mockResolvedValue({
    data: { url: 'https://accounts.google.com/oauth' },
    error: null,
  }),
  exchangeCodeForSession: jest.fn().mockResolvedValue({
    data: {
      session: {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
      },
      user: { app_metadata: { provider: 'google' }, id: 'test-google-id' },
    },
    error: null,
  }),
  getSessionFromUrl: jest.fn().mockResolvedValue({
    data: {
      session: {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      },
      user: { id: 'test-microsoft-id' },
    },
    error: null,
  }),
  setSession: jest.fn().mockResolvedValue({ data: {}, error: null }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
};

// Supabase factoryのモック
jest.mock('@adapters', () => ({
  createServerSupabase: jest.fn().mockImplementation(() => ({
    auth: mockSupabaseAuth,
  })),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let configService: ConfigService;

  const mockCommandBus = {
    execute: jest.fn().mockResolvedValue({}),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'APP_URL') return 'http://localhost:4200';
      if (key === 'API_URL') return 'http://localhost:3000';
      return undefined;
    }),
  };

  const mockAuthService = {
    validateSupabaseToken: jest.fn().mockResolvedValue(true),
    findOrCreateUserByMicrosoftId: jest.fn().mockResolvedValue({}),
  };

  const mockAuthRepository = {
    findUserBySupabaseId: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    getUserByProvider: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthRepository, useValue: mockAuthRepository },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    configService = module.get<ConfigService>(ConfigService);

    // モックのリセット
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSession', () => {
    it('should return authenticated status when session exists', async () => {
      const mockReq = {};
      const mockRes = {
        json: jest.fn().mockReturnThis(),
      };

      // セッションが存在する場合をモック
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null,
          }),
        },
      };

      const { createServerSupabase } = jest.requireMock('@adapters');
      createServerSupabase.mockReturnValueOnce(mockSupabase);

      await controller.getSession(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ authenticated: true });
    });

    it('should return authenticated false when no session exists', async () => {
      const mockReq = {};
      const mockRes = {
        json: jest.fn().mockReturnThis(),
      };

      // セッションが存在しない場合をモック
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: null,
          }),
        },
      };

      const { createServerSupabase } = jest.requireMock('@adapters');
      createServerSupabase.mockReturnValueOnce(mockSupabase);

      await controller.getSession(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ authenticated: false });
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success', async () => {
      const req = {
        cookies: {
          'sb-pyaguolppuexojrepyxo-auth-token': 'test-token',
          'some-other-cookie': 'test-value',
        },
      };

      const res = {
        clearCookie: jest.fn(),
        cookie: jest.fn(),
        json: jest.fn().mockReturnValue({ success: true }),
      };

      const result = await controller.logout(req, res);

      // クッキーの削除とリセットが呼ばれることを確認
      expect(res.clearCookie).toHaveBeenCalledWith('sb-pyaguolppuexojrepyxo-auth-token');
      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(result).toEqual({ success: true });
    });

    it('should handle when no sb cookies exist', async () => {
      const req = {
        cookies: {
          'some-other-cookie': 'test-value',
        },
      };

      const res = {
        clearCookie: jest.fn(),
        cookie: jest.fn(),
        json: jest.fn().mockReturnValue({ success: true }),
      };

      const result = await controller.logout(req, res);

      // sb-のクッキーがなくても一般的なSupabaseクッキーのクリアが呼ばれる
      expect(res.clearCookie).toHaveBeenCalledWith('sb-access-token');
      expect(res.clearCookie).toHaveBeenCalledWith('sb-refresh-token');
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(result).toEqual({ success: true });
    });

    it('should handle when cookies is empty', async () => {
      const req = {
        cookies: {},
      };

      const res = {
        clearCookie: jest.fn(),
        cookie: jest.fn(),
        json: jest.fn().mockReturnValue({ success: true }),
      };

      const result = await controller.logout(req, res);

      // クッキーがなくても一般的なSupabaseクッキーのクリアが呼ばれる
      expect(res.clearCookie).toHaveBeenCalledWith('sb-access-token');
      expect(res.clearCookie).toHaveBeenCalledWith('sb-refresh-token');
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(result).toEqual({ success: true });
    });
  });

  describe('googleLogin', () => {
    it('should redirect to Google OAuth URL', async () => {
      const mockReq = {};
      const mockRes = {
        redirect: jest.fn(),
      };

      mockSupabaseAuth.signInWithOAuth.mockResolvedValueOnce({
        data: { url: 'https://accounts.google.com/oauth' },
        error: null,
      });

      await controller.googleLogin(mockReq, mockRes);

      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback/google',
        },
      });
      expect(mockRes.redirect).toHaveBeenCalledWith('https://accounts.google.com/oauth');
    });

    it('should handle undefined API_URL', async () => {
      // BACKEND_URLが未定義の場合をモック
      jest.spyOn(configService, 'get').mockReturnValueOnce(null);

      const mockReq = {};
      const mockRes = {
        redirect: jest.fn(),
      };

      mockSupabaseAuth.signInWithOAuth.mockResolvedValueOnce({
        data: { url: 'https://accounts.google.com/oauth' },
        error: null,
      });

      await controller.googleLogin(mockReq, mockRes);

      // API_URLが空文字列になるケースをテスト
      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: '/auth/callback/google', // 空文字列と結合
        },
      });
      expect(mockRes.redirect).toHaveBeenCalledWith('https://accounts.google.com/oauth');
    });

    it('should throw InternalServerErrorException when OAuth fails', async () => {
      const mockReq = {};
      const mockRes = {
        redirect: jest.fn(),
      };

      mockSupabaseAuth.signInWithOAuth.mockResolvedValueOnce({
        data: null,
        error: { message: 'OAuth error' },
      });

      await expect(controller.googleLogin(mockReq, mockRes)).rejects.toThrow(InternalServerErrorException);
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });
  });

  describe('callbackGoogle', () => {
    it('should exchange code for session and set cookies', async () => {
      const { createServerSupabase } = jest.requireMock('@adapters');

      // セッションデータを事前に設定
      mockSupabaseAuth.exchangeCodeForSession.mockResolvedValueOnce({
        data: {
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
          },
          user: { id: 'test-google-id', app_metadata: { provider: 'google' }, email: 'test@gmail.com' },
        },
        error: null,
      });

      const mockReq = {
        query: { code: 'test-code' },
        res: { redirect: jest.fn() },
      };

      const mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.callbackGoogle(mockReq, mockRes);

      expect(createServerSupabase).toHaveBeenCalled();
      expect(mockSupabaseAuth.exchangeCodeForSession).toHaveBeenCalledWith('test-code');
      expect(mockRes.cookie).toHaveBeenCalledWith('sb-access-token', 'test-access-token', expect.any(Object));
      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          sub: 'test-google-id',
          email: 'test@gmail.com',
        }),
      );
      expect(mockReq.res.redirect).toHaveBeenCalledWith(`http://localhost:4200/auth/callback`);
    });

    it('should handle undefined APP_URL in callbackGoogle', async () => {
      // FRONTEND_URLが未定義の場合をモック
      jest.spyOn(configService, 'get').mockReturnValueOnce(null);

      mockSupabaseAuth.exchangeCodeForSession.mockResolvedValueOnce({
        data: {
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
          },
          user: { id: 'test-google-id', app_metadata: { provider: 'google' }, email: 'test@gmail.com' },
        },
        error: null,
      });

      const mockReq = {
        query: { code: 'test-code' },
        res: { redirect: jest.fn() },
      };

      const mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.callbackGoogle(mockReq, mockRes);

      // APP_URLが空文字列の場合をテスト
      expect(mockReq.res.redirect).toHaveBeenCalledWith('/auth/callback');
    });

    it('should return 400 when code is missing', async () => {
      const mockReq = {
        query: {},
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.callbackGoogle(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('missing code');
    });

    it('should throw UnauthorizedException when code exchange fails', async () => {
      const mockReq = {
        query: { code: 'invalid-code' },
      };

      const mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      };

      // エラーをモックする
      mockSupabaseAuth.exchangeCodeForSession.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid code' },
      });

      await expect(controller.callbackGoogle(mockReq, mockRes)).rejects.toThrow(UnauthorizedException);
      expect(mockSupabaseAuth.exchangeCodeForSession).toHaveBeenCalledWith('invalid-code');
      expect(mockRes.cookie).not.toHaveBeenCalled();
      expect(mockCommandBus.execute).not.toHaveBeenCalled();
    });
  });
});
