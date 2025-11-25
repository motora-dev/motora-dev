import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { AuthRepository } from '../repositories/auth.repository';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 2,
    email: 'test@gmail.com',
    publicId: 'public-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockAuthRepository = {
    findOrCreateUser: vi.fn(),
  } as unknown as AuthRepository;

  beforeEach(() => {
    service = new AuthService(mockAuthRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreateUser', () => {
    it('should delegate to repository', async () => {
      vi.mocked(mockAuthRepository.findOrCreateUser).mockResolvedValue(mockUser);
      const result = await service.findOrCreateUser('google', 'test-google-id', 'test@gmail.com');
      expect(mockAuthRepository.findOrCreateUser).toHaveBeenCalledWith('google', 'test-google-id', 'test@gmail.com');
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors', async () => {
      const error = new Error('データベースエラー');
      vi.mocked(mockAuthRepository.findOrCreateUser).mockRejectedValue(error);
      await expect(service.findOrCreateUser('google', 'test-google-id', 'test@gmail.com')).rejects.toThrow(
        'データベースエラー',
      );
      expect(mockAuthRepository.findOrCreateUser).toHaveBeenCalledWith('google', 'test-google-id', 'test@gmail.com');
    });
  });
});
