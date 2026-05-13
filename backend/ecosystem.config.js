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
    "GOOGLE_PLACES_API_KEY": "AIzaSyBP2MBrIGT1npbEpY79p_z5Jn1n5GoZPqc",
    "GMAPS_KEY": "AIzaSyBP2MBrIGT1npbEpY79p_z5Jn1n5GoZPqc",
    "JWT_SECRET": "U4nrRewgwRB/CyN77GpcehSQ9SPulCgSPr+ecxhQtcWwCKwCNrhMu7fBqhQ5ggTQty1jLdD3LZGYI2yIHEvHIQ==",
    "SUPABASE_URL": "https://jwxyywlseonoazarhlzv.supabase.co",
    "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eXh5d2xzZW9ub2F6YXJobHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Mjg1NTMsImV4cCI6MjA5NDAwNDU1M30.L-yq0ibWJ3IbPazd09D1t1Qae1GgwCVh3bM8QzRWquI",
    "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eXh5d2xzZW9ub2F6YXJobHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQyODU1MywiZXhwIjoyMDk0MDA0NTUzfQ.6EYe28k8l-KHT_PxjQTwnSwKuTs9BXs7SYHz-JcphOw",
    "OPENAI_API_KEY": "YOUR_OPENROUTER_KEY",
    "OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY",
    "OPENROUTER_BASE_URL": "https://openrouter.ai/api/v1",
    "OPENROUTER_MODEL": "google/gemini-2.0-flash-exp:free",
    "STORAGE_PATH": "/var/www/mrdelivery.online/public",
    "UPLOAD_LIMIT": "50MB",
    "RESEND_API_KEY": "YOUR_RESEND_KEY",
    "STRIPE_SECRET_KEY": "YOUR_STRIPE_SECRET_KEY"
}
  }]
};