import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Lock } from 'lucide-react';

// Components
import { CharacterHUD } from './components/CharacterHUD';
import { HelperBot } from './components/HelperBot';
import { useSoundEffects } from './hooks/useSoundEffects';
import { UserProvider, useUserContext } from './context/UserContext';

// Slides
import {
  DashboardSlide,
  ProteinSlide,
  CreatineSlide,
  SugarSlide,
  StrategySlide,
} from './components/slides';

// Slide keys for completion tracking and dynamic script generation
const SLIDE_KEYS = ['dashboard', 'protein', 'creatine', 'sugar', 'strategy'];

/**
 * AppContent - Main app content that needs UserContext access
 */
const AppContent = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showHelper, setShowHelper] = useState(true);
  const [showHUD, setShowHUD] = useState(true);
  const [missionReady, setMissionReady] = useState(false);

  const { playTransition } = useSoundEffects();
  const { userState } = useUserContext();

  // Slide configuration
  const slides = [
    { component: <DashboardSlide />, key: 'dashboard' },
    { component: <ProteinSlide />, key: 'protein' },
    { component: <CreatineSlide />, key: 'creatine' },
    { component: <SugarSlide />, key: 'sugar' },
    { component: <StrategySlide onLoadoutUpdate={setMissionReady} />, key: 'strategy' },
  ];

  // Check if current slide is complete
  const currentSlideKey = SLIDE_KEYS[currentSlide];
  const isCurrentSlideComplete = userState.slideCompletion[currentSlideKey];
  const isLastSlide = currentSlide === slides.length - 1;

  const goToPrevSlide = () => {
    playTransition();
    setCurrentSlide(c => Math.max(0, c - 1));
  };

  const goToNextSlide = () => {
    if (!isCurrentSlideComplete) return;
    playTransition();
    setCurrentSlide(c => Math.min(slides.length - 1, c + 1));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8 flex items-center justify-center">
      {/* Main Frame */}
      <div className="w-full max-w-5xl h-[calc(100vh-4rem)] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative">

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
                disabled={isLastSlide || !isCurrentSlideComplete}
                className={`p-2 rounded transition-colors flex items-center gap-1 ${
                  isLastSlide || !isCurrentSlideComplete
                    ? 'bg-slate-700 opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
                aria-label="Next slide"
                title={!isCurrentSlideComplete && !isLastSlide ? 'Complete the current mission to continue' : ''}
              >
                {!isCurrentSlideComplete && !isLastSlide && <Lock className="w-3 h-3" />}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </header>

        {/* Main Stage */}
        <main className="flex-1 relative p-6 md:p-8 overflow-hidden">
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
        slideKey={slides[currentSlide].key}
        isVisible={showHelper}
        onToggle={() => setShowHelper(!showHelper)}
        currentSlide={currentSlide}
      />
    </div>
  );
};

/**
 * NutritionRPG - Main application component wrapper
 * A gamified nutrition education app for kids
 */
const NutritionRPG = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default NutritionRPG;
