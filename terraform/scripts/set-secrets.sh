#!/bin/bash

# Secret Manager シークレット設定スクリプト
# Usage: ./set-secrets.sh <project_id>

set -e

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 引数チェック
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <project_id>${NC}"
    echo -e "${YELLOW}Example: $0 my-project-123${NC}"
    exit 1
fi

PROJECT_ID=$1

echo -e "${GREEN}=== Secret Manager シークレット設定 ===${NC}"
echo -e "Project ID: ${YELLOW}${PROJECT_ID}${NC}"
echo ""

# シークレット定義
declare -A SECRETS=(
    ["database-url"]="PostgreSQL Database URL (e.g., postgresql://user:pass@host/db)"
    ["direct-url"]="Prisma Direct URL (optional, press Enter to skip)"
    ["supabase-url"]="Supabase URL (e.g., https://xxx.supabase.co)"
    ["supabase-service-role-key"]="Supabase Service Role Key"
    ["cors-origins"]="CORS Origins (e.g., https://example.com,https://www.example.com)"
    ["app-url"]="Frontend App URL (e.g., https://app.example.com)"
    ["api-url"]="Backend API URL (e.g., https://api.example.com)"
    ["cookie-domain"]="Cookie Domain (e.g., .example.com)"
)

# 各シークレットの値を入力
for secret_name in "${!SECRETS[@]}"; do
    description="${SECRETS[$secret_name]}"

    echo -e "${GREEN}Setting: ${secret_name}${NC}"
    echo -e "${YELLOW}${description}${NC}"

    # シークレット値を入力（パスワードは非表示）
    read -s -p "Enter value (hidden): " secret_value
    echo "" # 改行

    # 空の場合はスキップ
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}Skipped${NC}"
        echo ""
        continue
    fi

    # シークレットを設定
    if echo -n "$secret_value" | gcloud secrets versions add "$secret_name" \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null; then
        echo -e "${GREEN}✓ Successfully set${NC}"
    else
        echo -e "${RED}✗ Failed to set secret${NC}"
        echo -e "${YELLOW}Tip: Make sure the secret exists. Run 'terraform apply' first.${NC}"
    fi
    echo ""
done

echo -e "${GREEN}=== Complete ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify secrets: gcloud secrets list --project=$PROJECT_ID"
echo "2. Deploy application: git push"
echo ""

