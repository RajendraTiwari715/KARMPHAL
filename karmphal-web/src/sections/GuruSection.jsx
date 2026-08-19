import React from 'react';
import SanatanAIAcharya from '../components/TheologicalChatbot/SanatanAIAcharya';
import { languageService } from '../services/languageService';
import guruAvatar from '../assets/guru_avatar.jpg';
import templeHero from '../assets/temple_hero.jpg';

export default function GuruSection({ panchangData }) {
  const t = languageService.t();

  return (
    <div className="space-y-6">
      {/* Premium Dharmik Hero Card with Temple Background */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 p-6 md:p-8 shadow-2xl bg-slate-950">
        {/* Background Image with Saffron/Amber Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 pointer-events-none"
          style={{ backgroundImage: `url(${templeHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0F1A] via-[#1A1208]/90 to-[#0B0C16]/95 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Enlightened Guru Avatar Image */}
            <div className="relative shrink-0">
              <img
                src={guruAvatar}
                alt="Sanatan AI Acharya"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-amber-400/80 shadow-2xl shadow-amber-500/30"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-gold font-bold">{t.guruHeroBadge}</span>
                <span className="badge-saffron font-bold">{t.guruHeroSubBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-dharmik font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-400">
                {t.guruHeroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {t.guruHeroDesc}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-amber-500/30 shadow-xl">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 font-sanskrit text-2xl font-bold shadow-md">
              ॐ
            </div>
            <div>
              <div className="text-xs font-bold text-amber-200">{t.nyayaGuardrails}</div>
              <div className="text-[11px] text-emerald-400 font-mono font-semibold">{t.zeroHallucinations}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main AI Acharya Chatbot Component */}
      <SanatanAIAcharya panchangData={panchangData} />
    </div>
  );
}
