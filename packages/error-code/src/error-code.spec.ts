import { ERROR_CODE } from './error-code';

describe('Error Code Definitions', () => {
  it('should have unique error codes for all definitions', () => {
    const codeToKeyMap = new Map<string, string[]>();

    // 1. 各エラーコードがどのキーに属しているかをマッピングする
    // 例: { 'E-100-404-100-001': ['ARTICLE_NOT_FOUND', 'ANOTHER_SIMILAR_ERROR'] }
    for (const [key, value] of Object.entries(ERROR_CODE)) {
      if (!codeToKeyMap.has(value.code)) {
        codeToKeyMap.set(value.code, []);
      }
      codeToKeyMap.get(value.code)!.push(key);
    }

    // 2. 複数のキーを持つ（＝コードが重複している）エントリーを抽出する
    const duplicates = [...codeToKeyMap.entries()]
      .filter(([, keys]) => keys.length > 1)
      .map(([code, keys]) => {
        // 失敗メッセージ用に、分かりやすい文字列を生成する
        return `Code "${code}" is duplicated in keys: [${keys.join(', ')}]`;
      });

    // 3. 重複があった場合に、生成した詳細なメッセージをJestの失敗メッセージとして表示する
    expect(duplicates).toEqual([]);
  });

  it('should have a valid format (E-ddd-ddd-ddd-ddd)', () => {
    const errorCodeRegex = /^E-\d{3}-\d{3}-\d{3}-\d{3}$/;
    Object.values(ERROR_CODE).forEach((errorObject) => {
      expect(errorObject.code).toMatch(errorCodeRegex);
    });
  });
});
