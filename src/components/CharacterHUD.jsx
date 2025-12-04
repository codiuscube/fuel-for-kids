import React, { useEffect, useRef } from 'react';
import { Minimize2, Maximize2 } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

/**
 * CharacterHUD - RPG-style character display
 * Character starts in underwear and gains equipment as they progress
 * Equipment: Boots (L1) → Pants (L2) → Armor (L3) → Sword (L4) → Shield (L5)
 */
export const CharacterHUD = ({ currentSlide, allEquipped, isVisible, onToggle }) => {
  const { playLevelUp } = useSoundEffects();
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

  const equipmentConfig = {
    1: { name: "Recruit", equipment: [], color: "text-slate-400" },
    2: { name: "Trainee", equipment: ["boots"], color: "text-blue-400" },
    3: { name: "Warrior", equipment: ["boots", "armor"], color: "text-purple-400" },
    4: { name: "Champion", equipment: ["boots", "armor", "sword"], color: "text-emerald-400" },
    5: { name: "LEGEND", equipment: ["boots", "armor", "sword", "shield"], color: "text-yellow-400" },
  };

  const config = equipmentConfig[level];
  const hasBoots = config.equipment.includes("boots");
  const hasArmor = config.equipment.includes("armor");
  const hasSword = config.equipment.includes("sword");
  const hasShield = config.equipment.includes("shield");

  // Minimized state
  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-50 bg-slate-900 border-2 border-slate-600 px-3 py-2 rounded-xl shadow-lg hover:bg-slate-800 hover:border-blue-500 transition-all group"
        title="Show Character"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧒</span>
          <span className="text-xs font-mono text-slate-400 group-hover:text-white">LVL {level}</span>
          <Maximize2 className="w-3 h-3 text-slate-500" />
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left duration-300">
      <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 rounded-2xl shadow-2xl overflow-hidden ${
        level >= 5 ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'border-slate-600'
      }`}>

        {/* Header */}
        <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-widest ${config.color}`}>
              {config.name}
            </span>
            <span className="text-[10px] text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
              LVL {level}
            </span>
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
          {/* Character Display */}
          <div className="relative">
            <div className={`w-28 h-36 bg-slate-950 rounded-xl border-2 overflow-hidden relative ${
              level >= 5 ? 'border-yellow-500' : 'border-slate-700'
            }`}>

              {/* Legendary glow background */}
              {level >= 5 && (
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-transparent to-yellow-500/10 animate-pulse" />
              )}

              {/* Character Body - positioned in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-20 h-28">

                  {/* Base character (underwear) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Head */}
                    <div className="w-8 h-8 bg-amber-200 rounded-full border-2 border-amber-300 relative">
                      {/* Face */}
                      <div className="absolute top-2 left-1.5 w-1 h-1 bg-slate-700 rounded-full" />
                      <div className="absolute top-2 right-1.5 w-1 h-1 bg-slate-700 rounded-full" />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-slate-600 rounded-full" />
                    </div>

                    {/* Body/Torso */}
                    <div className={`w-10 h-10 rounded-lg mt-0.5 border-2 ${
                      hasArmor
                        ? 'bg-gradient-to-b from-slate-400 to-slate-500 border-slate-300'
                        : 'bg-amber-200 border-amber-300'
                    }`}>
                      {/* Armor detail */}
                      {hasArmor && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-4 h-6 bg-slate-300 rounded-sm border border-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Underwear/Pants area */}
                    <div className={`w-8 h-4 rounded-b-lg -mt-0.5 ${
                      hasBoots ? 'bg-blue-800 border border-blue-700' : 'bg-white border border-slate-300'
                    }`} />

                    {/* Legs */}
                    <div className="flex gap-1 -mt-0.5">
                      <div className={`w-3 h-6 rounded-b-lg ${
                        hasBoots ? 'bg-amber-700 border border-amber-600' : 'bg-amber-200 border border-amber-300'
                      }`} />
                      <div className={`w-3 h-6 rounded-b-lg ${
                        hasBoots ? 'bg-amber-700 border border-amber-600' : 'bg-amber-200 border border-amber-300'
                      }`} />
                    </div>
                  </div>

                  {/* Sword (right side) */}
                  {hasSword && (
                    <div className="absolute -right-2 top-4 animate-in fade-in slide-in-from-right duration-500">
                      <div className="relative">
                        {/* Blade */}
                        <div className="w-1.5 h-12 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-full border border-slate-200" />
                        {/* Guard */}
                        <div className="w-4 h-1.5 bg-yellow-600 rounded-sm -mt-0.5 -ml-1" />
                        {/* Handle */}
                        <div className="w-1.5 h-3 bg-amber-800 rounded-b-sm ml-0" />
                      </div>
                    </div>
                  )}

                  {/* Shield (left side) */}
                  {hasShield && (
                    <div className="absolute -left-3 top-6 animate-in fade-in slide-in-from-left duration-500">
                      <div className="w-6 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-b-full border-2 border-yellow-500 flex items-center justify-center">
                        <div className="w-3 h-4 bg-yellow-500 rounded-b-full" />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Level badge */}
              <div className={`absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded font-black ${
                level >= 5 ? 'bg-yellow-500 text-yellow-900' : 'bg-blue-600 text-blue-100'
              }`}>
                {level}
              </div>

            </div>
          </div>

          {/* Equipment Slots */}
          <div className="flex flex-col justify-between py-1 min-w-[100px]">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Equipment</div>

            <div className="space-y-1.5">
              {/* Boots */}
              <div className={`flex items-center gap-2 px-2 py-1 rounded ${hasBoots ? 'bg-blue-900/30' : 'bg-slate-800/50'}`}>
                <span className="text-sm">{hasBoots ? '👢' : '⬜'}</span>
                <span className={`text-[10px] ${hasBoots ? 'text-blue-400' : 'text-slate-600'}`}>Boots</span>
              </div>

              {/* Armor */}
              <div className={`flex items-center gap-2 px-2 py-1 rounded ${hasArmor ? 'bg-purple-900/30' : 'bg-slate-800/50'}`}>
                <span className="text-sm">{hasArmor ? '🛡️' : '⬜'}</span>
                <span className={`text-[10px] ${hasArmor ? 'text-purple-400' : 'text-slate-600'}`}>Armor</span>
              </div>

              {/* Sword */}
              <div className={`flex items-center gap-2 px-2 py-1 rounded ${hasSword ? 'bg-emerald-900/30' : 'bg-slate-800/50'}`}>
                <span className="text-sm">{hasSword ? '⚔️' : '⬜'}</span>
                <span className={`text-[10px] ${hasSword ? 'text-emerald-400' : 'text-slate-600'}`}>Sword</span>
              </div>

              {/* Shield */}
              <div className={`flex items-center gap-2 px-2 py-1 rounded ${hasShield ? 'bg-yellow-900/30' : 'bg-slate-800/50'}`}>
                <span className="text-sm">{hasShield ? '🏰' : '⬜'}</span>
                <span className={`text-[10px] ${hasShield ? 'text-yellow-400' : 'text-slate-600'}`}>Shield</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${
                    level >= 5
                      ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 animate-pulse'
                      : 'bg-gradient-to-r from-blue-600 to-purple-500'
                  }`}
                  style={{ width: `${(level / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status message */}
        {level < 5 && (
          <div className="px-4 pb-3 text-center">
            <span className="text-[10px] text-slate-500">
              Complete missions to unlock equipment!
            </span>
          </div>
        )}

        {level >= 5 && (
          <div className="px-4 pb-3 text-center">
            <span className="text-[10px] text-yellow-400 font-bold animate-pulse">
              FULLY EQUIPPED - LEGENDARY STATUS!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
