# Secret Manager移行ガイド

## 概要

GitHub SecretsからGCP Secret Managerへの移行手順です。
Secret ManagerはCloud KMSで自動的に暗号化され、より安全に機密情報を管理できます。

## 修正内容

### 1. Terraform設定の変更

- ✅ `terraform/modules/secrets/main.tf` - 全シークレットを定義
- ✅ `terraform/modules/secrets/outputs.tf` - アウトプットを更新
- ✅ `terraform/main.tf` - Secretsモジュールを有効化
- ✅ `.github/workflows/deploy.yml` - Secret Manager参照に変更

### 2. セキュリティの向上

**変更前（GitHub Secrets）:**
```yaml
env_vars: |
  DATABASE_URL=${{ secrets.DATABASE_URL }}
```
- GitHub側で暗号化されているが、デプロイ時に平文で環境変数に設定
- Cloud Runの環境変数として平文で保存

**変更後（Secret Manager + KMS）:**
```yaml
secrets: |
  DATABASE_URL=database-url:latest
```
- GCP Secret ManagerでCloud KMS自動暗号化
- Cloud Runは実行時に自動復号化
- IAMで細かいアクセス制御
- 監査ログで全アクセスを追跡
- バージョン管理でローテーション可能

## 適用手順

### ステップ1: Terraformでシークレットを作成

```bash
cd terraform

# develop環境の場合
terraform workspace select develop
terraform plan
terraform apply
```

これで以下のシークレットが作成されます：
- `database-url`
- `direct-url`
- `supabase-url`
- `supabase-service-role-key`
- `cors-origins`
- `app-url`
- `api-url`
- `cookie-domain`

**Note:** シークレット名に環境名（develop/main）は含まれません。各環境が別々のGCPプロジェクトを使用しているため、プロジェクトレベルで自然に分離されます。

### ステップ2: シークレットに値を設定

GCP Consoleまたはgcloudコマンドで値を設定します。

#### 方法A: ヘルパースクリプト（推奨）

```bash
# インタラクティブにシークレットを設定
chmod +x scripts/set-secrets.sh
./scripts/set-secrets.sh your-project-id
```

#### 方法B: gcloudコマンド

```bash
# プロジェクトIDを設定
PROJECT_ID="your-project-id"

# GitHub Secretsから値を取得して設定
echo -n "YOUR_DATABASE_URL" | gcloud secrets versions add database-url --data-file=- --project=$PROJECT_ID
echo -n "YOUR_DIRECT_URL" | gcloud secrets versions add direct-url --data-file=- --project=$PROJECT_ID
echo -n "YOUR_SUPABASE_URL" | gcloud secrets versions add supabase-url --data-file=- --project=$PROJECT_ID
echo -n "YOUR_SUPABASE_KEY" | gcloud secrets versions add supabase-service-role-key --data-file=- --project=$PROJECT_ID
echo -n "YOUR_CORS_ORIGINS" | gcloud secrets versions add cors-origins --data-file=- --project=$PROJECT_ID
echo -n "YOUR_APP_URL" | gcloud secrets versions add app-url --data-file=- --project=$PROJECT_ID
echo -n "YOUR_API_URL" | gcloud secrets versions add api-url --data-file=- --project=$PROJECT_ID
echo -n "YOUR_COOKIE_DOMAIN" | gcloud secrets versions add cookie-domain --data-file=- --project=$PROJECT_ID
```

#### 方法C: GCP Console（GUI）

1. [Secret Manager](https://console.cloud.google.com/security/secret-manager) にアクセス
2. 各シークレットをクリック
3. "NEW VERSION"をクリック
4. シークレット値を入力
5. "ADD NEW VERSION"をクリック

### ステップ3: デプロイテスト

```bash
# GitHubにプッシュしてデプロイをトリガー
git add .
git commit -m "feat: migrate to Secret Manager with KMS encryption"
git push origin develop
```

### ステップ4: 動作確認

デプロイ後、以下を確認：

1. **Cloud Runサービスの起動**
   ```bash
   gcloud run services describe SERVICE_NAME --region REGION
   ```

2. **環境変数の設定確認**
   - GCP Console > Cloud Run > サービス > REVISIONS > 環境変数
   - Secret Manager参照が設定されていることを確認

3. **アプリケーションの動作確認**
   ```bash
   curl https://your-service-url/health
   ```

## ロールバック手順

問題が発生した場合：

1. **Gitでロールバック**
   ```bash
   git revert HEAD
   git push
   ```

2. **または、GitHub Actionsで一時的に対応**
   ```yaml
   # deploy.ymlを一時的に元に戻す
   env_vars: |
     DATABASE_URL=${{ secrets.DATABASE_URL }}
     ...
   ```

## メリット

✅ **セキュリティ強化**
- Cloud KMSによる自動暗号化
- IAMによる細かいアクセス制御
- 監査ログによる全アクセス追跡

✅ **運用改善**
- シークレットのバージョン管理
- ローテーションが容易
- 環境ごとの管理が簡単

✅ **コスト**
- Secret Manager: 6 シークレット x $0.06/月 = $0.36/月
- KMS暗号化: 無料（Secret Manager統合）
- 非常に低コスト

## トラブルシューティング

### エラー: "Permission denied on secret"

```bash
# Cloud Runサービスアカウントに権限を付与
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### エラー: "Secret version not found"

```bash
# シークレットバージョンを確認
gcloud secrets versions list SECRET_NAME

# 最新バージョンを追加
echo -n "VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-
```

### 環境変数が取得できない

1. Secret Managerのシークレット名を確認
2. Cloud Runのリビジョンで環境変数設定を確認
3. サービスアカウントの権限を確認

## 参考リンク

- [Secret Manager ドキュメント](https://cloud.google.com/secret-manager/docs)
- [Cloud Run と Secret Manager](https://cloud.google.com/run/docs/configuring/secrets)
- [Cloud KMS](https://cloud.google.com/kms/docs)

