'use client';
import { useEffect, useState } from 'react';

export type ConsentStatus = 'accepted' | 'rejected' | null;

const STORAGE_KEY = 'cookie-consent';

// Consent Mode v2のステータスを更新
function updateConsentMode(status: 'accepted' | 'rejected') {
  if (typeof window === 'undefined' || !window.gtag) return;

  if (status === 'accepted') {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  }
  // 拒否時はdeniedのまま維持（何もしない）
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>(() => {
    // 初期値をLocalStorageから取得
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) as ConsentStatus;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);

    // 同意済みの場合は即座にConsent Modeを更新
    if (consent === 'accepted') {
      updateConsentMode('accepted');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acceptConsent = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
    updateConsentMode('accepted');
  };

  const rejectConsent = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setConsent('rejected');
    // 拒否時はdeniedのまま維持
  };

  const resetConsent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent(null);
    // ページをリロードして設定を反映
    window.location.reload();
  };

  return {
    consent,
    isLoading,
    acceptConsent,
    rejectConsent,
    resetConsent,
  };
}

// グローバル型定義
declare global {
  interface Window {
    gtag?: (
      command: 'consent',
      action: 'default' | 'update',
      params: {
        ad_storage?: 'granted' | 'denied';
        analytics_storage?: 'granted' | 'denied';
        ad_user_data?: 'granted' | 'denied';
        ad_personalization?: 'granted' | 'denied';
      },
    ) => void;
    dataLayer?: unknown[];
  }
}
