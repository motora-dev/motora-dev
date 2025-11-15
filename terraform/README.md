# Terraform Infrastructure as Code

このディレクトリには、Google Cloud環境を自動構築するためのTerraformコードが含まれています。

## 🏗️ 構成要素

- **サービスアカウント**: GitHub ActionsとCloud Run用
- **IAMロール**: 必要最小限の権限設定
- **Workload Identity Federation**: GitHub ActionsからGCPへの安全な認証
- **Secret Manager**: Cloud KMSで暗号化された機密情報管理
- **API有効化**: 必要なGoogle Cloud APIの自動有効化

## 📁 ディレクトリ構造

```
terraform/
├── modules/                    # 再利用可能なモジュール
│   ├── iam/                   # サービスアカウントとIAM設定
│   ├── wif/                   # Workload Identity Federation
│   ├── secrets/               # Secret Manager（KMS暗号化）
│   └── cloud-run/             # Cloud Runサービス（現在は手動デプロイ）
├── environments/              # 環境別設定
│   ├── develop/              # 開発環境（developブランチ）
│   └── main/                 # 本番環境（mainブランチ）
├── main.tf                   # メイン設定
├── variables.tf              # 変数定義
├── outputs.tf                # 出力定義
├── versions.tf               # Terraformバージョン設定
└── SECRET_MANAGER_MIGRATION.md  # Secret Manager移行ガイド
```

## 🚀 使用方法

### 1. 前提条件

- Terraform >= 1.5.0
- Google Cloud CLIがインストール済み
- 適切な権限を持つGCPアカウント

### 2. 初期設定

```bash
# Google Cloudにログイン
gcloud auth application-default login

# プロジェクトの設定
gcloud config set project YOUR-PROJECT-ID
```

### 3. Terraform実行

#### 開発環境の場合:

```bash
cd terraform

# terraform.tfvarsファイルを作成
cp environments/develop/terraform.tfvars.example environments/develop/terraform.tfvars
# エディタでterraform.tfvarsを編集して実際の値を設定

# Terraformの初期化
terraform init

# 開発環境のワークスペースを作成・選択
terraform workspace new develop  # 初回のみ
# または既存の場合
terraform workspace select develop

# 実行計画の確認
terraform plan -var-file=environments/develop/terraform.tfvars

# インフラの構築
terraform apply -var-file=environments/develop/terraform.tfvars
```

#### 本番環境の場合:

```bash
# terraform.tfvarsファイルを作成
cp environments/main/terraform.tfvars.example environments/main/terraform.tfvars
# エディタでterraform.tfvarsを編集

# 本番環境のワークスペースを作成・選択
terraform workspace new main  # 初回のみ
# または既存の場合
terraform workspace select main

# plan, applyを実行
terraform plan -var-file=environments/main/terraform.tfvars
terraform apply -var-file=environments/main/terraform.tfvars
```

### 4. 出力値の確認

Terraform実行後、以下の値が出力されます：

```bash
terraform output

# 出力例:
github_actions_service_account = "github-actions-dev@your-project.iam.gserviceaccount.com"
workload_identity_provider = "projects/123456789/locations/global/workloadIdentityPools/github-pool-dev/providers/github-provider-dev"
```

これらの値をGitHub Secretsに設定してください。

### 5. Secret Managerへのシークレット値の設定

Terraform適用後、Secret Managerに機密情報を設定します：

```bash
# プロジェクトIDを設定
PROJECT_ID="your-project-id"

# ヘルパースクリプトを使用（推奨）
chmod +x scripts/set-secrets.sh
./scripts/set-secrets.sh $PROJECT_ID

# または手動で設定
echo -n "postgresql://..." | gcloud secrets versions add database-url --data-file=- --project=$PROJECT_ID
echo -n "https://..." | gcloud secrets versions add supabase-url --data-file=- --project=$PROJECT_ID
# ... 他のシークレットも同様に設定
```

詳細は [SECRET_MANAGER_MIGRATION.md](./SECRET_MANAGER_MIGRATION.md) を参照してください。

## 📝 必要な変数

| 変数名         | 説明                       | 例                  |
| -------------- | -------------------------- | ------------------- |
| `project_id`   | GCPプロジェクトID          | `my-project-123`    |
| `region`       | GCPリージョン              | `asia-northeast1`   |
| `environment`  | 環境名                     | `develop` or `main` |
| `service_name` | サービス名                 | `turbo-nestjs-api`  |
| `github_org`   | GitHubオーガニゼーション名 | `your-org`          |
| `github_repo`  | GitHubリポジトリ名         | `your-repo`         |

## 🔒 セキュリティ考慮事項

1. **terraform.tfvarsファイルは絶対にコミットしない**
   - `.gitignore`に含まれています
   - 機密情報が含まれる可能性があります

2. **Secret Managerによる機密情報管理**
   - 全ての機密情報はSecret Managerで管理
   - Cloud KMSで自動的に暗号化
   - IAMによる細かいアクセス制御
   - 監査ログで全アクセスを追跡
   - GitHub Secretsには機密情報を保存しない（GCP認証情報のみ）

3. **状態ファイルの管理**
   - 本番環境ではリモートバックエンド（GCS）の使用を推奨
   - バックエンド設定例:
     ```hcl
     terraform {
       backend "gcs" {
         bucket = "your-terraform-state-bucket"
         prefix = "terraform/state"
       }
     }
     ```

4. **最小権限の原則**
   - 各サービスアカウントには必要最小限の権限のみ付与
   - Cloud Runサービスアカウント: `roles/secretmanager.secretAccessor`のみ

## 🔧 トラブルシューティング

### API有効化エラー

```
Error: Error enabling service: failed to enable services
```

→ プロジェクトの課金が有効になっているか確認

### 権限エラー

```
Error: Error creating service account: googleapi: Error 403
```

→ 実行ユーザーに必要な権限があるか確認:

- `roles/iam.serviceAccountAdmin`
- `roles/resourcemanager.projectIamAdmin`

### Workload Identity Federationエラー

→ プロジェクト番号が正しいか確認（プロジェクトIDではない）

## 🧹 クリーンアップ

インフラを削除する場合:

```bash
terraform destroy -var-file=environments/develop/terraform.tfvars
```

## 🔐 Secret Managerについて

本プロジェクトでは、機密情報をSecret Managerで管理しています：

### メリット
- ✅ **Cloud KMSによる自動暗号化**: データは保存時・転送時ともに暗号化
- ✅ **IAMによるアクセス制御**: 誰がどのシークレットにアクセスできるか細かく制御
- ✅ **監査ログ**: 全てのアクセスが記録され、セキュリティコンプライアンスに対応
- ✅ **バージョン管理**: シークレットのローテーションが容易
- ✅ **コスト効率**: 8シークレット × $0.06/月 ≈ $0.48/月

### 使用しているシークレット
- `database-url`: PostgreSQLデータベースURL
- `direct-url`: Prisma Direct URL
- `supabase-url`: Supabase URL
- `supabase-service-role-key`: Supabaseサービスロールキー
- `cors-origins`: CORS許可オリジン
- `app-url`: フロントエンドURL
- `api-url`: バックエンドAPI URL
- `cookie-domain`: Cookieドメイン

**Note:** シークレット名には環境名を含めません。各環境（develop/main）は別々のGCPプロジェクトを使用しているため、プロジェクトレベルで自然に分離されます。

詳細な移行手順は [SECRET_MANAGER_MIGRATION.md](./SECRET_MANAGER_MIGRATION.md) を参照してください。

## 📚 参考リンク

- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run with Terraform](https://cloud.google.com/run/docs/terraform)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud KMS](https://cloud.google.com/kms/docs)
