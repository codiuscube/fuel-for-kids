// --- API KEYS ---
// For local development, create a .env.local file with:
// VITE_ELEVENLABS_API_KEY=your_key_here
// VITE_CLAUDE_API_KEY=your_key_here
export const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
export const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || '';

// ElevenLabs voice ID - "Rachel" is a clear, warm female voice
export const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
