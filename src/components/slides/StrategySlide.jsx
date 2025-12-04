import React, { useState, useEffect, useRef } from 'react';
import { Zap, Utensils, Brain, Heart, Shield, Flame, X, Send, Loader2, CheckCircle, Volume2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useUserContext } from '../../context/UserContext';
import { callClaude } from '../../utils/claudeApi';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../../config';

// Quiz questions for each habit
const HABIT_QUESTIONS = {
  smoothie: {
    question: "What's a key ingredient that makes the Power Smoothie special for building muscle?",
    hint: "Think about what gives you the building blocks for growth!",
    correctKeywords: ['protein', 'greens', 'spinach', 'kale', 'yogurt', 'powder', 'whey', 'pea'],
  },
  yogurt: {
    question: "Why is Greek yogurt better than regular yogurt for athletes?",
    hint: "Compare the nutrition labels!",
    correctKeywords: ['protein', 'more protein', 'double', 'twice', '17', 'grams', 'building', 'muscle'],
  },
  creatine: {
    question: "How does creatine help your brain perform better?",
    hint: "Think about energy and batteries!",
    correctKeywords: ['energy', 'atp', 'battery', 'brain', 'memory', 'focus', 'thinking', 'math', 'power'],
  },
  activity: {
    question: "How many minutes of heart-pumping activity do kids need each day?",
    hint: "It's a specific number that's about an hour!",
    correctKeywords: ['60', 'sixty', 'hour', 'minutes', 'min'],
  },
};

/**
 * StrategySlide - Daily habit loadout with quiz gates
 * Final Mission: Answer questions to equip habits and complete the protocol
 */
export const StrategySlide = ({ onLoadoutUpdate }) => {
  const [loadout, setLoadout] = useState({
    smoothie: false,
    yogurt: false,
    creatine: false,
    activity: false
  });

  // Quiz modal state
  const [quizModal, setQuizModal] = useState(null); // { habit: 'smoothie' }
  const [quizAnswer, setQuizAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState(null); // { isCorrect: true, message: '...' }

  // Completion celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const { playEquip, playLevelUp, playSuccess, playError } = useSoundEffects();
  const { userState, updateHabits, updateSlideCompletion, updateHabitQuizAnswer, getStateSummary } = useUserContext();
  const prevAllEquipped = useRef(false);

  const allEquipped = Object.values(loadout).every(Boolean);

  // Report state to context for AI awareness
  useEffect(() => {
    const equipped = Object.entries(loadout)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    updateHabits(equipped);
  }, [loadout, updateHabits]);

  // Track slide completion - need all 4 habits equipped
  useEffect(() => {
    updateSlideCompletion('strategy', allEquipped);
  }, [allEquipped, updateSlideCompletion]);

  // Play level up sound and show celebration when all equipped
  useEffect(() => {
    if (allEquipped && !prevAllEquipped.current) {
      playLevelUp();
      generateCelebrationMessage();
    }
    prevAllEquipped.current = allEquipped;
  }, [allEquipped, playLevelUp]);

  // Open quiz modal for a habit
  const openQuiz = (habit) => {
    if (loadout[habit]) return; // Already equipped
    setQuizModal({ habit });
    setQuizAnswer('');
    setQuizFeedback(null);
  };

  // Evaluate quiz answer with Claude
  const evaluateAnswer = async () => {
    if (!quizAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setQuizFeedback(null);

    const habit = quizModal.habit;
    const questionData = HABIT_QUESTIONS[habit];

    try {
      const data = await callClaude({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        system: `You are evaluating a child's answer to a nutrition quiz question. Be encouraging and supportive.

Question: "${questionData.question}"
Expected keywords/concepts: ${questionData.correctKeywords.join(', ')}

Rules:
1. If the answer contains any of the expected keywords or shows understanding of the concept, mark it CORRECT
2. Be generous - if they're on the right track, it counts as correct
3. Return JSON only: {"isCorrect": true/false, "message": "short encouraging feedback"}
4. Keep the message under 20 words
5. If correct, celebrate! If incorrect, give a helpful hint`,
        messages: [{ role: 'user', content: `Child's answer: "${quizAnswer}"` }]
      });

      const result = JSON.parse(data.content[0].text);

      setQuizFeedback(result);

      if (result.isCorrect) {
        playSuccess();
        // Save the answer
        updateHabitQuizAnswer(habit, quizAnswer);
        // Equip the habit after a short delay
        setTimeout(() => {
          playEquip();
          setLoadout(prev => ({ ...prev, [habit]: true }));
          onLoadoutUpdate?.(Object.values({ ...loadout, [habit]: true }).every(Boolean));
          setQuizModal(null);
        }, 1500);
      } else {
        playError();
      }
    } catch (error) {
      console.error('Quiz evaluation error:', error);
      // Fallback: check keywords locally
      const hasKeyword = questionData.correctKeywords.some(kw =>
        quizAnswer.toLowerCase().includes(kw.toLowerCase())
      );

      if (hasKeyword) {
        setQuizFeedback({ isCorrect: true, message: "Great job! You got it!" });
        playSuccess();
        updateHabitQuizAnswer(habit, quizAnswer);
        setTimeout(() => {
          playEquip();
          setLoadout(prev => ({ ...prev, [habit]: true }));
          onLoadoutUpdate?.(Object.values({ ...loadout, [habit]: true }).every(Boolean));
          setQuizModal(null);
        }, 1500);
      } else {
        setQuizFeedback({ isCorrect: false, message: `Hint: ${questionData.hint}` });
        playError();
      }
    }

    setIsEvaluating(false);
  };

  // Generate personalized celebration message
  const generateCelebrationMessage = async () => {
    const userName = userState.userName || 'Champion';
    const summary = getStateSummary();

    try {
      const data = await callClaude({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        system: `You are Coach, celebrating a child who just completed all nutrition missions.
Create a personalized congratulations message. Use their data to make it special.
Keep it under 100 words. Be enthusiastic but not over-the-top. Focus on their specific achievements.`,
        messages: [{
          role: 'user',
          content: `Create a celebration message for ${userName} who just completed all missions.

Their journey:
${summary}

Quiz answers they gave:
- Power Smoothie: "${userState.habitQuizAnswers?.smoothie || 'protein'}"
- Greek Yogurt: "${userState.habitQuizAnswers?.yogurt || 'more protein'}"
- Creatine: "${userState.habitQuizAnswers?.creatine || 'brain energy'}"
- Activity: "${userState.habitQuizAnswers?.activity || '60 minutes'}"`
        }]
      });

      const message = data.content[0].text;
      setCelebrationMessage(message);
      setShowCelebration(true);
      // Auto-play the message
      speakMessage(message);
    } catch (error) {
      console.error('Celebration message error:', error);
      // Fallback message
      const fallbackMessage = `Congratulations ${userName}! You've completed all four missions and unlocked the full Bio-Protocol. You now know how to fuel your body with protein, boost your brain with creatine, manage your energy, and stay active. You're officially optimized for growth!`;
      setCelebrationMessage(fallbackMessage);
      setShowCelebration(true);
      speakMessage(fallbackMessage);
    }
  };

  // Speak message using ElevenLabs TTS
  const speakMessage = async (text) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
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
            model_id: 'eleven_flash_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      if (!response.ok) throw new Error('TTS failed');

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
      console.error('TTS error:', error);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const habits = [
    {
      key: 'smoothie',
      icon: Zap,
      title: 'Power Smoothie',
      description: 'Protein + Hidden Greens (Dose what we lack)',
      colorActive: 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      iconActive: 'bg-blue-500 text-white',
    },
    {
      key: 'yogurt',
      icon: Utensils,
      title: 'Greek Yogurt Bowl',
      description: 'High quality fuel foundation.',
      colorActive: 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      iconActive: 'bg-emerald-500 text-white',
    },
    {
      key: 'creatine',
      icon: Brain,
      title: 'Creatine Dose',
      description: 'Small dose for Memory & Math.',
      colorActive: 'bg-purple-900/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      iconActive: 'bg-purple-500 text-white',
    },
    {
      key: 'activity',
      icon: Heart,
      title: 'Heart Pumping',
      description: '60 mins. Active stress = Growth.',
      colorActive: 'bg-red-900/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      iconActive: 'bg-red-500 text-white',
    },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Badge color="yellow">Final Mission</Badge>
          <h2 className="text-2xl font-bold text-white mt-1">Daily Loadout</h2>
          <p className="text-slate-400 text-sm">Answer questions to equip each habit and reach Level 5.</p>
        </div>

        {allEquipped && (
          <div className="animate-bounce bg-green-500 text-slate-900 font-black px-4 py-2 rounded-lg shadow-lg shadow-green-500/50">
            MISSION COMPLETE!
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">

        {/* Habit Selectors */}
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase font-mono mb-2">Answer to Unlock:</p>

          {habits.map(({ key, icon: Icon, title, description, colorActive, iconActive }) => (
            <button
              key={key}
              onClick={() => openQuiz(key)}
              disabled={loadout[key]}
              className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all group ${
                loadout[key]
                  ? colorActive
                  : 'bg-slate-800 border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'
              }`}
            >
              <div className={`p-3 rounded-lg transition-colors ${
                loadout[key] ? iconActive : 'bg-slate-700 text-slate-400'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h4 className={`font-bold ${loadout[key] ? 'text-white' : 'text-slate-300'}`}>
                  {title}
                </h4>
                <p className="text-xs text-slate-400">{description}</p>
              </div>
              {loadout[key] ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">Quiz</span>
              )}
            </button>
          ))}
        </div>

        {/* Status Display */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className={`absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent transition-opacity duration-1000 ${
            allEquipped ? 'opacity-100' : 'opacity-0'
          }`} />

          <div className="relative z-10 text-center space-y-6">
            <div className={`w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-700 ${
              allEquipped
                ? 'border-green-400 bg-green-900/30 shadow-[0_0_60px_rgba(34,197,94,0.5)] scale-110'
                : 'border-slate-700 bg-slate-800'
            }`}>
              {allEquipped
                ? <Flame className="w-20 h-20 text-green-400 animate-pulse" />
                : <Shield className="w-20 h-20 text-slate-600" />
              }
            </div>

            <div>
              <h3 className={`text-2xl font-black uppercase tracking-widest ${
                allEquipped ? 'text-green-400 drop-shadow-lg' : 'text-slate-500'
              }`}>
                {allEquipped ? `${userState.userName || 'AGENT'} OPTIMIZED` : "AWAITING UPGRADE"}
              </h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                {allEquipped
                  ? "All systems go. The machine is ready for growth!"
                  : `${Object.values(loadout).filter(Boolean).length}/4 habits equipped`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {quizModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">
                {habits.find(h => h.key === quizModal.habit)?.title}
              </h3>
              <button
                onClick={() => setQuizModal(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 mb-4">
              {HABIT_QUESTIONS[quizModal.habit].question}
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && evaluateAnswer()}
                placeholder="Type your answer..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={evaluateAnswer}
                disabled={isEvaluating || !quizAnswer.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                {isEvaluating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {quizFeedback && (
              <div className={`p-4 rounded-lg ${
                quizFeedback.isCorrect
                  ? 'bg-green-900/50 border border-green-500 text-green-200'
                  : 'bg-orange-900/50 border border-orange-500 text-orange-200'
              }`}>
                {quizFeedback.isCorrect ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">{quizFeedback.message}</span>
                  </div>
                ) : (
                  <span>{quizFeedback.message}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-green-500/50 p-8 max-w-lg w-full mx-4 shadow-[0_0_60px_rgba(34,197,94,0.3)] animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Flame className="w-10 h-10 text-green-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-green-400 mb-2">
                CONGRATULATIONS!
              </h2>
              <p className="text-slate-400 text-sm">Protocol Complete</p>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700">
              <p className="text-slate-200 leading-relaxed">
                {celebrationMessage}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              {isSpeaking && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  Speaking...
                </div>
              )}
              <button
                onClick={() => setShowCelebration(false)}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const strategyScript = "Time for the final mission! To equip each habit, you'll need to answer a question about what you've learned. Think back to the previous missions. Power Smoothie gives us protein and hidden greens. Greek Yogurt is packed with high quality protein. Creatine tops off your brain battery. And 60 minutes of activity tells your body to grow stronger. Answer correctly to unlock each habit and complete the protocol!";
