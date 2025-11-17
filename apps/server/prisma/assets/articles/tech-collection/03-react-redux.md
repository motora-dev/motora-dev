---
title: ReactとReduxで学ぶモダンなステート管理
---

## はじめに

本記事では、ReactアプリケーションでReduxを使用した効果的な状態管理手法について解説します。

## Reactの状態管理の課題

Reactでは、コンポーネントの状態管理がアプリケーションの複雑さとともに難しくなる傾向があります。
以下のような課題があります：

- プロップドリリング（Prop Drilling）
- 複数のコンポーネント間での状態共有
- 複雑な状態変更ロジックの管理

## Reduxの基本概念

Reduxは以下の3つの原則に基づいています：

1. 単一の信頼できる情報源（Single source of truth）
2. 状態は読み取り専用（State is read-only）
3. 変更は純粋関数で行う（Changes are made with pure functions）

### コードサンプル

```javascript
// アクションタイプ
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';

// アクションクリエイター
function addTodo(text) {
  return {
    type: ADD_TODO,
    payload: { text, completed: false },
  };
}

// レデューサー
function todoReducer(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [...state, action.payload];
    case TOGGLE_TODO:
      return state.map((todo, index) => (index === action.index ? { ...todo, completed: !todo.completed } : todo));
    default:
      return state;
  }
}
```

## Redux Toolkitの使用

現代のRedux開発では、Redux Toolkitの使用が推奨されています：

```javascript
import { createSlice } from '@reduxjs/toolkit';

const todoSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push(action.payload);
    },
    toggleTodo: (state, action) => {
      const todo = state.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
  },
});

export const { addTodo, toggleTodo } = todoSlice.actions;
export default todoSlice.reducer;
```

## まとめ

ReactとReduxの組み合わせにより、複雑なアプリケーションでも予測可能で保守しやすい状態管理を実現できます。
Redux Toolkitを使用することで、より簡潔で安全なコードを書くことができます。
