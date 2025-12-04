import React, { useState } from 'react';
import { Skull } from 'lucide-react';
import { Badge } from '../ui/Badge';

/**
 * SugarSlide - Energy management visualization
 * Mission 3: Understanding insulin and blood sugar
 */
export const SugarSlide = () => {
  const [mode, setMode] = useState('crash');

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <Badge color="red">Mission 3</Badge>
        <h2 className="text-3xl font-bold text-white mt-2">Energy Management</h2>
        <p className="text-slate-400 text-sm">
          Objective: <strong className="text-white">Avoid the "Bonk".</strong>
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-full space-y-6">

        {/* Mode Toggle */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setMode('crash')}
            className={`px-4 py-3 rounded-lg font-bold transition-all border ${
              mode === 'crash'
                ? 'bg-red-900/50 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            Sugar Spike
          </button>
          <button
            onClick={() => setMode('stable')}
            className={`px-4 py-3 rounded-lg font-bold transition-all border ${
              mode === 'stable'
                ? 'bg-emerald-900/50 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            Steady Fuel
          </button>
        </div>

        {/* Graph Visualization */}
        <div className="relative flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-6 shadow-inner">
          {/* Baseline */}
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-slate-600" />
          <span className="absolute left-2 top-1/2 -mt-6 text-xs text-slate-500">Baseline Energy</span>

          {/* Graph */}
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            {mode === 'crash' ? (
              <path
                d="M0,100 C50,100 80,10 120,10 S150,180 400,180"
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                className="animate-[dash_2s_linear_infinite]"
              />
            ) : (
              <path
                d="M0,100 C50,100 100,80 400,90"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
              />
            )}
          </svg>

          {/* Labels */}
          {mode === 'crash' && (
            <>
              <div className="absolute top-10 left-1/4 bg-red-900/80 text-red-200 text-xs px-2 py-1 rounded border border-red-500 animate-pulse">
                INSULIN JAM
              </div>
              <div className="absolute bottom-10 right-1/4 bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-600">
                <Skull className="w-3 h-3 inline mr-1"/> THE BONK
              </div>
            </>
          )}

          {mode === 'stable' && (
            <div className="absolute top-1/3 left-1/3 bg-emerald-900/80 text-emerald-200 text-xs px-2 py-1 rounded border border-emerald-500">
              STEADY ENERGY
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="p-4 bg-slate-800 rounded-lg text-sm text-slate-300 border border-slate-700">
          <p>
            <strong>The "Insulin Key" Analogy:</strong> Insulin is a key that opens your cells to let energy in.
            Sugar jams the lock. When the lock is jammed, you crash.
          </p>
        </div>
      </div>
    </div>
  );
};

export const sugarScript = "I want to teach you the underworkings of your body. Insulin is a key. Sugar jams the lock. When the lock is jammed, you get an energy crash called The Bonk. We control the quality of fuel to prevent this. Fiber acts as the bouncer.";

import sugarAudioFile from '../../sounds/I want to teach you.mp3';
export const sugarAudio = sugarAudioFile;
