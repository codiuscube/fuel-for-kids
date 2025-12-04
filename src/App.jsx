import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// Components
import { CharacterHUD } from './components/CharacterHUD';
import { HelperBot } from './components/HelperBot';
import { useSoundEffects } from './hooks/useSoundEffects';

// Slides
import {
  DashboardSlide, dashboardScript, dashboardAudio,
  ProteinSlide, proteinScript, proteinAudio,
  CreatineSlide, creatineScript, creatineAudio,
  SugarSlide, sugarScript, sugarAudio,
  StrategySlide, strategyScript, strategyAudio,
} from './components/slides';

/**
 * NutritionRPG - Main application component
 * A gamified nutrition education app for kids
 */
const NutritionRPG = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showHelper, setShowHelper] = useState(true);
  const [showHUD, setShowHUD] = useState(true);
  const [missionReady, setMissionReady] = useState(false);

  const { playTransition } = useSoundEffects();

  // Slide configuration
  const slides = [
    { component: <DashboardSlide />, script: dashboardScript, audio: dashboardAudio },
    { component: <ProteinSlide />, script: proteinScript, audio: proteinAudio },
    { component: <CreatineSlide />, script: creatineScript, audio: creatineAudio },
    { component: <SugarSlide />, script: sugarScript, audio: sugarAudio },
    { component: <StrategySlide onLoadoutUpdate={setMissionReady} />, script: strategyScript, audio: strategyAudio },
  ];

  const goToPrevSlide = () => {
    playTransition();
    setCurrentSlide(c => Math.max(0, c - 1));
  };

  const goToNextSlide = () => {
    playTransition();
    setCurrentSlide(c => Math.min(slides.length - 1, c + 1));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8 flex items-center justify-center">
      {/* Main Frame */}
      <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative">

        {/* Top Bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
          {/* Window Controls */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 text-sm font-mono text-slate-500 uppercase tracking-widest hidden md:inline">
              Bio-Protocol // Stage {currentSlide + 1}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={goToPrevSlide}
                disabled={currentSlide === 0}
                className="p-2 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextSlide}
                disabled={currentSlide === slides.length - 1}
                className="p-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </header>

        {/* Main Stage */}
        <main className="flex-1 relative p-6 md:p-8 overflow-y-auto pb-32">
          {slides[currentSlide].component}
        </main>

      </div>

      {/* Character HUD (Bottom Left - Outside frame) */}
      <CharacterHUD
        currentSlide={currentSlide}
        allEquipped={missionReady}
        isVisible={showHUD}
        onToggle={() => setShowHUD(!showHUD)}
      />

      {/* Helper Bot (Bottom Right - Outside frame) */}
      <HelperBot
        script={slides[currentSlide].script}
        audioFile={slides[currentSlide].audio}
        isVisible={showHelper}
        onToggle={() => setShowHelper(!showHelper)}
        currentSlide={currentSlide}
      />
    </div>
  );
};

export default NutritionRPG;
