import React, { useState, useMemo } from 'react';
import { RotateCcw, Scale, Trophy, Target, Utensils } from 'lucide-react';
import { Badge } from '../ui/Badge';

// Food items with realistic nutritional data
const FOODS = [
  // HIGH PROTEIN - Best choices! (cyan border)
  { id: 'smoothie', emoji: '🥤', name: 'Green Smoothie', calories: 250, protein: 20, carbs: 30 },
  { id: 'yogurt', emoji: '🥛', name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6 },
  { id: 'chicken', emoji: '🍗', name: 'Chicken', calories: 165, protein: 31, carbs: 0 },
  { id: 'egg', emoji: '🥚', name: 'Egg', calories: 70, protein: 6, carbs: 0 },
  { id: 'tofu', emoji: '🧱', name: 'Tofu', calories: 80, protein: 10, carbs: 2 },
  { id: 'cheese', emoji: '🧀', name: 'Cheese', calories: 110, protein: 7, carbs: 1 },
  { id: 'beans', emoji: '🫘', name: 'Beans', calories: 120, protein: 8, carbs: 20 },
  { id: 'nuts', emoji: '🥜', name: 'Nuts', calories: 170, protein: 6, carbs: 6 },

  // FRUITS
  { id: 'apple', emoji: '🍎', name: 'Apple', calories: 95, protein: 0, carbs: 25 },
  { id: 'banana', emoji: '🍌', name: 'Banana', calories: 105, protein: 1, carbs: 27 },
  { id: 'orange', emoji: '🍊', name: 'Orange', calories: 62, protein: 1, carbs: 15 },
  { id: 'grapes', emoji: '🍇', name: 'Grapes', calories: 104, protein: 1, carbs: 27 },
  { id: 'berries', emoji: '🫐', name: 'Berries', calories: 60, protein: 1, carbs: 14 },
  { id: 'watermelon', emoji: '🍉', name: 'Watermelon', calories: 46, protein: 1, carbs: 12 },

  // CARBS
  { id: 'cheerios', emoji: '🥣', name: 'Cheerios', calories: 100, protein: 3, carbs: 20 },
  { id: 'pasta', emoji: '🍝', name: 'Pasta+Sauce', calories: 220, protein: 8, carbs: 40 },
  { id: 'rice', emoji: '🍚', name: 'Rice', calories: 130, protein: 3, carbs: 28 },
  { id: 'bread', emoji: '🍞', name: 'Bread', calories: 80, protein: 3, carbs: 15 },

  // SWEETS (limited)
  { id: 'honey', emoji: '🍯', name: 'Honey', calories: 64, protein: 0, carbs: 17 },
  { id: 'chocolate', emoji: '🍫', name: 'Chocolate', calories: 120, protein: 2, carbs: 14 },

  // VEGETABLES
  { id: 'broccoli', emoji: '🥦', name: 'Veggies', calories: 30, protein: 3, carbs: 6 },
  { id: 'carrots', emoji: '🥕', name: 'Carrots', calories: 25, protein: 1, carbs: 6 },
];

const CALORIE_LIMIT = 2000;
const PROTEIN_TARGET_PER_KG = 1.6;

/**
 * DashboardSlide - Mission 1: Build Your Balanced Day
 * Weight-based protein calculator and meal builder
 */
export const DashboardSlide = () => {
  const [addedFoods, setAddedFoods] = useState([]);
  const [hoveredFood, setHoveredFood] = useState(null);
  const [weightLbs, setWeightLbs] = useState('');

  // Calculate weight in kg and protein target
  const weightKg = weightLbs ? parseFloat(weightLbs) / 2.205 : 0;
  const proteinTarget = weightKg ? Math.round(weightKg * PROTEIN_TARGET_PER_KG) : 0;

  // Calculate totals
  const totals = useMemo(() => {
    return addedFoods.reduce(
      (acc, f) => ({
        calories: acc.calories + f.calories,
        protein: acc.protein + f.protein,
        carbs: acc.carbs + f.carbs,
      }),
      { calories: 0, protein: 0, carbs: 0 }
    );
  }, [addedFoods]);

  // Check protein status
  const proteinPercent = proteinTarget ? Math.min((totals.protein / proteinTarget) * 100, 100) : 0;
  const proteinStatus = proteinTarget
    ? (totals.protein >= proteinTarget ? 'good' : totals.protein >= proteinTarget * 0.5 ? 'warning' : 'low')
    : 'none';

  const addFood = (food) => {
    if (totals.calories + food.calories <= CALORIE_LIMIT) {
      setAddedFoods([...addedFoods, food]);
    }
  };

  const reset = () => {
    setAddedFoods([]);
  };

  const caloriePercent = Math.min((totals.calories / CALORIE_LIMIT) * 100, 100);
  const carbPercent = Math.min((totals.carbs / 300) * 100, 100);

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Badge color="blue">Mission 1</Badge>
          <h2 className="text-2xl font-bold text-white mt-1">Build Your Day</h2>
          <p className="text-slate-400 text-xs">
            Enter your weight, then build a balanced day hitting your <span className="text-cyan-400">protein goal</span>!
          </p>
        </div>

        {/* Status indicator */}
        <div className={`px-3 py-2 rounded-lg border text-sm ${
          proteinStatus === 'good'
            ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300'
            : proteinStatus === 'warning'
              ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300'
              : 'bg-slate-800 border-slate-600 text-slate-400'
        }`}>
          {proteinStatus === 'good' && <><Trophy className="w-4 h-4 inline mr-1" /> Protein Goal Hit!</>}
          {proteinStatus === 'warning' && <><Target className="w-4 h-4 inline mr-1" /> Keep going!</>}
          {proteinStatus === 'low' && <><Target className="w-4 h-4 inline mr-1" /> Need more protein!</>}
          {proteinStatus === 'none' && <><Scale className="w-4 h-4 inline mr-1" /> Enter your weight</>}
        </div>
      </div>

      {/* Weight input for protein calculator */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-3 border border-cyan-700/50">
        <Scale className="w-5 h-5 text-cyan-400" />
        <span className="text-sm text-cyan-300 font-medium">Your weight:</span>
        <input
          type="number"
          value={weightLbs}
          onChange={(e) => setWeightLbs(e.target.value)}
          placeholder="lbs"
          className="w-20 px-3 py-1.5 text-sm bg-slate-800 border border-cyan-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
        />
        {proteinTarget > 0 && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-cyan-400 text-sm">
              Daily protein goal: <strong className="text-lg">{proteinTarget}g</strong>
            </span>
            <span className="text-slate-500 text-xs">(1.6g per kg)</span>
          </div>
        )}
      </div>

      {/* Stats bars */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        {/* Calories */}
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Calories</span>
            <span className={caloriePercent > 90 ? 'text-red-400' : ''}>{totals.calories}/{CALORIE_LIMIT}</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                caloriePercent > 90 ? 'bg-red-500' : caloriePercent > 70 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Protein - Most important! */}
        <div className={`rounded-lg p-2 border ${proteinStatus === 'good' ? 'bg-emerald-900/30 border-emerald-500' : 'bg-slate-800/50 border-slate-700'}`}>
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="text-cyan-400 font-medium">Protein</span>
            <span className={proteinStatus === 'good' ? 'text-emerald-400 font-bold' : proteinStatus === 'low' ? 'text-red-400' : ''}>
              {totals.protein}g{proteinTarget > 0 && `/${proteinTarget}g`}
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                proteinStatus === 'good' ? 'bg-emerald-500' : proteinStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Carbs</span>
            <span>{totals.carbs}g</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 bg-orange-500"
              style={{ width: `${carbPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Food selector */}
      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Build your meals:</span>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-14">
          {FOODS.map((food) => (
            <button
              key={food.id}
              onClick={() => addFood(food)}
              onMouseEnter={() => setHoveredFood(food)}
              onMouseLeave={() => setHoveredFood(null)}
              disabled={totals.calories + food.calories > CALORIE_LIMIT}
              className={`relative flex flex-col items-center p-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95 ${
                totals.calories + food.calories > CALORIE_LIMIT
                  ? 'bg-slate-800 border-slate-700 opacity-40 cursor-not-allowed'
                  : food.protein >= 10
                    ? 'bg-cyan-900/30 border-cyan-600 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                    : food.protein >= 5
                      ? 'bg-cyan-900/20 border-cyan-800 hover:border-cyan-600'
                      : 'bg-slate-700 border-slate-600 hover:border-slate-500'
              }`}
            >
              <span className="text-xl">{food.emoji}</span>
              <span className={`text-[9px] ${food.protein >= 10 ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                {food.protein}g P
              </span>
              {hoveredFood?.id === food.id && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap border border-slate-600 z-50 shadow-lg">
                  <div className="font-bold text-white">{food.name}</div>
                  <div className="text-slate-400">
                    {food.calories}cal | <span className="text-cyan-400">{food.protein}g protein</span> | {food.carbs}g carbs
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Today's meals display */}
      {addedFoods.length > 0 && (
        <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700">
          <span className="text-xs text-slate-500 mr-2">Today's meals:</span>
          <span className="text-lg">
            {addedFoods.map((food, i) => (
              <span key={i} className="mr-1">{food.emoji}</span>
            ))}
          </span>
        </div>
      )}

      {/* Tip */}
      <div className="text-center text-[10px] text-slate-500">
        <span className="text-cyan-400">Cyan glow</span> = High protein foods | Aim for {proteinTarget || '??'}g protein daily!
      </div>
    </div>
  );
};

export const dashboardScript = "Listen up team. We need a mindset shift. We don't eat just to get full. We eat to Build the Machine. Enter your weight and I'll calculate exactly how much protein you need. Then build your day to hit that goal!";

import dashboardAudioFile from '../../sounds/Listen up team.mp3';
export const dashboardAudio = dashboardAudioFile;
