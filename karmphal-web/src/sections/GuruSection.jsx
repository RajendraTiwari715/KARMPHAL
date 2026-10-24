import React from 'react';
import SanatanAIAcharya from '../components/TheologicalChatbot/SanatanAIAcharya';
import templeHero from '../assets/temple_hero.webp';

export default function GuruSection({ panchangData }) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Above-the-fold Hero Banner with templeHero */}
      <div className="relative overflow-hidden rounded-3xl border border-[#C58B4E]/30 shadow-2xl bg-gradient-to-r from-[#2A140A] via-[#1F0E07] to-[#140803] flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 gap-4">
        <div className="space-y-1.5 flex-1 z-10">
          <div className="flex items-center gap-2">
            <span className="badge-gold text-[10px]">सनातन धर्म RAG</span>
            <span className="text-xs text-[#E0A96D] font-mono">॥ यतो धर्मस्ततो जयः ॥</span>
          </div>
          <h2 className="font-dharmik text-lg sm:text-2xl font-bold text-[#F3CA9D]">
            सनातन शास्त्र एवं वैदिक आचार्य पीठ
          </h2>
          <p className="text-xs text-[#D4A373] leading-relaxed max-w-xl">
            चार वेद, १८ पुराण, उपनिषद्, भगवद्गीता एवं धर्मशास्त्रों के प्रामाणिक संदर्भों के साथ आध्यात्मिक मार्गदर्शन
          </p>
        </div>
        <div className="relative w-full sm:w-48 h-28 sm:h-32 rounded-2xl overflow-hidden border border-[#C58B4E]/40 shrink-0 shadow-lg">
          <img
            src={templeHero}
            alt="वैदिक मन्दिर एवं आध्यात्मिक पीठ"
            width="1080"
            height="720"
            fetchpriority="high"
            className="w-full h-full object-cover brightness-90 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Main AI Acharya Chatbot Component */}
      <SanatanAIAcharya panchangData={panchangData} />
    </div>
  );
}
