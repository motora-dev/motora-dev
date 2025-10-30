import { EditorClient } from './editor-client';

export default async function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <EditorClient id={id} />;
}
