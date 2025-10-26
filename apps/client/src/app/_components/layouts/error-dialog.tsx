'use client';
import { useMemo } from 'react';

import { useErrorStore } from '$shared/model/error.store';

export function ErrorDialog() {
  const { errors, clear } = useErrorStore();
  const last = useMemo(() => (errors.length ? errors[errors.length - 1] : null), [errors]);

  if (!last) return null;

  return (
    <div
      role="dialog"
      aria-modal
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        backgroundColor: '#111827',
        color: 'white',
        padding: '16px 20px',
        borderRadius: 8,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: 1000,
        maxWidth: 420,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>エラーが発生しました</div>
      <div style={{ opacity: 0.9, whiteSpace: 'pre-wrap' }}>{last.message}</div>
      {last.at && <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>at: {last.at}</div>}
      <div style={{ marginTop: 10, textAlign: 'right' }}>
        <button
          onClick={clear}
          style={{
            backgroundColor: '#F9FAFB',
            color: '#111827',
            border: '1px solid #E5E7EB',
            borderRadius: 6,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
