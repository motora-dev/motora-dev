import { Injectable } from '@nestjs/common';
import satori from 'satori';
import { html } from 'satori-html';
import sharp from 'sharp';

interface OgImageOptions {
  title: string;
  tags: string[];
}

@Injectable()
export class OgService {
  private fontData: ArrayBuffer | null = null;

  /**
   * OG画像を生成します（PNG形式）
   */
  async generateOgImage(options: OgImageOptions): Promise<Buffer> {
    const { title, tags } = options;

    // フォントデータを取得（キャッシュ）
    const fontData = await this.loadFont(title + tags.join(''));

    // タグのHTMLを生成
    const tagsHtml = tags
      .slice(0, 3)
      .map(
        (tag) => `
        <div style="font-size: 20px; background: #eff6ff; color: #2563eb; padding: 6px 16px; border-radius: 50px; font-weight: 600;">
          ${this.escapeHtml(tag)}
        </div>
      `,
      )
      .join('');

    // satori-htmlでHTMLをsatoriが理解できる形式に変換
    const markup = html`
      <div
        style="height: 100%; width: 100%; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; background-color: #fff; padding: 40px 60px; position: relative;"
      >
        <!-- 背景装飾（上部のグラデーションバー） -->
        <div
          style="position: absolute; top: 0; left: 0; width: 100%; height: 10px; background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);"
        ></div>

        <!-- タグ -->
        <div style="display: flex; gap: 12px; margin-bottom: 20px;">${tagsHtml}</div>

        <!-- タイトル -->
        <div
          style="font-size: 60px; font-weight: 700; color: #111827; line-height: 1.3; word-break: break-word; max-width: 100%;"
        >
          ${this.escapeHtml(title)}
        </div>

        <!-- フッター（ブランド名） -->
        <div style="position: absolute; bottom: 40px; right: 60px; font-size: 24px; color: #9ca3af; font-weight: 700;">
          Motora
        </div>
      </div>
    `;

    // satoriでSVGを生成
    const svg = await satori(markup as React.ReactNode, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    // sharpでPNGに変換
    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    return png;
  }

  /**
   * Google FontsからNoto Sans JPフォントを読み込みます
   */
  private async loadFont(text: string): Promise<ArrayBuffer> {
    // キャッシュがあれば使用（テキストに依存しないベースフォント用）
    if (this.fontData) {
      return this.fontData;
    }

    const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
    const css = await fetch(url).then((res) => res.text());
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.ok) {
        const fontData = await response.arrayBuffer();
        // ベースフォントをキャッシュ（次回以降の高速化）
        this.fontData = fontData;
        return fontData;
      }
    }

    throw new Error('Failed to load font data');
  }

  /**
   * HTMLエスケープ
   */
  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
