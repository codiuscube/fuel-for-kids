import React from 'react';
import { AlertTriangle, Dumbbell } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * DashboardSlide - Introduction slide
 * Core Philosophy: Stress = Growth
 */
export const DashboardSlide = () => (
  <div className="h-full flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in duration-700">
    <div className="space-y-4">
      <Badge color="blue">Core Philosophy</Badge>
      <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 leading-tight">
        STRESS = GROWTH
      </h1>
      <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto italic">
        "Comfortable inaction leads to decay. <br/> Active stress leads to growth."
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-8">
      <Card className="p-6 flex items-center gap-4 bg-slate-800/50 border-slate-700 group hover:border-red-500/50 transition-colors">
        <div className="bg-red-900/20 p-4 rounded-full group-hover:bg-red-900/40 transition-colors">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-left">
          <h3 className="font-bold text-white">Default Mode</h3>
          <p className="text-sm text-slate-400">Eating to "Get Full"</p>
          <p className="text-xs text-red-400 mt-1">Result: Weak Foundation</p>
        </div>
      </Card>

      <Card className="p-6 flex items-center gap-4 bg-blue-900/20 border-blue-500/50 group hover:bg-blue-900/30 transition-colors">
        <div className="bg-blue-900/30 p-4 rounded-full group-hover:scale-110 transition-transform">
          <Dumbbell className="w-8 h-8 text-blue-400" />
        </div>
        <div className="text-left">
          <h3 className="font-bold text-white">Upgrade Mode</h3>
          <p className="text-sm text-slate-400">Eating to "Build"</p>
          <p className="text-xs text-blue-400 mt-1">Result: Hormesis (Strength)</p>
        </div>
      </Card>
    </div>
  </div>
);

export const dashboardScript = "Listen up team. We need a mindset shift. We don't eat just to get full. We eat to Build the Machine. The core concept is Positive Stress. Just like lifting weights stresses muscles to make them grow, eating the right nutrients stresses our cells to make them resilient. Comfortable inaction leads to decay.";

import dashboardAudioFile from '../../sounds/Listen up team.mp3';
export const dashboardAudio = dashboardAudioFile;
