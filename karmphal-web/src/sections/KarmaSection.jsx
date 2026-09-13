import React, { useState } from 'react';
import Narakas28Explorer from '../components/KarmicEschatology/Narakas28Explorer';
import DreamAnalyzer from '../components/SwapnaShastra/DreamAnalyzer';
import { ShieldCheck, Moon } from 'lucide-react';
import { audioService } from '../services/audioService';
import { languageService } from '../services/languageService';

export default function KarmaSection() {
  const [subTab, setSubTab] = useState('narakas'); // 'narakas' or 'swapna'
  const t = languageService.t();

  return (
    <div className="space-y-6">
      {/* Sub-tab Switcher for Karma */}
      <div className="flex justify-center mb-2">
        <div className="flex items-center bg-slate-950/90 p-1.5 rounded-2xl border border-rose-500/30">
          <button
            onClick={() => {
              audioService.playBeadClick();
              setSubTab('narakas');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'narakas'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.narakasTab}</span>
          </button>

          <button
            onClick={() => {
              audioService.playBeadClick();
              setSubTab('swapna');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'swapna'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>{t.swapnaTab}</span>
          </button>
        </div>
      </div>

      {/* Render Active Sub-Module */}
      {subTab === 'narakas' ? (
        <Narakas28Explorer />
      ) : (
        <DreamAnalyzer />
      )}
    </div>
  );
}
