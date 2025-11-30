import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function loadGoogleFont(text: string) {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
  const css = await fetch(url).then((res) => res.text());
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error('failed to load font data');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // パラメータ取得
    const title = searchParams.get('title')?.slice(0, 100) ?? 'No Title';
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').slice(0, 3) : [];

    // 表示する全テキスト（フォントサブセット用）
    const text = title + tags.join('') + 'Motora';

    // フォント読み込み
    const fontData = await loadGoogleFont(text);

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#fff',
          padding: '40px 60px',
          position: 'relative',
        }}
      >
        {/* 背景装飾 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '10px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
          }}
        />

        {/* タグ */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                fontSize: 20,
                background: '#eff6ff',
                color: '#2563eb',
                padding: '6px 16px',
                borderRadius: '50px',
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* タイトル */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.3,
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {title}
        </div>

        {/* フッター（ブランド名など） */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 24,
            color: '#9ca3af',
            fontWeight: 700,
          }}
        >
          Motora
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Noto Sans JP',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
      },
    );
  } catch (e: any) {
    console.error(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
