---
title: DockerとKubernetesによるコンテナオーケストレーション
---

# DockerとKubernetesによるコンテナオーケストレーション

## はじめに

この記事では、DockerとKubernetesを使用したコンテナ技術とオーケストレーションについて解説します。

## Dockerとは

Dockerは、アプリケーションをコンテナという軽量な実行環境にパッケージ化する技術です。

### Dockerの利点

- 環境の一貫性（「私の環境では動く」問題の解決）
- 軽量性（VMと比較して）
- ポータビリティ
- スケーラビリティ

### Dockerファイルの例

```dockerfile
# Node.jsアプリケーションの例
FROM node:18-alpine

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY . .

# ポートの公開
EXPOSE 3000

# アプリケーション実行用ユーザー作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

# アプリケーションの起動
CMD ["npm", "start"]
```

## Kubernetesとは

Kubernetesは、コンテナ化されたアプリケーションのデプロイ、スケーリング、管理を自動化するオーケストレーションプラットフォームです。

### 主な概念

- **Pod**: Kubernetesの最小デプロイ単位
- **Service**: Podへのネットワークアクセスを提供
- **Deployment**: Podの宣言的な管理
- **ConfigMap/Secret**: 設定情報の管理

### マニフェストファイルの例

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
        - name: web-app
          image: my-web-app:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
          resources:
            requests:
              memory: '64Mi'
              cpu: '250m'
            limits:
              memory: '128Mi'
              cpu: '500m'

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
spec:
  selector:
    app: web-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

## Container Registry

コンテナイメージの管理には、Container Registryを使用します：

```bash
# イメージのビルド
docker build -t my-registry/web-app:v1.0.0 .

# レジストリへのプッシュ
docker push my-registry/web-app:v1.0.0

# Kubernetesでの使用
kubectl set image deployment/web-app web-app=my-registry/web-app:v1.0.0
```

## モニタリングとロギング

本番環境では、適切な監視が重要です：

```yaml
# monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
```

## まとめ

DockerとKubernetesの組み合わせにより、以下が実現できます：

- アプリケーションの一貫したデプロイメント
- 自動スケーリング
- 障害からの自動復旧
- 効率的なリソース利用

モダンなクラウドネイティブアプリケーションの基盤技術として、これらの技術の習得は重要です。

