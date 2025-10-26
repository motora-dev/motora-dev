'server-only';
import { GoogleAuth } from 'google-auth-library';

/**
 * Google Auth インスタンスのシングルトン管理
 * サービス間認証用のため、アプリケーション全体で1つのインスタンスを共有
 */
let authInstance: GoogleAuth | null = null;

/**
 * Google Auth インスタンスを取得する（シングルトンパターン）
 * @returns GoogleAuth インスタンス
 */
export function getGoogleAuth(): GoogleAuth {
  if (!authInstance) {
    authInstance = createGoogleAuth();
  }
  return authInstance;
}

/**
 * Google Auth インスタンスを作成する
 * @returns 新しい GoogleAuth インスタンス
 */
function createGoogleAuth(): GoogleAuth {
  const rawJson = (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || 'invalid').trim();

  // JSONの開始と終了を探して、有効なJSONのみを抽出
  const firstBrace = rawJson.indexOf('{');
  const lastBrace = rawJson.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('Invalid JSON format: No valid JSON object found');
  }

  const credentialsJson = rawJson.substring(firstBrace, lastBrace + 1);
  const credentials = JSON.parse(credentialsJson); // 環境変数未設定時は"invalid"でJSONパースエラーになる

  return new GoogleAuth({
    credentials,
  });
}

/**
 * Google Auth インスタンスをリセット（テスト用）
 * 本番では通常使用しない
 */
export function resetGoogleAuth(): void {
  authInstance = null;
}
