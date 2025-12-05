import { EditorClient } from './editor-client';

export default async function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // keyプロップを設定することで、idが変わった時に確実に再マウントされる
  return <EditorClient key={id} id={id} />;
}
