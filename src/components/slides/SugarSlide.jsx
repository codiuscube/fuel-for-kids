import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, Zap, AlertTriangle, Trophy, Flame, Skull } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useUserContext } from '../../context/UserContext';

// Foods organized by their blood sugar impact
const FOODS = [
  // SUGAR BOMBS - High spike, short duration (RED)
  { id: 'candy', emoji: '🍬', name: 'Candy', spike: 55, duration: 2, category: 'sugar' },
  { id: 'soda', emoji: '🧃', name: 'Soda', spike: 60, duration: 2, category: 'sugar' },
  { id: 'cookie', emoji: '🍪', name: 'Cookie', spike: 50, duration: 2, category: 'sugar' },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream', spike: 52, duration: 2, category: 'sugar' },
  { id: 'cake', emoji: '🍰', name: 'Cake', spike: 58, duration: 2, category: 'sugar' },
  { id: 'donut', emoji: '🍩', name: 'Donut', spike: 55, duration: 2, category: 'sugar' },

  // MEDIUM CARBS - Moderate spike (YELLOW)
  { id: 'bread', emoji: '🍞', name: 'White Bread', spike: 35, duration: 3, category: 'carb' },
  { id: 'pasta', emoji: '🍝', name: 'Pasta', spike: 30, duration: 4, category: 'carb' },
  { id: 'rice', emoji: '🍚', name: 'White Rice', spike: 32, duration: 3, category: 'carb' },
  { id: 'banana', emoji: '🍌', name: 'Banana', spike: 25, duration: 4, category: 'carb' },
  { id: 'cheerios', emoji: '🥣', name: 'Cereal', spike: 30, duration: 3, category: 'carb' },

  // STEADY FUEL - Low spike, long duration (GREEN)
  { id: 'apple', emoji: '🍎', name: 'Apple', spike: 12, duration: 5, category: 'good' },
  { id: 'berries', emoji: '🫐', name: 'Berries', spike: 8, duration: 5, category: 'good' },
  { id: 'yogurt', emoji: '🥛', name: 'Greek Yogurt', spike: 5, duration: 6, category: 'good' },
  { id: 'egg', emoji: '🥚', name: 'Eggs', spike: 0, duration: 6, category: 'good' },
  { id: 'chicken', emoji: '🍗', name: 'Chicken', spike: 0, duration: 7, category: 'good' },
  { id: 'nuts', emoji: '🥜', name: 'Nuts', spike: 3, duration: 7, category: 'good' },
  { id: 'veggies', emoji: '🥦', name: 'Veggies', spike: 2, duration: 6, category: 'good' },
  { id: 'cheese', emoji: '🧀', name: 'Cheese', spike: 2, duration: 6, category: 'good' },
];

/**
 * SugarSlide - Mission 3: Energy Management
 * Understanding blood sugar spikes and crashes
 */
export const SugarSlide = () => {
  const [addedFoods, setAddedFoods] = useState([]);
  const [hoveredFood, setHoveredFood] = useState(null);
  const { updateSugarFoods, updateSlideCompletion } = useUserContext();

  // Count sugar items for carb overload
  const sugarCount = addedFoods.filter(f => f.category === 'sugar').length;
  const carbOverload = sugarCount >= 3;

  // Report state to context for AI awareness
  useEffect(() => {
    updateSugarFoods(addedFoods);
  }, [addedFoods, updateSugarFoods]);

  // Generate the blood sugar curve
  const generateCurve = useMemo(() => {
    const points = [];
    const numPoints = 100;

    for (let i = 0; i < numPoints; i++) {
      const x = (i / numPoints) * 400;
      let y = 100; // baseline

      addedFoods.forEach((food, foodIndex) => {
        const foodX = (foodIndex / Math.max(addedFoods.length, 1)) * 300 + 50;
        const distance = Math.abs(x - foodX);
        const spreadFactor = food.duration * 15;

        if (distance < spreadFactor * 2) {
          const effect = food.spike * Math.exp(-Math.pow(distance / spreadFactor, 2));
          y -= effect;
        }
      });

      // Add crash effect after sugar spikes
      if (sugarCount >= 2) {
        const crashX = 300;
        const crashDistance = Math.abs(x - crashX);
        if (crashDistance < 80 && x > 250) {
          y += sugarCount * 8 * Math.exp(-Math.pow(crashDistance / 40, 2));
        }
      }

      points.push({ x, y: Math.max(10, Math.min(190, y)) });
    }

    return points;
  }, [addedFoods, sugarCount]);

  // Convert points to SVG path
  const pathD = useMemo(() => {
    if (generateCurve.length === 0) return 'M0,100 L400,100';

    let d = `M${generateCurve[0].x},${generateCurve[0].y}`;
    for (let i = 1; i < generateCurve.length; i++) {
      d += ` L${generateCurve[i].x},${generateCurve[i].y}`;
    }
    return d;
  }, [generateCurve]);

  // Determine status
  const scoreStatus = useMemo(() => {
    if (addedFoods.length === 0) return 'empty';
    if (carbOverload) return 'overload';

    const maxSpike = Math.min(...generateCurve.map(p => p.y));
    const minDip = Math.max(...generateCurve.map(p => p.y));

    if (maxSpike < 30) return 'danger';
    if (minDip > 150) return 'crash';
    if (sugarCount >= 2) return 'warning';
    if (maxSpike >= 60 && minDip <= 120) return 'good';
    return 'warning';
  }, [generateCurve, addedFoods, carbOverload, sugarCount]);

  // Track slide completion - need to achieve 'good' status (steady energy)
  useEffect(() => {
    updateSlideCompletion('sugar', scoreStatus === 'good');
  }, [scoreStatus, updateSlideCompletion]);

  const addFood = (food) => {
    if (addedFoods.length < 8) {
      setAddedFoods([...addedFoods, food]);
    }
  };

  const reset = () => {
    setAddedFoods([]);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Badge color="red">Mission 4</Badge>
          <h2 className="text-2xl font-bold text-white mt-1">Energy Management</h2>
          <p className="text-slate-400 text-sm">
            See how different foods affect your blood sugar. Avoid <span className="text-red-400">THE BONK</span>!
          </p>
        </div>

        {/* Score indicator */}
        <div className={`px-3 py-2 rounded-lg border text-sm ${
          scoreStatus === 'good' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' :
          scoreStatus === 'warning' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300' :
          scoreStatus === 'danger' ? 'bg-red-900/50 border-red-500 text-red-300 animate-pulse' :
          scoreStatus === 'crash' ? 'bg-orange-900/50 border-orange-500 text-orange-300' :
          scoreStatus === 'overload' ? 'bg-purple-900/50 border-purple-500 text-purple-300 animate-pulse' :
          'bg-slate-800 border-slate-600 text-slate-400'
        }`}>
          {scoreStatus === 'good' && <><Trophy className="w-4 h-4 inline mr-1" /> Steady Energy!</>}
          {scoreStatus === 'warning' && <><AlertTriangle className="w-4 h-4 inline mr-1" /> Watch the sugar!</>}
          {scoreStatus === 'danger' && <><Zap className="w-4 h-4 inline mr-1" /> SUGAR SPIKE!</>}
          {scoreStatus === 'crash' && <><Skull className="w-4 h-4 inline mr-1" /> THE BONK!</>}
          {scoreStatus === 'overload' && <><Flame className="w-4 h-4 inline mr-1" /> SUGAR OVERLOAD!</>}
          {scoreStatus === 'empty' && <>Try some foods!</>}
        </div>
      </div>

      {/* Food Categories */}
      <div className="grid grid-cols-3 gap-2">
        {/* Sugar Bombs */}
        <div className="bg-red-900/20 rounded-lg p-2 border border-red-800">
          <div className="text-xs text-red-400 font-bold mb-2 text-center">SUGAR BOMBS</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {FOODS.filter(f => f.category === 'sugar').map((food) => (
              <button
                key={food.id}
                onClick={() => addFood(food)}
                onMouseEnter={() => setHoveredFood(food)}
                onMouseLeave={() => setHoveredFood(null)}
                disabled={addedFoods.length >= 8}
                className="relative p-1.5 rounded-lg border border-red-700 bg-red-900/30 hover:bg-red-800/50 hover:border-red-500 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
              >
                <span className="text-xl">{food.emoji}</span>
                {hoveredFood?.id === food.id && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap border border-red-600 z-10">
                    {food.name} - <span className="text-red-400">High spike!</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Medium Carbs */}
        <div className="bg-yellow-900/20 rounded-lg p-2 border border-yellow-800">
          <div className="text-xs text-yellow-400 font-bold mb-2 text-center">MEDIUM CARBS</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {FOODS.filter(f => f.category === 'carb').map((food) => (
              <button
                key={food.id}
                onClick={() => addFood(food)}
                onMouseEnter={() => setHoveredFood(food)}
                onMouseLeave={() => setHoveredFood(null)}
                disabled={addedFoods.length >= 8}
                className="relative p-1.5 rounded-lg border border-yellow-700 bg-yellow-900/30 hover:bg-yellow-800/50 hover:border-yellow-500 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
              >
                <span className="text-xl">{food.emoji}</span>
                {hoveredFood?.id === food.id && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap border border-yellow-600 z-10">
                    {food.name} - <span className="text-yellow-400">Moderate spike</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Steady Fuel */}
        <div className="bg-emerald-900/20 rounded-lg p-2 border border-emerald-800">
          <div className="text-xs text-emerald-400 font-bold mb-2 text-center">STEADY FUEL</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {FOODS.filter(f => f.category === 'good').map((food) => (
              <button
                key={food.id}
                onClick={() => addFood(food)}
                onMouseEnter={() => setHoveredFood(food)}
                onMouseLeave={() => setHoveredFood(null)}
                disabled={addedFoods.length >= 8}
                className="relative p-1.5 rounded-lg border border-emerald-700 bg-emerald-900/30 hover:bg-emerald-800/50 hover:border-emerald-500 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
              >
                <span className="text-xl">{food.emoji}</span>
                {hoveredFood?.id === food.id && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap border border-emerald-600 z-10">
                    {food.name} - <span className="text-emerald-400">Steady energy!</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sugar Overload Warning */}
      {carbOverload && (
        <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-3 text-center animate-pulse">
          <Flame className="w-5 h-5 inline mr-2 text-purple-300" />
          <span className="text-purple-200 font-bold">
            SUGAR OVERLOAD! Too many sweets = insulin jam = THE BONK!
          </span>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="relative flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner min-h-[180px]">
        {/* Ideal zone */}
        <div
          className="absolute left-0 right-0 bg-emerald-500/10 border-y border-emerald-500/30"
          style={{ top: '35%', height: '20%' }}
        />
        <span className="absolute right-2 text-[10px] text-emerald-500/70 font-bold" style={{ top: '37%' }}>
          IDEAL ZONE
        </span>

        {/* Danger zone (top - spike) */}
        <div
          className="absolute left-0 right-0 bg-red-500/10 border-b border-red-500/30"
          style={{ top: 0, height: '25%' }}
        />
        <span className="absolute right-2 text-[10px] text-red-500/60 font-bold" style={{ top: '8%' }}>
          SUGAR SPIKE
        </span>

        {/* Crash zone (bottom - the bonk) */}
        <div
          className="absolute left-0 right-0 bg-orange-500/15 border-t border-orange-500/40"
          style={{ bottom: 0, height: '20%' }}
        />
        <div className="absolute right-2 text-[10px] text-orange-500/70 font-bold flex items-center gap-1" style={{ bottom: '5%' }}>
          <Skull className="w-3 h-3" /> THE BONK
        </div>

        {/* Baseline */}
        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-slate-600/50" />

        {/* Time labels */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4 text-[10px] text-slate-500">
          <span>Eat</span>
          <span>30 min</span>
          <span>1 hour</span>
          <span>2 hours</span>
        </div>

        {/* Graph */}
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <path
            d={pathD}
            fill="none"
            stroke={
              scoreStatus === 'good' ? '#10b981' :
              scoreStatus === 'warning' ? '#eab308' :
              scoreStatus === 'danger' ? '#ef4444' :
              scoreStatus === 'crash' ? '#f97316' :
              scoreStatus === 'overload' ? '#a855f7' :
              '#64748b'
            }
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        {/* Food emoji indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-around px-8">
          {addedFoods.map((food, i) => (
            <span
              key={i}
              className={`text-lg ${food.category === 'sugar' ? 'animate-bounce' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {food.emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Reset and explanation */}
      <div className="flex items-center justify-between">
        <button
          onClick={reset}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <div className="text-xs text-slate-500 text-right max-w-md">
          <strong className="text-slate-400">The Insulin Key:</strong> Sugar jams the lock.
          When jammed, energy crashes. Choose <span className="text-emerald-400">steady fuel</span> to avoid THE BONK!
        </div>
      </div>
    </div>
  );
};

export const sugarScript = "I want to teach you how your body works. Insulin is a key that opens your cells to let energy in. When blood sugar rises fast, your pancreas releases insulin. But sugar jams the lock! Candy spikes then crashes your blood sugar. That crash is called The Bonk. Keep sugar under 25 grams daily, that's just 6 teaspoons. Choose steady fuel like protein and fiber to avoid the crash.";
