import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageAdapter {
  private readonly logger = new Logger(SupabaseStorageAdapter.name);
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and ROLE_KEY must be provided');
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
    try {
      const { data, error } = await this.supabase.storage.from(bucketName).createSignedUrl(filePath, expiresIn, {
        download: fileName,
      });

      if (error) {
        this.logger.error('Failed to create signed URL', error);
        throw new Error(`Signed URL creation failed: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      this.logger.error('Error creating signed URL', error);
      throw error;
    }
  }
}
