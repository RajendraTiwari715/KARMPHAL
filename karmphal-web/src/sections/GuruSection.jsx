import React from 'react';
import SanatanAIAcharya from '../components/TheologicalChatbot/SanatanAIAcharya';
import { languageService } from '../services/languageService';
import guruAvatar from '../assets/guru_avatar.jpg';
import templeHero from '../assets/temple_hero.jpg';

export default function GuruSection({ panchangData }) {
  const t = languageService.t();

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Premium Dharmik Hero Card with Temple Background */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#C58B4E]/40 p-4 sm:p-6 md:p-8 shadow-2xl bg-slate-950">
        {/* Background Image with Saffron/Amber Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 pointer-events-none"
          style={{ backgroundImage: `url(${templeHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0F1A] via-[#1A1208]/90 to-[#0B0C16]/95 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-5">
            {/* Enlightened Guru Avatar Image */}
            <div className="relative shrink-0">
              <img
                src={guruAvatar}
                alt="Sanatan AI Acharya"
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-[#E0A96D] shadow-2xl shadow-[#C58B4E]/30"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="badge-gold font-bold text-[10px] sm:text-xs">{t.guruHeroBadge}</span>
                <span className="badge-saffron font-bold text-[10px] sm:text-xs">{t.guruHeroSubBadge}</span>
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-dharmik font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2D4] via-[#F3CA9D] to-[#C58B4E]">
                {t.guruHeroTitle}
              </h1>
              <p className="text-[11px] sm:text-xs text-[#D4A373] max-w-xl leading-relaxed hidden sm:block">
                {t.guruHeroDesc}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-black/40 backdrop-blur-sm/90 p-3.5 rounded-2xl border border-[#C58B4E]/40 shadow-xl">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E0A96D] via-[#C58B4E] to-[#6A3B18] flex items-center justify-center text-[#120A05] font-sanskrit text-2xl font-bold shadow-md">
              ॐ
            </div>
            <div>
              <div className="text-xs font-bold text-[#F3CA9D]">{t.nyayaGuardrails}</div>
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
