import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../config';
import { useUserContext } from '../context/UserContext';
import { callClaude } from '../utils/claudeApi';

// Nutrition knowledge base for accurate Q&A
const NUTRITION_SYSTEM_PROMPT = `You are Coach, a friendly nutrition expert helping kids learn about nutrition. Use this knowledge to answer questions accurately:

## PROTEIN REQUIREMENTS (CRITICAL - USE THESE NUMBERS!)
- Target: 1.6 grams of protein per kilogram of body weight
- Minimum: 1.2 g/kg | Optimal: 1.4 g/kg | Recommended: 1.7 g/kg
- To convert: pounds ÷ 2.2 = kilograms

PROTEIN EXAMPLES BY WEIGHT:
- 60 lbs (27 kg) → 43g protein daily
- 80 lbs (36 kg) → 58g protein daily
- 100 lbs (45 kg) → 72g protein daily
- 120 lbs (54 kg) → 86g protein daily
- 140 lbs (64 kg) → 102g protein daily
- 160 lbs (73 kg) → 117g protein daily
- 180 lbs (82 kg) → 131g protein daily
- 190 lbs (86 kg) → 138g protein daily
- 200 lbs (91 kg) → 146g protein daily

## BEST PROTEIN SOURCES
- Greek Yogurt (6oz): 17g protein - nearly double regular yogurt!
- Eggs: 6-7g each - gold standard, excellent choline
- Chicken (4oz): 31g protein
- Tofu (1/2 cup): 10g protein
- Cottage Cheese (1 cup): 28g protein
- Green Smoothie (with yogurt/protein): 15-20g
- Beans (1 cup): 15g protein
- Nuts (1/4 cup): 6g protein

## BLOOD SUGAR & ENERGY
- Sugar limit: ≤25g (6 teaspoons) daily for kids
- Sugar causes spike → crash → "THE BONK"
- Insulin is like a key that opens cells for energy
- Sugar "jams the lock" causing crashes
- Protein and fiber = steady energy, no crash

## CREATINE FOR VEGETARIANS
- Vegetarians have 10-20% lower creatine levels
- Benefits: improved memory, focus, brain energy
- Safe dose: 1-3g daily maintenance
- Brain uses 20% of body's energy!

## EXERCISE GUIDELINES
- Kids need 60+ minutes daily of moderate-vigorous activity
- Strength training 3+ days/week (safe for kids when supervised!)
- Growth happens during REST, not during exercise

## KEY RULES FOR ANSWERS
1. Always calculate protein using 1.6g per kg (divide lbs by 2.2 first)
2. Keep answers short (2-3 sentences max)
3. Use simple, fun language for kids
4. Be encouraging, never judgmental about food choices`;

/**
 * HelperBot - AI-powered assistant with TTS and Q&A
 * Auto-plays script on slide change using TTS, simple Q&A below
 */
export const HelperBot = ({
  script,
  isVisible,
  onToggle,
  currentSlide
}) => {
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const audioRef = useRef(null);
  const abortControllerRef = useRef(null);
  const hasPlayedScript = useRef(false);

  // Q&A State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Get user context for personalized Q&A
  const { getStateSummary } = useUserContext();

  // Track user interaction (needed for autoplay)
  useEffect(() => {
    const handleInteraction = () => {
      setUserHasInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Auto-play script when slide changes (only after user interaction)
  useEffect(() => {
    // Stop any current audio
    stopAudio();
    setAnswer('');
    hasPlayedScript.current = false;

    // Auto-play TTS after user has interacted
    if (isVisible && script && userHasInteracted) {
      const timer = setTimeout(() => {
        if (!hasPlayedScript.current) {
          hasPlayedScript.current = true;
          speak(script);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, script, userHasInteracted]);

  // Also auto-play when bot becomes visible (after user interaction)
  useEffect(() => {
    if (isVisible && script && !hasPlayedScript.current && !isSpeaking && userHasInteracted) {
      hasPlayedScript.current = true;
      speak(script);
    }
  }, [isVisible, userHasInteracted]);

  // Stop all audio
  const stopAudio = () => {
    // Cancel any pending fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Stop browser speech synthesis
    window.speechSynthesis.cancel();
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  // ElevenLabs Text-to-Speech
  const speak = async (text) => {
    // Stop any existing audio first
    stopAudio();

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

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
            model_id: 'eleven_flash_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          }),
          signal: abortControllerRef.current.signal
        }
      );

      const contentType = response.headers.get('content-type');

      if (!response.ok || !contentType?.includes('audio')) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('ElevenLabs API Error:', errorData);
        throw new Error('ElevenLabs failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      await audioRef.current.play();
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, don't show error
        return;
      }
      console.error('TTS Error:', error.message);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Claude Haiku Q&A
  const askQuestion = async () => {
    if (!question.trim()) return;

    // Stop any currently playing audio
    stopAudio();

    setIsAsking(true);
    setAnswer('');

    // Get user's current state for personalized answers
    const userStateSummary = getStateSummary();
    console.log('[HelperBot] User State for Q&A:', userStateSummary);

    const fullSystemPrompt = `${NUTRITION_SYSTEM_PROMPT}

## CURRENT USER DATA (USE THIS FOR PERSONALIZED ANSWERS!)
${userStateSummary}

## Current lesson context:
${script}`;

    try {
      const data = await callClaude({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        system: fullSystemPrompt,
        messages: [{ role: 'user', content: question }]
      });

      const answerText = data.content[0].text;
      setAnswer(answerText);
      // Auto-play the answer
      speak(answerText);
    } catch (error) {
      console.error('Q&A Error:', error);
      setAnswer("Oops! I couldn't answer that right now. Try asking again!");
    }

    setIsAsking(false);
    setQuestion('');
  };

  // Collapsed state
  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-500 transition-colors z-30"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 flex items-end justify-end animate-in slide-in-from-right duration-300">
      {/* Chat Panel */}
      <div className="mr-4 mb-2 bg-slate-800/95 border border-blue-500/30 p-4 rounded-xl rounded-br-none shadow-2xl backdrop-blur-md max-w-sm md:max-w-md">

        {/* Header - just close button */}
        <div className="flex justify-end mb-3">
          <button
            onClick={onToggle}
            className="text-slate-500 hover:text-white p-1"
          >
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Script Text */}
        <p className="text-sm leading-snug text-slate-200 mb-4">
          {script}
        </p>

        {/* Answer (if any) */}
        {answer && (
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-200">{answer}</p>
          </div>
        )}

        {/* Question Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
            placeholder="Ask me anything..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={askQuestion}
            disabled={isAsking || !question.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-2 rounded-lg transition-colors"
          >
            {isAsking
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {/* Bot Avatar */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-lg shadow-lg border-2 bg-blue-600 border-blue-400 relative overflow-hidden flex items-center justify-center">
          <div className="space-y-1 text-center">
            {isSpeaking ? (
              <div className="flex gap-1 justify-center items-center h-4">
                <div className="w-1 h-3 bg-white rounded-full animate-[bounce_0.5s_infinite]"></div>
                <div className="w-1 h-5 bg-white rounded-full animate-[bounce_0.6s_infinite]"></div>
                <div className="w-1 h-2 bg-white rounded-full animate-[bounce_0.4s_infinite]"></div>
              </div>
            ) : isAsking ? (
              <Loader2 className="w-6 h-6 text-white animate-spin mx-auto" />
            ) : (
              <div className="flex gap-2 justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="w-8 h-1 bg-white/50 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
