# Terraform Infrastructure as Code

このディレクトリには、Google Cloud環境を自動構築するためのTerraformコードが含まれています。

## 🏗️ 構成要素

- **サービスアカウント**: GitHub ActionsとCloud Run用
- **IAMロール**: 必要最小限の権限設定
- **Workload Identity Federation**: GitHub ActionsからGCPへの安全な認証
- **API有効化**: 必要なGoogle Cloud APIの自動有効化

## 📁 ディレクトリ構造

```
terraform/
├── modules/               # 再利用可能なモジュール
│   ├── iam/              # サービスアカウントとIAM設定
│   ├── wif/              # Workload Identity Federation
│   └── cloud-run/        # Cloud Runサービス（現在は手動デプロイ）
├── environments/         # 環境別設定
│   ├── develop/         # 開発環境（developブランチ）
│   └── main/            # 本番環境（mainブランチ）
├── main.tf              # メイン設定
├── variables.tf         # 変数定義
├── outputs.tf           # 出力定義
└── versions.tf          # Terraformバージョン設定
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

# 同様にinit, plan, apply
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

## 📝 必要な変数

| 変数名         | 説明                       | 例                  |
| -------------- | -------------------------- | ------------------- |
| `project_id`   | GCPプロジェクトID          | `my-project-123`    |
| `region`       | GCPリージョン              | `asia-northeast1`   |
| `environment`  | 環境名                     | `develop` or `main` |
| `service_name` | サービス名                 | `motora-api`        |
| `github_org`   | GitHubオーガニゼーション名 | `your-org`          |
| `github_repo`  | GitHubリポジトリ名         | `your-repo`         |

## 🔒 セキュリティ考慮事項

1. **terraform.tfvarsファイルは絶対にコミットしない**
   - `.gitignore`に含まれています
   - 機密情報が含まれる可能性があります

2. **状態ファイルの管理**
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

3. **最小権限の原則**
   - 各サービスアカウントには必要最小限の権限のみ付与

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

## 📚 参考リンク

- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run with Terraform](https://cloud.google.com/run/docs/terraform)
