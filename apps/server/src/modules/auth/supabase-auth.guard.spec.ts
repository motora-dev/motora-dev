import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { vi, type MockInstance } from 'vitest';

import { BusinessLogicError } from '$exceptions';
import { AuthRepository } from '$modules/auth/repositories/auth.repository';

// ESMモードでのモック設定
const mockCreateServerSupabase = vi.fn();
vi.mock('$adapters', () => ({
  createServerSupabase: mockCreateServerSupabase,
}));

// 動的インポート（モック設定後に実行）
const { SupabaseAuthGuard } = await import('./supabase-auth.guard');

describe('SupabaseAuthGuard', () => {
  let guard: InstanceType<typeof SupabaseAuthGuard>;
  let mockExecutionContext: ExecutionContext;
  let mockSupabase: any;
  let mockRequest: any;
  let mockResponse: any;
  let consoleLogSpy: MockInstance;

  const mockAuthRepository = {
    getUserByProvider: vi.fn(),
    findUserBySupabaseId: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
  } as unknown as AuthRepository;

  const mockConfigService = {
    get: vi.fn().mockReturnValue('development'),
  } as unknown as ConfigService;

  beforeEach(() => {
    // console.logの出力を抑制
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // 直接インスタンス化
    guard = new SupabaseAuthGuard(mockAuthRepository, mockConfigService);

    // モックの準備
    mockRequest = {
      cookies: {},
      headers: { 'x-request-id': 'test-request-id' },
      user: undefined,
    };

    mockResponse = {
      cookie: vi.fn(),
    };

    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ExecutionContext;

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
        refreshSession: vi.fn(),
      },
    };

    // モック関数の戻り値を設定
    mockCreateServerSupabase.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw BusinessLogicError when access token is missing', async () => {
    mockRequest.cookies = {}; // アクセストークンなし

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(BusinessLogicError);
    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
  });

  it('should throw BusinessLogicError when JWT validation fails', async () => {
    mockRequest.cookies = { 'sb-access-token': 'invalid-token' };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: null,
      error: { message: 'Invalid JWT' },
    });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(BusinessLogicError);
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
    vi.mocked(mockAuthRepository.getUserByProvider).mockResolvedValue(mockDbUser as any);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(mockDbUser);
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
    vi.mocked(mockAuthRepository.getUserByProvider).mockResolvedValue(mockDbUser as any);

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
    expect(mockRequest.user).toEqual(mockDbUser);
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
    vi.mocked(mockAuthRepository.getUserByProvider).mockResolvedValue(mockDbUser as any);

    // sessionがnullのケースをテスト
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(mockDbUser);
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
    vi.mocked(mockAuthRepository.getUserByProvider).mockResolvedValue(mockDbUser as any);

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
    expect(mockRequest.user).toEqual(mockDbUser);
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

  it('should throw BusinessLogicError when refresh token fails', async () => {
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

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(BusinessLogicError);
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
    vi.mocked(mockAuthRepository.getUserByProvider).mockResolvedValue(mockDbUser as any);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(mockDbUser);
    expect(mockAuthRepository.getUserByProvider).toHaveBeenCalledWith('', '123');
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
    vi.mocked(mockAuthRepository.getUserByProvider).mockResolvedValue(null); // User not found

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({ id: 0, publicId: 'unknown' }); // Empty string when user not found
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
    vi.mocked(mockAuthRepository.getUserByProvider).mockResolvedValue(mockDbUser as any);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
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
    vi.mocked(mockAuthRepository.getUserByProvider).mockResolvedValue(mockDbUser as any);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockAuthRepository.getUserByProvider).toHaveBeenCalledWith('', '123');
  });
});
