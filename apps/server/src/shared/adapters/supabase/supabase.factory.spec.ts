import * as supabaseJs from '@supabase/supabase-js';

import { createServerSupabase } from './supabase.factory';

describe('supabase.factory', () => {
  const mockCreateClient = jest.fn();
  let originalEnv: NodeJS.ProcessEnv;

  // モックリクエストとレスポンス
  const mockReq = {
    cookies: {
      'test-cookie': 'cookie-value',
      'sb-code-verifier': '"code-verifier-value"', // JSONで囲まれた値
    },
  };

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeAll(() => {
    originalEnv = process.env;
    process.env = {
      ...process.env,
      SUPABASE_URL: 'https://test-supabase-url.com',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    };

    jest.spyOn(supabaseJs, 'createClient').mockImplementation(mockCreateClient);

    // モックの戻り値を設定
    mockCreateClient.mockReturnValue({
      auth: {
        // 必要に応じてここにモックのメソッドを追加
      },
    });
  });

  afterAll(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create Supabase client with correct parameters', () => {
    createServerSupabase(mockReq, mockRes);

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test-supabase-url.com',
      'test-service-role-key',
      expect.objectContaining({
        auth: expect.objectContaining({
          flowType: 'pkce',
          autoRefreshToken: false,
          storage: expect.any(Object),
        }),
      }),
    );
  });

  describe('auth.storage', () => {
    let storage: any;

    beforeEach(() => {
      createServerSupabase(mockReq, mockRes);
      // 最後の呼び出しの第3引数からストレージオブジェクトを取得
      storage = mockCreateClient.mock.calls[0][2].auth.storage;
    });

    it('should get item from cookies', () => {
      expect(storage.getItem('test-cookie')).toBe('cookie-value');
      expect(storage.getItem('non-existent')).toBeNull();
    });

    it('should set normal item as cookie', () => {
      storage.setItem('test-key', 'test-value');

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'test-key',
        'test-value',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: false,
        }),
      );
    });

    it('should parse code-verifier value to remove quotes', () => {
      storage.setItem('test-code-verifier', '"quoted-value"');

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'test-code-verifier',
        'quoted-value', // 引用符が削除されていることを確認
        expect.any(Object),
      );
    });

    it('should remove item by clearing cookie', () => {
      storage.removeItem('test-cookie');

      expect(mockRes.clearCookie).toHaveBeenCalledWith('test-cookie', { path: '/' });
    });
  });
});
