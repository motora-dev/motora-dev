import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

import { BusinessLogicError } from '$exceptions';

@Injectable()
export class SupabaseStorageAdapter {
  private readonly logger = new Logger(SupabaseStorageAdapter.name);
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new BusinessLogicError(ERROR_CODE.INTERNAL_SERVER_ERROR, 'Supabase URL and ROLE_KEY must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * ダウンロード用の署名付きURLを生成する
   * @param filePath ファイルパス
   * @param fileName ダウンロード時のファイル名
   * @param expiresIn 有効期限（秒）
   * @returns 署名付きURL
   */
  async getDownloadUrl(
    bucketName: string,
    filePath: string,
    fileName: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage.from(bucketName).createSignedUrl(filePath, expiresIn, {
      download: fileName,
    });

    if (error) {
      throw new BusinessLogicError(ERROR_CODE.SIGNED_DOWNLOAD_URL_CREATION_FAILED, error.message);
    }

    return data.signedUrl;
  }

  /**
   * アップロード用の署名付きURLを生成する
   * @param bucketName バケット名
   * @param filePath ファイルパス
   * @param options オプション（upsert: 既存ファイルを上書きするかどうか）
   * @returns 署名付きURLとパス
   */
  async createSignedUploadUrl(
    bucketName: string,
    filePath: string,
    options?: { upsert: boolean },
  ): Promise<{ signedUrl: string; path: string }> {
    const { data, error } = await this.supabase.storage.from(bucketName).createSignedUploadUrl(filePath, options);

    if (error) {
      throw new BusinessLogicError(ERROR_CODE.SIGNED_UPLOAD_URL_CREATION_FAILED, error.message);
    }

    return {
      signedUrl: data.signedUrl,
      path: data.path,
    };
  }
}
