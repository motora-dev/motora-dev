# Secrets management using Google Secret Manager
# All secrets are automatically encrypted with Cloud KMS
# Note: Secret names don't include environment suffix because each environment
#       uses a separate GCP project, which naturally isolates the secrets.

locals {
  secrets = [
    "database-url",
    "direct-url",
    "supabase-url",
    "supabase-service-role-key",
    "cors-origins",
    "app-url",
    "api-url",
    "cookie-domain",
  ]
}

# Create all secrets
resource "google_secret_manager_secret" "secrets" {
  for_each = toset(local.secrets)

  secret_id = each.value
  project   = var.project_id

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }

  replication {
    auto {}
  }
}

# Grant Cloud Run service account access to all secrets
resource "google_secret_manager_secret_iam_member" "cloud_run_access" {
  for_each = google_secret_manager_secret.secrets

  project   = var.project_id
  secret_id = each.value.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.cloud_run_service_account_email}"
}
