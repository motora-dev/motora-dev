import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

// Mock @adapters to avoid redefining properties on the actual module
jest.mock('@adapters', () => ({
  createServerSupabase: jest.fn(),
}));
import * as supabaseFactory from '@adapters';
import { AuthRepository } from '@modules/auth/repositories/auth.repository';

import { SupabaseAuthGuard } from './supabase-auth.guard';

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;
  let mockExecutionContext: ExecutionContext;
  let mockSupabase: any;
  let mockRequest: any;
  let mockResponse: any;
  let consoleLogSpy: jest.SpyInstance;

  const mockAuthRepository = {
    getUserByProvider: jest.fn(),
    findUserBySupabaseId: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  };

  beforeEach(async () => {
    // console.logの出力を抑制
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseAuthGuard, { provide: AuthRepository, useValue: mockAuthRepository }],
    }).compile();

    guard = module.get<SupabaseAuthGuard>(SupabaseAuthGuard);

    // モックの準備
    mockRequest = {
      cookies: {},
      headers: { 'x-request-id': 'test-request-id' },
      user: undefined,
    };

    mockResponse = {
      cookie: jest.fn(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ExecutionContext;

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        refreshSession: jest.fn(),
      },
    };

    // use defineProperty only once; if already mocked, just set mock implementation
    // If already mocked elsewhere, just override implementation
    (supabaseFactory as any).createServerSupabase.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when access token is missing', async () => {
    mockRequest.cookies = {}; // アクセストークンなし

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when JWT validation fails', async () => {
    mockRequest.cookies = { 'sb-access-token': 'invalid-token' };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: null,
      error: { message: 'Invalid JWT' },
    });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('invalid-token');
  });

  it('should set user and return true when token is valid', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: { provider: 'email' },
    };

    const mockDbUser = {
      id: 1,
      publicId: 'user-public-id-123',
      name: 'Test User',
      userNumber: 1,
    };

    // JWTペイロードが5分以上有効な場合のトークン
    const validToken =
      'header.' +
      Buffer.from(JSON.stringify({ exp: Math.floor((Date.now() + 10 * 60 * 1000) / 1000) })).toString('base64url') +
      '.signature';

    mockRequest.cookies = { 'sb-access-token': validToken };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockAuthRepository.getUserByProvider.mockResolvedValue(mockDbUser);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({ id: 'user-public-id-123' });
    expect(mockSupabase.auth.refreshSession).not.toHaveBeenCalled();
    expect(mockAuthRepository.getUserByProvider).toHaveBeenCalledWith('email', '123');
  });

  it('should refresh token when expiration is within 5 minutes', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: { provider: 'email' },
    };

    const mockDbUser = {
      id: 1,
      publicId: 'user-public-id-123',
      name: 'Test User',
      userNumber: 1,
    };

    // JWTペイロードが5分以内に期限切れになるトークン
    const expiringToken =
      'header.' +
      Buffer.from(JSON.stringify({ exp: Math.floor((Date.now() + 4 * 60 * 1000) / 1000) })).toString('base64url') +
      '.signature';

    mockRequest.cookies = {
      'sb-access-token': expiringToken,
      'sb-refresh-token': 'refresh-token',
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockAuthRepository.getUserByProvider.mockResolvedValue(mockDbUser);

    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'new-access-token',
          expires_in: 3600,
        },
      },
      error: null,
    });

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({ id: 'user-public-id-123' });
    expect(mockSupabase.auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    });
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'sb-access-token',
      'new-access-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        maxAge: 3600 * 1000,
      }),
    );
  });

  it('should handle refresh session with null session', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: { provider: 'email' },
    };

    const mockDbUser = {
      id: 1,
      publicId: 'user-public-id-123',
      name: 'Test User',
      userNumber: 1,
    };

    // JWTペイロードが5分以内に期限切れになるトークン
    const expiringToken =
      'header.' +
      Buffer.from(JSON.stringify({ exp: Math.floor((Date.now() + 4 * 60 * 1000) / 1000) })).toString('base64url') +
      '.signature';

    mockRequest.cookies = {
      'sb-access-token': expiringToken,
      'sb-refresh-token': 'refresh-token',
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockAuthRepository.getUserByProvider.mockResolvedValue(mockDbUser);

    // sessionがnullのケースをテスト
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({ id: 'user-public-id-123' });
    expect(mockSupabase.auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    });
    // sessionがnullなので、maxAgeは0になる
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'sb-access-token',
      undefined,
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        maxAge: 0,
      }),
    );
  });

  it('should handle refresh session with undefined expires_in', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: { provider: 'email' },
    };

    const mockDbUser = {
      id: 1,
      publicId: 'user-public-id-123',
      name: 'Test User',
      userNumber: 1,
    };

    // JWTペイロードが5分以内に期限切れになるトークン
    const expiringToken =
      'header.' +
      Buffer.from(JSON.stringify({ exp: Math.floor((Date.now() + 4 * 60 * 1000) / 1000) })).toString('base64url') +
      '.signature';

    mockRequest.cookies = {
      'sb-access-token': expiringToken,
      'sb-refresh-token': 'refresh-token',
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockAuthRepository.getUserByProvider.mockResolvedValue(mockDbUser);

    // expires_inがundefinedのケースをテスト
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'new-access-token',
          // expires_inがない
        },
      },
      error: null,
    });

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({ id: 'user-public-id-123' });
    expect(mockSupabase.auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    });
    // expires_inがundefinedなので、maxAgeは0になる
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'sb-access-token',
      'new-access-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        maxAge: 0,
      }),
    );
  });

  it('should throw UnauthorizedException when refresh token fails', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: { provider: 'email' },
    };

    // JWTペイロードが5分以内に期限切れになるトークン
    const expiringToken =
      'header.' +
      Buffer.from(JSON.stringify({ exp: Math.floor((Date.now() + 4 * 60 * 1000) / 1000) })).toString('base64url') +
      '.signature';

    mockRequest.cookies = {
      'sb-access-token': expiringToken,
      'sb-refresh-token': 'refresh-token',
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: null,
      error: { message: 'Invalid refresh token' },
    });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    expect(mockSupabase.auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    });
  });

  it('should handle user with null provider and email', async () => {
    const mockUser = {
      id: '123',
      email: null,
      app_metadata: { provider: null },
    };

    const mockDbUser = {
      id: 1,
      publicId: 'user-public-id-123',
      name: 'Test User',
      userNumber: 1,
    };

    const validToken =
      'header.' +
      Buffer.from(JSON.stringify({ exp: Math.floor((Date.now() + 10 * 60 * 1000) / 1000) })).toString('base64url') +
      '.signature';

    mockRequest.cookies = { 'sb-access-token': validToken };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockAuthRepository.getUserByProvider.mockResolvedValue(mockDbUser);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({ id: 'user-public-id-123' });
    expect(mockAuthRepository.getUserByProvider).toHaveBeenCalledWith('', '123');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logData.email).toBe('');
    expect(logData.provider).toBe('');
  });

  it('should handle user not found in database', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: { provider: 'email' },
    };

    const validToken =
      'header.' +
      Buffer.from(JSON.stringify({ exp: Math.floor((Date.now() + 10 * 60 * 1000) / 1000) })).toString('base64url') +
      '.signature';

    mockRequest.cookies = { 'sb-access-token': validToken };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockAuthRepository.getUserByProvider.mockResolvedValue(null); // User not found

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({ id: '' }); // Empty string when user not found

    expect(consoleLogSpy).toHaveBeenCalled();
    const logData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logData.userId).toBe('');
  });

  it('should handle request without x-request-id header', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: { provider: 'email' },
    };

    const mockDbUser = {
      id: 1,
      publicId: 'user-public-id-123',
      name: 'Test User',
      userNumber: 1,
    };

    const validToken =
      'header.' +
      Buffer.from(JSON.stringify({ exp: Math.floor((Date.now() + 10 * 60 * 1000) / 1000) })).toString('base64url') +
      '.signature';

    mockRequest.headers = {}; // No x-request-id header
    mockRequest.cookies = { 'sb-access-token': validToken };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockAuthRepository.getUserByProvider.mockResolvedValue(mockDbUser);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);

    expect(consoleLogSpy).toHaveBeenCalled();
    const logData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logData.requestId).toBe('unknown');
  });

  it('should handle user with missing app_metadata', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: {}, // Empty app_metadata
    };

    const mockDbUser = {
      id: 1,
      publicId: 'user-public-id-123',
      name: 'Test User',
      userNumber: 1,
    };

    const validToken =
      'header.' +
      Buffer.from(JSON.stringify({ exp: Math.floor((Date.now() + 10 * 60 * 1000) / 1000) })).toString('base64url') +
      '.signature';

    mockRequest.cookies = { 'sb-access-token': validToken };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockAuthRepository.getUserByProvider.mockResolvedValue(mockDbUser);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockAuthRepository.getUserByProvider).toHaveBeenCalledWith('', '123');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logData.provider).toBe('');
  });
});
