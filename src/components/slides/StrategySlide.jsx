import React, { useState, useEffect, useRef } from 'react';
import { Zap, Utensils, Brain, Heart, Shield, Flame } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useSoundEffects } from '../../hooks/useSoundEffects';

/**
 * StrategySlide - Daily habit loadout
 * Final Mission: Equip all habits to complete the protocol
 */
export const StrategySlide = ({ onLoadoutUpdate }) => {
  const [loadout, setLoadout] = useState({
    smoothie: false,
    yogurt: false,
    creatine: false,
    activity: false
  });

  const { playEquip, playLevelUp } = useSoundEffects();
  const prevAllEquipped = useRef(false);

  const toggleItem = (item) => {
    playEquip();
    const newState = { ...loadout, [item]: !loadout[item] };
    setLoadout(newState);
    onLoadoutUpdate?.(Object.values(newState).every(Boolean));
  };

  const allEquipped = Object.values(loadout).every(Boolean);

  // Play level up sound when all equipped
  useEffect(() => {
    if (allEquipped && !prevAllEquipped.current) {
      playLevelUp();
    }
    prevAllEquipped.current = allEquipped;
  }, [allEquipped, playLevelUp]);

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
          <h2 className="text-3xl font-bold text-white mt-2">Daily Loadout</h2>
          <p className="text-slate-400 text-sm">Equip your habits to reach Level 5.</p>
        </div>

        {allEquipped && (
          <div className="animate-bounce bg-green-500 text-slate-900 font-black px-4 py-2 rounded-lg shadow-lg shadow-green-500/50">
            MISSION READY!
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">

        {/* Habit Selectors */}
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase font-mono mb-2">Select Habits to Equip:</p>

          {habits.map(({ key, icon: Icon, title, description, colorActive, iconActive }) => (
            <button
              key={key}
              onClick={() => toggleItem(key)}
              className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all group ${
                loadout[key]
                  ? colorActive
                  : 'bg-slate-800 border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`p-3 rounded-lg transition-colors ${
                loadout[key] ? iconActive : 'bg-slate-700 text-slate-400'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className={`font-bold ${loadout[key] ? 'text-white' : 'text-slate-300'}`}>
                  {title}
                </h4>
                <p className="text-xs text-slate-400">{description}</p>
              </div>
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
                {allEquipped ? "SYSTEM OPTIMIZED" : "AWAITING UPGRADE"}
              </h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                {allEquipped
                  ? "The machine is ready for growth. Hormesis activated."
                  : "Equip all 4 habits to complete the protocol."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const strategyScript = "Practical Application. We aren't fighting every day. We have two daily habits: The Power Smoothie, which sneaks in greens and protein, and the Greek Yogurt Bowl. Combined with 60 minutes of heart-pumping activity, we turn stress into growth.";

import strategyAudioFile from '../../sounds/Practical application.mp3';
export const strategyAudio = strategyAudioFile;
