'use client';

export function CookieSettingsButton() {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cookie-consent');
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '10px 24px',
        fontSize: '14px',
        fontWeight: '500',
        color: 'white',
        backgroundColor: '#2563EB',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginBottom: '12px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#1D4ED8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#2563EB';
      }}
    >
      Cookie設定を変更する
    </button>
  );
}
