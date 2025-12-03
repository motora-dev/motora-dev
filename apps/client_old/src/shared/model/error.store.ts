import { create } from 'zustand';

type ErrorMessage = {
  message: string;
  at?: string;
};

// ページ全体のエラー状態を表す型
type PageError = {
  statusCode: number;
} | null;

type ErrorState = {
  errors: ErrorMessage[];
  push: (error: ErrorMessage) => void;
  clear: () => void;
  // pageErrorを管理するための新しいstateとaction
  pageError: PageError;
  setPageError: (statusCode: number | null) => void;
};

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],
  push: (error) => set((state) => ({ errors: [...state.errors, error] })),
  clear: () => set({ errors: [] }),
  // stateとactionの初期値と実装
  pageError: null,
  setPageError: (statusCode) => set({ pageError: statusCode ? { statusCode } : null }),
}));
