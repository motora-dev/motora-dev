---
title: Node.jsとExpressで作るRESTful API
---

## はじめに

このサンプル記事では、Node.jsとExpressを使用したRESTful APIの構築方法について説明します。

## Node.jsとは

Node.jsは、Chromeのv8 JavaScriptエンジンを使用してJavaScriptをサーバー側で実行するランタイム環境です。
非同期I/Oを採用しており、高いスケーラビリティを実現します。

## Expressフレームワーク

Expressは、Node.js向けの軽量かつ柔軟なWebアプリケーションフレームワークです。
以下の特徴があります：

- ミドルウェアによる拡張性
- 直感的なルーティングAPI
- パフォーマンスの高さ
- コミュニティサポートの充実

### コードサンプル

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// ミドルウェアの例
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ルーティングの例
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: '山田太郎' },
    { id: 2, name: '佐藤花子' },
  ];
  res.json(users);
});

app.listen(port, () => {
  console.log(`APIサーバーが http://localhost:${port} で実行中`);
});
```

## RESTful API設計のベストプラクティス

1. 適切なHTTPメソッドの使用
2. リソース指向の設計
3. 適切なステータスコードの返却
4. バージョニングの実装

## まとめ

Node.jsとExpressは、軽量で高性能なRESTful APIを構築するための優れた組み合わせです。
適切な設計パターンを適用することで、保守性とスケーラビリティに優れたAPIを開発できます。
