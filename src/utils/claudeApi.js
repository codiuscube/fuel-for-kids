import { CLAUDE_API_KEY } from '../config';

/**
 * Call Claude API - works locally (direct) and in production (via serverless)
 */
export async function callClaude({ model, max_tokens, system, messages }) {
  // In development with API key, call directly
  if (CLAUDE_API_KEY && import.meta.env.DEV) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model, max_tokens, system, messages }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API error');
    }

    return response.json();
  }

  // In production, use serverless function
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, max_tokens, system, messages }),
  });

  if (!response.ok) throw new Error('Claude API error');
  return response.json();
}
