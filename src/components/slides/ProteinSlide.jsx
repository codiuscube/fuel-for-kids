import React, { useState, useEffect, useRef } from 'react';
import { Utensils, AlertOctagon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useUserContext } from '../../context/UserContext';

/**
 * ProteinSlide - Interactive meal builder
 * Mission 1: Hit protein goals while keeping fat low
 */
export const ProteinSlide = () => {
  const [macros, setMacros] = useState({ p: 0, f: 0, c: 0, cal: 0 });
  const pTarget = 30;
  const fLimit = 25;
  const cMin = 20; // Minimum carbs for balance
  const calLimit = 500; // Calorie limit for a meal

  const { playClick, playSuccess, playAlarm } = useSoundEffects();
  const { updateProteinMeal } = useUserContext();
  const prevProteinMet = useRef(false);
  const prevFatBlowout = useRef(false);
  const prevCalorieBlowout = useRef(false);

  // Report state to context for AI awareness
  useEffect(() => {
    updateProteinMeal(macros);
  }, [macros, updateProteinMeal]);

  const foods = [
    { name: "Tomato Soup", p: 2, f: 0, c: 10, cal: 90, type: "weak", icon: "🍅" },
    { name: "Almond Milk", p: 1, f: 2.5, c: 1, cal: 30, type: "weak", icon: "🥛" },
    { name: "Annie's Mac & Cheese", p: 9, f: 10, c: 45, cal: 350, type: "good", icon: "🧀" },
    { name: "Bean & Cheese Taco", p: 12, f: 14, c: 30, cal: 300, type: "good", icon: "🌮" },
    { name: "Cheese Quesadilla", p: 12, f: 18, c: 25, cal: 350, type: "good", icon: "🌯" },
    { name: "PB & J Sandwich", p: 8, f: 12, c: 40, cal: 350, type: "good", icon: "🥜" },
    { name: "Ballerina Farm Whey", p: 24, f: 0, c: 2, cal: 110, type: "super", icon: "💪" },
    { name: "Pea Protein", p: 20, f: 1.5, c: 1, cal: 90, type: "super", icon: "🫛" },
    { name: "Bone Broth Ramen", p: 15, f: 5, c: 30, cal: 230, type: "super", icon: "🍜" },
    { name: "Greek Yogurt", p: 15, f: 0, c: 6, cal: 100, type: "super", icon: "🍦" },
  ];

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

  const isFatBlowout = macros.f > fLimit;
  const isCalorieBlowout = macros.cal > calLimit;
  const isProteinMet = macros.p >= pTarget;
  const isCarbsMet = macros.c >= cMin;
  const isBalanced = isProteinMet && isCarbsMet && !isFatBlowout && !isCalorieBlowout;

  // Sound effects for state changes
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
          <h2 className="text-3xl font-bold text-white mt-2">Balanced Fuel Protocol</h2>
          <p className="text-slate-400 text-sm mt-1">
            Goal: <strong className="text-blue-400">Protein</strong> + <strong className="text-purple-400">Carbs</strong>,
            under <strong className="text-yellow-400">Fat</strong> & <strong className="text-orange-400">Calorie</strong> limits.
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
              <Utensils className="w-4 h-4" /> Meal Builder
            </h3>
            <button
              onClick={reset}
              className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              Reset Plate
            </button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-2">
            {foods.map((food, idx) => (
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
            ))}
          </div>
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
                {isCalorieBlowout && "Too many calories. "}
                System sluggish.
              </p>
              <button
                onClick={reset}
                className="mt-6 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold"
              >
                RESET SYSTEM
              </button>
            </div>
          )}

          {/* Macro Bars */}
          <div className="space-y-4 w-full mt-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-bold">PROTEIN (Structure)</span>
                <span className="text-slate-500">{Math.round(macros.p)} / {pTarget}g</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${isProteinMet ? 'bg-green-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min((macros.p / pTarget) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-yellow-600 font-bold">FATS (Cost)</span>
                <span className="text-slate-500">{Math.round(macros.f)} / {fLimit}g</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${isFatBlowout ? 'bg-red-500' : 'bg-yellow-600'}`}
                  style={{ width: `${Math.min((macros.f / fLimit) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs - now a requirement */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-400 font-bold">CARBS (Fuel) - Min {cMin}g</span>
                <span className="text-slate-500">{Math.round(macros.c)} / {cMin}g+</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${isCarbsMet ? 'bg-green-500' : 'bg-purple-600'}`}
                  style={{ width: `${Math.min((macros.c / cMin) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Calories */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-400 font-bold">CALORIES (Limit)</span>
                <span className="text-slate-500">{Math.round(macros.cal)} / {calLimit}</span>
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
                BALANCED & OPTIMIZED!
              </div>
            ) : (
              <div className="text-slate-500 text-xs italic">
                {!isProteinMet && !isCarbsMet && "Need protein AND carbs for energy. "}
                {isProteinMet && !isCarbsMet && "Good protein! Add carbs for fuel. "}
                {!isProteinMet && isCarbsMet && "Good carbs! Add more protein. "}
                {isProteinMet && isCarbsMet && !isFatBlowout && !isCalorieBlowout && "Almost there!"}
                <br/>Tip: Ramen has protein + carbs. Pure protein powder needs pairing.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const proteinScript = "Welcome to the Balanced Fuel Protocol. Every cell in your body contains protein. Muscles use it to repair, and your brain uses it for focus chemicals. But you also need carbs for energy! Hit 30 grams of protein AND at least 20 grams of carbs. Watch your limits though. Too much fat slows you down, and too many calories overloads the system. Greek yogurt has 17 grams of protein, nearly double regular yogurt. Try combining foods for a balanced meal.";
