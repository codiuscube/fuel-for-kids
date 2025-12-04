import React from 'react';
import { Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * CreatineSlide - Brain Battery explanation
 * Mission 2: Understanding creatine supplementation for vegetarians
 */
export const CreatineSlide = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <Badge color="purple">Mission 2</Badge>
        <h2 className="text-3xl font-bold text-white mt-2">The Brain Battery</h2>
        <p className="text-slate-400 text-sm">
          Target: <strong className="text-white">Top off the Phosphocreatine tank.</strong>
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full pb-8">

        {/* Battery Visualization */}
        <div className="relative">
          <div className="flex justify-center gap-8">
            {/* Vegetarian Default Battery */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-48 border-4 border-slate-600 rounded-2xl p-2 bg-slate-900 relative">
                <div className="w-full bg-yellow-600 h-[80%] absolute bottom-2 left-2 right-2 rounded-sm opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-1/2 left-0 right-0 text-center font-black text-yellow-900 text-xl">
                  80%
                </div>
              </div>
              <p className="mt-2 text-slate-400 font-bold text-sm">Vegetarian Default</p>
            </div>

            {/* Supplemented Battery */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-48 border-4 border-purple-500 rounded-2xl p-2 bg-slate-900 relative shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <div className="w-full bg-purple-500 h-[100%] absolute bottom-2 left-2 right-2 rounded-sm flex items-center justify-center">
                  <Zap className="text-white fill-white animate-pulse" />
                </div>
              </div>
              <p className="mt-2 text-purple-400 font-bold text-sm">With Supplement</p>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card className="p-5 bg-slate-800/80 border-l-4 border-purple-500">
            <h3 className="font-bold text-purple-300 mb-1">Why do we need it?</h3>
            <p className="text-sm text-slate-300">
              Meat-eaters get Creatine from steak. We don't.
              <br/>This means our "Brain Battery" sits at 80%.
              <br/>We supplement to reach 100% for <strong>Math & Memory.</strong>
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
              <div className="text-2xl font-black text-white mb-1">ATP</div>
              <div className="text-xs text-slate-500 uppercase">Energy Coins</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
              <div className="text-2xl font-black text-white mb-1">5 Grams</div>
              <div className="text-xs text-slate-500 uppercase">Daily Fix</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const creatineScript = "Since we don't eat steak, research shows we miss baseline creatine. This isn't just for muscles. It's for your brain battery. Studies show it is critical for memory and focus. We are adding a small dose to smoothies to top off your tank to 100 percent.";

import creatineAudioFile from '../../sounds/Since we don\'t eat Steak.mp3';
export const creatineAudio = creatineAudioFile;
