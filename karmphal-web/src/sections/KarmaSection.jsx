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
      {/* Section Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#180A12] via-[#2A0E1D] to-[#0E060C] border border-rose-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="badge-gold">{t.karmaHeroBadge}</span>
              <span className="bg-rose-950/80 text-rose-300 border border-rose-500/40 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {t.karmaHeroSubBadge}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-rose-300 to-amber-200">
              {t.karmaHeroTitle}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t.karmaHeroDesc}
            </p>
          </div>

          {/* Sub-tab Switcher inside Karma */}
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
