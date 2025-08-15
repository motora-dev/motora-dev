provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "sts.googleapis.com",
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "secretmanager.googleapis.com",
  ])

  service = each.value
  project = var.project_id

  disable_on_destroy = false
}

# IAM module
module "iam" {
  source = "./modules/iam"

  project_id   = var.project_id
  environment  = var.environment
  service_name = var.service_name

  depends_on = [google_project_service.apis]
}

# Workload Identity Federation module
module "wif" {
  source = "./modules/wif"

  project_id                = var.project_id
  environment               = var.environment
  github_org                = var.github_org
  github_repo               = var.github_repo
  github_service_account_id = module.iam.github_actions_service_account_email

  depends_on = [module.iam]
}

# Cloud Run module (optional - can be managed via GitHub Actions)
# Uncomment to manage Cloud Run service via Terraform
# module "cloud_run" {
#   source = "./modules/cloud-run"
#
#   project_id                   = var.project_id
#   region                       = var.region
#   environment                  = var.environment
#   service_name                 = var.service_name
#   container_image              = var.container_image
#   service_account_email        = module.iam.cloud_run_service_account_email
#   vercel_service_account_email = module.iam.vercel_service_account_email
#   min_instances                = var.min_instances
#   max_instances                = var.max_instances
#   cpu_limit                    = var.cpu_limit
#   memory_limit                 = var.memory_limit
#   allow_unauthenticated        = var.allow_unauthenticated
#   env_vars                     = var.env_vars
#   secret_env_vars              = var.secret_env_vars
#
#   depends_on = [google_project_service.apis]
# }
