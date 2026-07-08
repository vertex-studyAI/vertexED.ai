// Minimal diagnostic endpoint — disabled in production unless ENABLE_TEST_AGENTS=true

export const config = {
  maxDuration: 60,
  runtime: 'nodejs',
  memory: 1024,
};

export default async function handler(req: any, res: any) {
  const isProduction = process.env.VERCEL_ENV === 'production';
  const explicitlyEnabled = process.env.ENABLE_TEST_AGENTS === 'true';

  if (isProduction && !explicitlyEnabled) {
    return res.status(404).json({ error: 'Not found' });
  }

  const results: string[] = [];
  
  results.push(`Node version: ${process.version}`);
  results.push(`OPENAI_API_KEY set: ${!!process.env.OPENAI_API_KEY}`);
  results.push(`ChatbotKey set: ${!!process.env.ChatbotKey}`);
  
  // Test 1: Can we import OpenAI?
  try {
    const { OpenAI } = await import('openai');
    results.push('✅ OpenAI import: OK');
    
    // Test 1b: Can we create a client?
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      results.push('✅ OpenAI client creation: OK');
    } catch (e: any) {
      results.push(`❌ OpenAI client creation: ${e.message}`);
    }
  } catch (e: any) {
    results.push(`❌ OpenAI import: ${e.message}`);
  }
  
  // Test 2: Can we import zod?
  try {
    await import('zod');
    results.push('✅ zod import: OK');
  } catch (e: any) {
    results.push(`❌ zod import: ${e.message}`);
  }
  
  // Test 3: Can we import @openai/agents?
  try {
    await import('@openai/agents');
    results.push('✅ @openai/agents import: OK');
  } catch (e: any) {
    results.push(`❌ @openai/agents import: ${e.message}`);
  }
  
  // Test 4: Can we import @openai/guardrails?
  try {
    await import('@openai/guardrails');
    results.push('✅ @openai/guardrails import: OK');
  } catch (e: any) {
    results.push(`❌ @openai/guardrails import: ${e.message}`);
  }
  
  // agentWorkflow was removed; keep a note for diagnostics
  results.push('ℹ️ agentWorkflow: not present (archived as agentWorkflow.ts.backup)');

  res.status(200).json({ 
    results,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }
  });
}
