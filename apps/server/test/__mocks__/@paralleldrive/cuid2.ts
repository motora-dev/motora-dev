/**
 * Mock implementation of @paralleldrive/cuid2 for Jest tests
 * テスト時に決定論的なIDを生成し、テストの予測可能性を確保
 */

let counter = 0;

/**
 * テスト用のCUID2風IDを生成
 * 実際のCUID2と同じ24文字で、テスト識別可能な形式
 */
export const createId = jest.fn((): string => {
  counter++;
  // 'test-cuid-' (10文字) + 14桁のゼロ埋め数字 = 24文字
  return `test-cuid-${counter.toString().padStart(14, '0')}`;
});

export const init = jest.fn(() => createId);

export const getConstants = jest.fn(() => ({
  defaultLength: 24,
  bigLength: 32,
}));

export const isCuid = jest.fn((id: string) => {
  return typeof id === 'string' && id.startsWith('test-cuid-');
});

// テスト間でカウンターをリセットする関数（必要に応じて）
export const resetCounter = () => {
  counter = 0;
};
