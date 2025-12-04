import React, { useEffect, useRef } from 'react';
import { User, Dumbbell, Brain, Shield, Minimize2, Maximize2, Sword, Flame, Heart, Zap } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

/**
 * CharacterHUD - RPG-style character display
 * Shows player progression through the nutrition lessons
 * Positioned below the main frame for a game-like feel
 */
export const CharacterHUD = ({ currentSlide, allEquipped, isVisible, onToggle }) => {
  const { playLevelUp, playClick } = useSoundEffects();
  const prevLevel = useRef(1);

  const getLevel = () => {
    if (currentSlide === 4 && allEquipped) return 5;
    return Math.min(currentSlide + 1, 4);
  };

  const level = getLevel();

  // Play level up sound when level increases
  useEffect(() => {
    if (level > prevLevel.current) {
      playLevelUp();
    }
    prevLevel.current = level;
  }, [level, playLevelUp]);

  const statusConfig = {
    1: { label: "VULNERABLE", color: "text-red-400", icon: "!" },
    2: { label: "REINFORCED", color: "text-blue-400", icon: "+" },
    3: { label: "OPTIMIZED", color: "text-purple-400", icon: "*" },
    4: { label: "RESILIENT", color: "text-emerald-400", icon: "#" },
    5: { label: "LEGENDARY", color: "text-yellow-400 animate-pulse", icon: "!" },
  };

  const status = statusConfig[level];

  // Minimized state - just show a button to expand
  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-0 left-4 z-50 bg-slate-900 border-2 border-slate-600 border-b-0 px-4 py-2 rounded-t-xl shadow-lg hover:bg-slate-800 hover:border-blue-500 transition-all group"
        title="Show Character"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-800 rounded-lg border border-slate-600 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-mono text-slate-400 group-hover:text-white">LVL {level}</span>
          <Maximize2 className="w-3 h-3 text-slate-500" />
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-4 z-50 animate-in slide-in-from-bottom duration-300">
      {/* Main HUD Panel - sits below frame like a game UI */}
      <div className="bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 border-2 border-slate-600 border-b-0 rounded-t-2xl shadow-2xl overflow-hidden">

        {/* Header Bar */}
        <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Sword className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hero Status</span>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-500 hover:text-white p-1 hover:bg-slate-700 rounded transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>

        <div className="p-4 flex gap-4">
          {/* Character Avatar */}
          <div className="relative">
            <div className="w-24 h-32 bg-slate-950 rounded-xl border-2 border-slate-700 overflow-hidden relative flex flex-col items-center justify-center">

              {/* Level Badge */}
              <div className="absolute top-1 left-1 bg-yellow-600 text-yellow-100 text-[10px] px-1.5 py-0.5 rounded font-black z-10">
                {level}
              </div>

              {/* Character Layers */}
              <div className="relative w-16 h-20 flex items-center justify-center">
                {/* Base silhouette */}
                <User className={`w-14 h-14 absolute transition-all duration-500 ${level >= 1 ? 'text-slate-600' : 'text-slate-800'}`} />

                {/* Muscle layer */}
                {level >= 2 && (
                  <div className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-500">
                    <Dumbbell className="w-8 h-8 text-blue-500 opacity-70" />
                  </div>
                )}

                {/* Brain layer */}
                {level >= 3 && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-top duration-500">
                    <Brain className="w-6 h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  </div>
                )}

                {/* Shield border */}
                {level >= 4 && (
                  <div className="absolute inset-0 border-2 border-green-500 rounded-lg shadow-[inset_0_0_15px_rgba(34,197,94,0.3)] animate-in fade-in duration-500" />
                )}

                {/* Legendary glow */}
                {level >= 5 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-yellow-400 opacity-30 animate-pulse" />
                    <div className="absolute inset-0 bg-yellow-400/10 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Health/Energy bar at bottom */}
              <div className="absolute bottom-1 left-1 right-1">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
                    style={{ width: `${(level / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="flex flex-col justify-between py-1 min-w-[140px]">
            {/* Status */}
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</div>
              <div className={`text-sm font-black ${status.color}`}>
                [{status.icon}] {status.label}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <Heart className={`w-3 h-3 ${level >= 2 ? 'text-red-400' : 'text-slate-600'}`} />
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${level >= 2 ? 'bg-red-500' : 'bg-slate-700'}`} style={{ width: level >= 2 ? '100%' : '40%' }} />
                </div>
                <span className="text-[10px] text-slate-500 w-6">VIT</span>
              </div>

              <div className="flex items-center gap-2">
                <Zap className={`w-3 h-3 ${level >= 3 ? 'text-yellow-400' : 'text-slate-600'}`} />
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${level >= 3 ? 'bg-yellow-500' : 'bg-slate-700'}`} style={{ width: level >= 3 ? '100%' : '60%' }} />
                </div>
                <span className="text-[10px] text-slate-500 w-6">NRG</span>
              </div>

              <div className="flex items-center gap-2">
                <Brain className={`w-3 h-3 ${level >= 4 ? 'text-purple-400' : 'text-slate-600'}`} />
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${level >= 4 ? 'bg-purple-500' : 'bg-slate-700'}`} style={{ width: level >= 4 ? '100%' : '50%' }} />
                </div>
                <span className="text-[10px] text-slate-500 w-6">INT</span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>EXP</span>
                <span>{level * 20}/100</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-yellow-400 transition-all duration-1000 ease-out"
                  style={{ width: `${(level / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
