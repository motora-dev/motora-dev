output "database_url_secret_name" {
  description = "Secret name for database URL"
  value       = google_secret_manager_secret.database_url.name
}

output "supabase_key_secret_name" {
  description = "Secret name for Supabase key"
  value       = google_secret_manager_secret.supabase_key.name
}
