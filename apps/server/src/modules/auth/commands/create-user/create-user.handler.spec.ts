import { vi } from 'vitest';

import { AuthService } from '$modules/auth/services/auth.service';
import { CreateUserCommand } from './create-user.command';
import { CreateUserFromGoogleHandler } from './create-user.handler';

describe('CreateUserFromGoogleHandler', () => {
  let handler: CreateUserFromGoogleHandler;

  const mockUser = {
    id: 1,
    microsoftId: null,
    microsoftEmail: null,
    googleId: 'test-google-id',
    googleEmail: 'test@gmail.com',
    name: 'Test Google User',
    userName: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    stories: [],
  };

  const mockAuthService = {
    findOrCreateUser: vi.fn().mockResolvedValue(mockUser),
  } as unknown as AuthService;

  beforeEach(() => {
    handler = new CreateUserFromGoogleHandler(mockAuthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should process CreateUserFromGoogle command', async () => {
      // Mock AuthService response
      vi.mocked(mockAuthService.findOrCreateUser).mockResolvedValue(mockUser as any);

      // Create command
      const googleId = 'test-google-id';
      const googleEmail = 'test@gmail.com';
      const command = new CreateUserCommand('google', googleId, googleEmail);

      // Execute handler
      await handler.execute(command);

      // Verify service was called with correct googleId and googleEmail
      expect(mockAuthService.findOrCreateUser).toHaveBeenCalledWith('google', googleId, googleEmail);
    });

    it('should handle error from auth service', async () => {
      // Mockエラーを設定
      const error = new Error('Google認証エラー');
      vi.mocked(mockAuthService.findOrCreateUser).mockRejectedValue(error);

      // コマンド作成
      const command = new CreateUserCommand('google', 'invalid-google-id', 'invalid@gmail.com');

      // ハンドラーの実行とエラー検証
      await expect(handler.execute(command)).rejects.toThrow('Google認証エラー');
      expect(mockAuthService.findOrCreateUser).toHaveBeenCalledWith('google', 'invalid-google-id', 'invalid@gmail.com');
    });
  });
});
