import { useRef, useCallback } from 'react';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../config';

/**
 * useSoundEffects - Hook for playing ElevenLabs-generated sound effects
 *
 * Generates short audio clips via ElevenLabs TTS and caches them for instant playback.
 * Falls back to Web Audio API beeps if ElevenLabs fails.
 */
export const useSoundEffects = () => {
  const audioCache = useRef({});
  const audioContext = useRef(null);

  // Initialize Web Audio context for fallback sounds
  const getAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext.current;
  };

  // Generate sound via ElevenLabs
  const generateSound = async (text, cacheKey) => {
    // Check cache first
    if (audioCache.current[cacheKey]) {
      return audioCache.current[cacheKey];
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_flash_v2_5', // Cheapest model: 0.5 credits/char
            voice_settings: {
              stability: 0.8,
              similarity_boost: 0.5
            }
          })
        }
      );

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType?.includes('audio')) {
        throw new Error('Failed to generate sound');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache for reuse
      audioCache.current[cacheKey] = audioUrl;
      return audioUrl;
    } catch (error) {
      console.error('Sound generation error:', error);
      return null;
    }
  };

  // Play a cached or generated sound
  const playSound = async (text, cacheKey) => {
    const audioUrl = await generateSound(text, cacheKey);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Playback prevented:', e));
    }
  };

  // Fallback beep using Web Audio API
  const playBeep = (frequency = 440, duration = 0.1, type = 'sine') => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context not available
    }
  };

  // Pre-defined sound effects
  const playClick = useCallback(() => {
    playBeep(800, 0.05, 'sine');
  }, []);

  const playSuccess = useCallback(() => {
    // Two-tone success chime
    playBeep(523, 0.1, 'sine'); // C5
    setTimeout(() => playBeep(659, 0.15, 'sine'), 100); // E5
  }, []);

  const playError = useCallback(() => {
    playBeep(200, 0.2, 'sawtooth');
  }, []);

  const playLevelUp = useCallback(() => {
    // Ascending arpeggio
    playBeep(523, 0.1, 'sine'); // C5
    setTimeout(() => playBeep(659, 0.1, 'sine'), 80); // E5
    setTimeout(() => playBeep(784, 0.1, 'sine'), 160); // G5
    setTimeout(() => playBeep(1047, 0.2, 'sine'), 240); // C6
  }, []);

  const playEquip = useCallback(() => {
    playBeep(600, 0.08, 'square');
    setTimeout(() => playBeep(900, 0.1, 'square'), 50);
  }, []);

  const playTransition = useCallback(() => {
    // Whoosh effect - descending sweep
    const ctx = getAudioContext();
    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Fallback
    }
  }, []);

  const playAlarm = useCallback(() => {
    // Warning alarm
    playBeep(400, 0.15, 'sawtooth');
    setTimeout(() => playBeep(300, 0.15, 'sawtooth'), 150);
    setTimeout(() => playBeep(400, 0.15, 'sawtooth'), 300);
  }, []);

  // ElevenLabs voice sounds (for special moments)
  const playVoiceSound = useCallback(async (text, key) => {
    await playSound(text, key);
  }, []);

  return {
    playClick,
    playSuccess,
    playError,
    playLevelUp,
    playEquip,
    playTransition,
    playAlarm,
    playVoiceSound, // For custom voice sounds like "Level up!" or "Mission complete!"
  };
};
