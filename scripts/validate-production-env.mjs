#!/usr/bin/env node

/** Explicit environment gate; kept separate from build so local builds need no production secrets. */
const required = [
  'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY', 'ADMIN_EMAILS', 'SIGNUP_INVITE_CODE', 'WAITLIST_RATE_LIMIT_SALT',
];
const aiCredentialGroups = [['OPENAI_API_KEY', 'ChatbotKey', 'CHATBOT_KEY'], ['GEMINI_API_KEY']];
const missing = required.filter((key) => !String(process.env[key] || '').trim());
const missingAiGroups = aiCredentialGroups.filter((group) => !group.some((key) => String(process.env[key] || '').trim()));

if (missing.length || missingAiGroups.length) {
  console.error('Production environment validation failed. Missing:');
  for (const key of missing) console.error(`  - ${key}`);
  for (const group of missingAiGroups) console.error(`  - one of: ${group.join(', ')}`);
  process.exit(1);
}
if (String(process.env.VITE_GEMINI_API_KEY || '').trim()) {
  console.error('Production environment validation failed: VITE_GEMINI_API_KEY must not be exposed to the browser.');
  process.exit(1);
}
console.log('Production environment validation passed.');
