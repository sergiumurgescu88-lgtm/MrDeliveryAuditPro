module.exports = {
  apps: [{
    name: 'mrdelivery-api',
    script: 'npx',
    args: 'tsx server.ts',
    cwd: '/var/www/mrdelivery.online/backend',
    env: {
      "NODE_ENV": "production",
      "PORT": "5174",
      "FRONTEND_URL": "https://mrdelivery.online",
      "GOOGLE_CLIENT_ID": "YOUR_GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET": "YOUR_GOOGLE_CLIENT_SECRET",
      "GOOGLE_PLACES_API_KEY": "YOUR_GMAPS_KEY",
      "GMAPS_KEY": "YOUR_GMAPS_KEY",
      "JWT_SECRET": "YOUR_JWT_SECRET",
      "SUPABASE_URL": "YOUR_SUPABASE_URL",
      "SUPABASE_ANON_KEY": "YOUR_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SUPABASE_SERVICE_ROLE_KEY",
      "OPENAI_API_KEY": "YOUR_OPENROUTER_KEY",
      "OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY",
      "OPENROUTER_BASE_URL": "https://openrouter.ai/api/v1",
      "OPENROUTER_MODEL": "google/gemini-2.5-flash",
      "STORAGE_PATH": "/var/www/mrdelivery.online/public",
      "UPLOAD_LIMIT": "50MB",
      "RESEND_API_KEY": "YOUR_RESEND_KEY",
      "STRIPE_SECRET_KEY": "YOUR_STRIPE_SECRET_KEY"
    }
  }]
}
