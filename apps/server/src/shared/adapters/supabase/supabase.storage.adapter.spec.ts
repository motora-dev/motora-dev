import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as supabaseJs from '@supabase/supabase-js';

import { SupabaseStorageAdapter } from './supabase.storage.adapter';

// Supabaseクライアントをモック
const mockSupabaseClient = {
  storage: {
    from: jest.fn(),
  },
};

const mockStorageBucket = {
  download: jest.fn(),
  remove: jest.fn(),
  createSignedUrl: jest.fn(),
};

// Loggerをモック化
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('SupabaseStorageAdapter', () => {
  let adapter: SupabaseStorageAdapter;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    // ConfigServiceのモック設定
    mockConfigService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'SUPABASE_URL':
          return 'https://test-supabase-url.com';
        case 'SUPABASE_SERVICE_ROLE_KEY':
          return 'test-service-role-key';
        default:
          return undefined;
      }
    });

    // SupabaseクライアントのモックをReset
    jest.clearAllMocks();
    mockSupabaseClient.storage.from.mockReturnValue(mockStorageBucket);

    // createClientをモック
    jest.spyOn(supabaseJs, 'createClient').mockReturnValue(mockSupabaseClient as any);

    // Loggerをモック化
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug);
    jest.spyOn(Logger.prototype, 'verbose').mockImplementation(mockLogger.verbose);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseStorageAdapter,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    adapter = module.get<SupabaseStorageAdapter>(SupabaseStorageAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should create Supabase client with correct configuration', () => {
    expect(supabaseJs.createClient).toHaveBeenCalledWith('https://test-supabase-url.com', 'test-service-role-key');
  });

  it('should throw error when SUPABASE_URL is not provided', async () => {
    const mockConfigServiceMissingUrl = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'SUPABASE_URL':
            return undefined;
          case 'SUPABASE_SERVICE_ROLE_KEY':
            return 'test-service-role-key';
          default:
            return undefined;
        }
      }),
    };

    await expect(
      Test.createTestingModule({
        providers: [
          SupabaseStorageAdapter,
          {
            provide: ConfigService,
            useValue: mockConfigServiceMissingUrl,
          },
        ],
      }).compile(),
    ).rejects.toThrow('Supabase URL and ROLE_KEY must be provided');
  });

  it('should throw error when SUPABASE_SERVICE_ROLE_KEY is not provided', async () => {
    const mockConfigServiceMissingKey = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'SUPABASE_URL':
            return 'https://test-supabase-url.com';
          case 'SUPABASE_SERVICE_ROLE_KEY':
            return undefined;
          default:
            return undefined;
        }
      }),
    };

    await expect(
      Test.createTestingModule({
        providers: [
          SupabaseStorageAdapter,
          {
            provide: ConfigService,
            useValue: mockConfigServiceMissingKey,
          },
        ],
      }).compile(),
    ).rejects.toThrow('Supabase URL and ROLE_KEY must be provided');
  });

  describe('getDownloadUrl', () => {
    it('should create and return signed URL', async () => {
      const bucketName = 'articles';
      const filePath = 'test/path/file.md';
      const fileName = 'download-file.md';
      const expiresIn = 3600;
      const mockSignedUrl = 'https://signed-url.com/file.md';

      mockStorageBucket.createSignedUrl.mockResolvedValue({
        data: { signedUrl: mockSignedUrl },
        error: null,
      });

      const result = await adapter.getDownloadUrl(bucketName, filePath, fileName, expiresIn);

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('articles');
      expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith(filePath, expiresIn, {
        download: fileName,
      });
      expect(result).toBe(mockSignedUrl);
    });

    it('should use default expiration time when not provided', async () => {
      const bucketName = 'articles';
      const filePath = 'test/path/file.md';
      const fileName = 'download-file.md';
      const mockSignedUrl = 'https://signed-url.com/file.md';

      mockStorageBucket.createSignedUrl.mockResolvedValue({
        data: { signedUrl: mockSignedUrl },
        error: null,
      });

      const result = await adapter.getDownloadUrl(bucketName, filePath, fileName);

      expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith(filePath, 3600, {
        download: fileName,
      });
      expect(result).toBe(mockSignedUrl);
    });

    it('should throw error when signed URL creation fails', async () => {
      const bucketName = 'articles';
      const filePath = 'test/path/file.md';
      const fileName = 'download-file.md';
      const mockError = { message: 'URL creation failed' };

      mockStorageBucket.createSignedUrl.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(adapter.getDownloadUrl(bucketName, filePath, fileName)).rejects.toThrow(
        'Signed URL creation failed: URL creation failed',
      );

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('articles');
      expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith(filePath, 3600, {
        download: fileName,
      });
    });

    it('should throw error when exception occurs during URL creation', async () => {
      const bucketName = 'articles';
      const filePath = 'test/path/file.md';
      const fileName = 'download-file.md';
      const mockError = new Error('Network error');

      mockStorageBucket.createSignedUrl.mockRejectedValue(mockError);

      await expect(adapter.getDownloadUrl(bucketName, filePath, fileName)).rejects.toThrow('Network error');
    });
  });
});
