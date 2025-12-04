import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Utensils, AlertOctagon, Loader2, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useUserContext } from '../../context/UserContext';
import { callClaude } from '../../utils/claudeApi';

// Default protein-boosting options (always available)
const DEFAULT_PROTEIN_FOODS = [
  { name: "Greek Yogurt", p: 15, f: 0, c: 6, cal: 100, type: "super", icon: "🍦" },
  { name: "Protein Shake", p: 24, f: 1, c: 3, cal: 120, type: "super", icon: "💪" },
  { name: "Hard Boiled Egg", p: 6, f: 5, c: 0, cal: 70, type: "super", icon: "🥚" },
  { name: "String Cheese", p: 7, f: 5, c: 1, cal: 80, type: "good", icon: "🧀" },
];

/**
 * ProteinSlide - Dynamic meal builder based on user's food preferences
 * Mission 2: Build a single balanced meal with protein + carbs
 */
export const ProteinSlide = () => {
  const [macros, setMacros] = useState({ p: 0, f: 0, c: 0, cal: 0 });
  const [dynamicFoods, setDynamicFoods] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const pTarget = 30;
  const fLimit = 25;
  const cMin = 20;
  const calLimit = 500; // Single meal limit

  const { playClick, playSuccess, playAlarm } = useSoundEffects();
  const { userState, updateProteinMeal, updateSlideCompletion } = useUserContext();
  const prevProteinMet = useRef(false);
  const prevFatBlowout = useRef(false);
  const prevCalorieBlowout = useRef(false);

  // Generate dynamic meal options using Claude
  const generateMealOptions = useCallback(async () => {
    if (hasGenerated || isGenerating) return;

    setIsGenerating(true);

    const dashboardFoods = userState.dashboardFoods || [];
    const userName = userState.userName || 'friend';
    const proteinTarget = userState.proteinTarget || 70;

    // Build context about what they've already planned
    const foodContext = dashboardFoods.length > 0
      ? `They planned these foods for today: ${dashboardFoods.map(f => f.name).join(', ')}`
      : 'They haven\'t planned any specific foods yet';

    try {
      const response = await callClaude({
        model: 'claude-3-haiku-20240307',
        max_tokens: 800,
        system: `You are a nutrition API that generates kid-friendly meal options. Return ONLY valid JSON array.

Rules:
- Generate 6 meal options for a SINGLE MEAL (not whole day)
- Each meal should be 100-350 calories
- Mix of protein sources, carbs, and balanced options
- Use foods kids actually like
- Include realistic macro estimates
- Consider what they've already planned to eat today

Format: [{"name": "Food Name", "p": 12, "f": 5, "c": 20, "cal": 180, "type": "super|good|weak", "icon": "emoji"}]

Types:
- "super" = high protein (15g+), low fat
- "good" = decent protein, moderate other macros
- "weak" = low protein, use sparingly

Return ONLY the JSON array, no other text.`,
        messages: [{
          role: 'user',
          content: `Generate 6 single-meal food options for ${userName}.
${foodContext}
Their daily protein target is ${proteinTarget}g.
This meal should help them get ~30g protein with at least 20g carbs, under 25g fat and 500 calories.
Make suggestions that complement what they've already planned.`
        }]
      });

      const foods = JSON.parse(response.content[0].text);
      setDynamicFoods(foods);
    } catch (error) {
      console.error('Failed to generate meal options:', error);
      // Fallback to some default options
      setDynamicFoods([
        { name: "Chicken Wrap", p: 20, f: 8, c: 25, cal: 280, type: "super", icon: "🌯" },
        { name: "Turkey Sandwich", p: 18, f: 6, c: 30, cal: 300, type: "super", icon: "🥪" },
        { name: "Bean Burrito", p: 12, f: 10, c: 35, cal: 320, type: "good", icon: "🌮" },
        { name: "Mac & Cheese", p: 9, f: 12, c: 40, cal: 350, type: "good", icon: "🧀" },
        { name: "PB&J", p: 8, f: 12, c: 35, cal: 320, type: "good", icon: "🥜" },
        { name: "Fruit Cup", p: 1, f: 0, c: 20, cal: 80, type: "weak", icon: "🍇" },
      ]);
    }

    setIsGenerating(false);
    setHasGenerated(true);
  }, [userState.dashboardFoods, userState.userName, userState.proteinTarget, hasGenerated, isGenerating]);

  // Generate options on mount
  useEffect(() => {
    generateMealOptions();
  }, [generateMealOptions]);

  // Report state to context
  useEffect(() => {
    updateProteinMeal(macros);
  }, [macros, updateProteinMeal]);

  // Track slide completion
  const isFatBlowout = macros.f > fLimit;
  const isCalorieBlowout = macros.cal > calLimit;
  const isProteinMet = macros.p >= pTarget;
  const isCarbsMet = macros.c >= cMin;
  const isBalanced = isProteinMet && isCarbsMet && !isFatBlowout && !isCalorieBlowout;

  useEffect(() => {
    updateSlideCompletion('protein', isBalanced);
  }, [isBalanced, updateSlideCompletion]);

  // Combine dynamic foods with default protein boosters
  const allFoods = [...dynamicFoods, ...DEFAULT_PROTEIN_FOODS];

  const addFood = (item) => {
    playClick();
    setMacros(prev => ({
      p: Math.min(prev.p + item.p, 60),
      f: Math.min(prev.f + item.f, 60),
      c: Math.min(prev.c + item.c, 100),
      cal: prev.cal + item.cal
    }));
  };

  const reset = () => {
    playClick();
    setMacros({ p: 0, f: 0, c: 0, cal: 0 });
    prevProteinMet.current = false;
    prevFatBlowout.current = false;
    prevCalorieBlowout.current = false;
  };

  // Sound effects
  useEffect(() => {
    if (isBalanced && !prevProteinMet.current) {
      playSuccess();
    }
    prevProteinMet.current = isBalanced;
  }, [isBalanced, playSuccess]);

  useEffect(() => {
    if (isFatBlowout && !prevFatBlowout.current) {
      playAlarm();
    }
    prevFatBlowout.current = isFatBlowout;
  }, [isFatBlowout, playAlarm]);

  useEffect(() => {
    if (isCalorieBlowout && !prevCalorieBlowout.current) {
      playAlarm();
    }
    prevCalorieBlowout.current = isCalorieBlowout;
  }, [isCalorieBlowout, playAlarm]);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Badge color="blue">Mission 2</Badge>
          <h2 className="text-2xl font-bold text-white mt-1">Build One Balanced Meal</h2>
          <p className="text-slate-400 text-sm">
            Create a <strong className="text-cyan-400">single meal</strong> with{' '}
            <strong className="text-blue-400">{pTarget}g+ protein</strong> +{' '}
            <strong className="text-purple-400">{cMin}g+ carbs</strong>,
            under <strong className="text-yellow-400">{fLimit}g fat</strong> &{' '}
            <strong className="text-orange-400">{calLimit} cal</strong>
          </p>
        </div>
        <div className="bg-slate-800 p-2 rounded-lg border border-slate-600 text-right min-w-[140px] flex flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-400 gap-2">
            <span>PRO</span>
            <span className={isProteinMet ? "text-green-400" : "text-white"}>
              {Math.round(macros.p)}/{pTarget}g
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 gap-2">
            <span>CARB</span>
            <span className={isCarbsMet ? "text-green-400" : "text-white"}>
              {Math.round(macros.c)}/{cMin}g+
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 gap-2">
            <span>FAT</span>
            <span className={isFatBlowout ? "text-red-500 font-bold animate-pulse" : "text-white"}>
              {Math.round(macros.f)}/{fLimit}g
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 gap-2">
            <span>CAL</span>
            <span className={isCalorieBlowout ? "text-red-500 font-bold animate-pulse" : "text-white"}>
              {Math.round(macros.cal)}/{calLimit}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
        {/* Food Selector */}
        <Card className="flex flex-col bg-slate-900/50 overflow-hidden h-full">
          <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              {isGenerating ? 'Creating Your Menu...' : 'Your Personalized Menu'}
              {!isGenerating && dynamicFoods.length > 0 && (
                <Sparkles className="w-4 h-4 text-yellow-400" />
              )}
            </h3>
            <button
              onClick={reset}
              className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              Reset Plate
            </button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-2 overflow-y-auto">
            {isGenerating ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-8 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm">Personalizing menu based on your choices...</span>
              </div>
            ) : (
              allFoods.map((food, idx) => (
                <button
                  key={idx}
                  onClick={() => addFood(food)}
                  className={`p-2 rounded-lg border text-left transition-all active:scale-95 flex flex-col justify-center relative overflow-hidden group
                    ${food.type === 'super'
                      ? 'bg-blue-900/30 border-blue-500/50 hover:bg-blue-900/50'
                      : food.type === 'good'
                        ? 'bg-slate-800 border-slate-600 hover:bg-slate-700'
                        : 'bg-red-900/10 border-red-900/30 opacity-70 hover:opacity-100'
                    }`}
                >
                  <div className="flex justify-between w-full items-center z-10">
                    <span className="text-sm truncate pr-1">{food.icon} {food.name}</span>
                    <div className="flex flex-col items-end">
                      <span className={`font-mono text-[10px] font-bold ${food.type === 'super' ? 'text-blue-300' : 'text-slate-400'}`}>
                        P:{food.p} C:{food.c}
                      </span>
                      <span className="font-mono text-[9px] text-slate-500">F:{food.f} | {food.cal}cal</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-10 transition-opacity" />
                </button>
              ))
            )}
          </div>

          {/* Context hint */}
          {userState.dashboardFoods?.length > 0 && !isGenerating && (
            <div className="px-4 pb-3 border-t border-slate-700 pt-2">
              <p className="text-[10px] text-slate-500">
                <Sparkles className="w-3 h-3 inline mr-1 text-yellow-500" />
                Menu personalized based on: {userState.dashboardFoods.slice(0, 3).map(f => f.name).join(', ')}
                {userState.dashboardFoods.length > 3 && '...'}
              </p>
            </div>
          )}
        </Card>

        {/* Progress Display */}
        <div className="flex flex-col space-y-4 bg-slate-900/30 rounded-xl border border-slate-800/50 p-4 relative overflow-hidden">

          {/* Fat/Calorie Overload Warning */}
          {(isFatBlowout || isCalorieBlowout) && (
            <div className="absolute inset-0 bg-red-900/90 z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
              <AlertOctagon className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">
                {isFatBlowout && isCalorieBlowout ? "Double Overload" : isFatBlowout ? "Lipid Overload" : "Calorie Overload"}
              </h3>
              <p className="text-red-300 text-sm mt-2 text-center max-w-[200px]">
                {isFatBlowout && "Fat content exceeded limit. "}
                {isCalorieBlowout && "Too many calories for one meal. "}
                Try a lighter option!
              </p>
              <button
                onClick={reset}
                className="mt-6 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold"
              >
                RESET MEAL
              </button>
            </div>
          )}

          {/* Macro Bars */}
          <div className="space-y-4 w-full mt-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-bold">PROTEIN (Build Muscle)</span>
                <span className="text-slate-500">{Math.round(macros.p)} / {pTarget}g</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${isProteinMet ? 'bg-green-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min((macros.p / pTarget) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-400 font-bold">CARBS (Energy Fuel)</span>
                <span className="text-slate-500">{Math.round(macros.c)} / {cMin}g+</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${isCarbsMet ? 'bg-green-500' : 'bg-purple-600'}`}
                  style={{ width: `${Math.min((macros.c / cMin) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-yellow-600 font-bold">FAT (Limit)</span>
                <span className="text-slate-500">{Math.round(macros.f)} / {fLimit}g max</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${isFatBlowout ? 'bg-red-500' : 'bg-yellow-600'}`}
                  style={{ width: `${Math.min((macros.f / fLimit) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Calories */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-400 font-bold">MEAL CALORIES</span>
                <span className="text-slate-500">{Math.round(macros.cal)} / {calLimit} max</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${isCalorieBlowout ? 'bg-red-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.min((macros.cal / calLimit) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center mt-auto">
            {isBalanced ? (
              <div className="animate-bounce bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                PERFECT MEAL! 🎉
              </div>
            ) : (
              <div className="text-slate-500 text-xs italic">
                {!isProteinMet && !isCarbsMet && "Need protein AND carbs for a balanced meal. "}
                {isProteinMet && !isCarbsMet && "Great protein! Add some carbs for energy. "}
                {!isProteinMet && isCarbsMet && "Good carbs! Boost your protein. "}
                {isProteinMet && isCarbsMet && !isFatBlowout && !isCalorieBlowout && "Almost there!"}
                <br/>
                <span className="text-cyan-400">Tip:</span> Greek yogurt + a wrap = balanced meal!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const proteinScript = "Now let's build ONE perfect meal! Based on the foods you picked earlier, I've created a personalized menu just for you. Your goal: hit 30 grams of protein AND at least 20 grams of carbs in a single meal. But watch out! Keep fat under 25 grams and total calories under 500. This teaches you how to build balanced meals. The blue-highlighted foods are protein powerhouses. Try combining a protein source with some carbs!";
