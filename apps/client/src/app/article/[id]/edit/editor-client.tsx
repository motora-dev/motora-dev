'use client';

import { useState } from 'react';

import { TiptapEditor } from '$shared/ui/tiptap';

export function EditorClient({ id }: { id: string }) {
  const [content, setContent] = useState<string>('<h1>Hello, Tiptap!</h1><p>This is a sample document.</p>');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Article Edit Page (ID: {id})</h1>
      <TiptapEditor content={content} onChange={handleContentChange} />
      <div className="mt-4 p-4 border rounded-md bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Raw HTML Output:</h2>
        <pre className="text-sm whitespace-pre-wrap">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}
