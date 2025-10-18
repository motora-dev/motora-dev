import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '@modules/auth/services/auth.service';

import { CreateUserCommand } from './create-user.command';
import { CreateUserFromGoogleHandler } from './create-user.handler';

describe('CreateUserFromGoogleHandler', () => {
  let handler: CreateUserFromGoogleHandler;
  let authService: AuthService;

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
    findOrCreateUser: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateUserFromGoogleHandler, { provide: AuthService, useValue: mockAuthService }],
    }).compile();

    handler = module.get<CreateUserFromGoogleHandler>(CreateUserFromGoogleHandler);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should process CreateUserFromGoogle command', async () => {
      // Mock AuthService response
      mockAuthService.findOrCreateUser.mockResolvedValue(mockUser);

      // Create command
      const googleId = 'test-google-id';
      const googleEmail = 'test@gmail.com';
      const command = new CreateUserCommand('google', googleId, googleEmail);

      // Execute handler
      await handler.execute(command);

      // Verify service was called with correct googleId and googleEmail
      expect(authService.findOrCreateUser).toHaveBeenCalledWith('google', googleId, googleEmail);
    });

    it('should handle error from auth service', async () => {
      // Mockエラーを設定
      const error = new Error('Google認証エラー');
      mockAuthService.findOrCreateUser.mockRejectedValue(error);

      // コマンド作成
      const command = new CreateUserCommand('google', 'invalid-google-id', 'invalid@gmail.com');

      // ハンドラーの実行とエラー検証
      await expect(handler.execute(command)).rejects.toThrow('Google認証エラー');
      expect(authService.findOrCreateUser).toHaveBeenCalledWith('google', 'invalid-google-id', 'invalid@gmail.com');
    });
  });
});
