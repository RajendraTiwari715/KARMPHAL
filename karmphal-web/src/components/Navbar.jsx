import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { languageService } from '../services/languageService';
import ProfileModal from './ProfileModal';
import appLogo from '../assets/app_logo.jpg';
import { GuruIcon, GyanIcon, SadhanaIcon, JyotishIcon, KarmaIcon } from './SectionIcons';

export default function Navbar({ activeSection, setActiveSection, panchangData }) {
  const [appState, setAppState] = useState(storageService.getState());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languageService.getLang());

  useEffect(() => {
    const unsub = languageService.subscribe(lang => setCurrentLang(lang));
    const interval = setInterval(() => {
      setAppState(storageService.getState());
    }, 1000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const t = languageService.t();

  const sections = [
    { id: 'guru', label: 'गुरु', title: 'गुरु', sub: 'AI आचार्य RAG', icon: GuruIcon },
    { id: 'gyan', label: 'ज्ञान', title: 'ज्ञान', sub: 'वेद, गीता व पुराण', icon: GyanIcon },
    { id: 'sadhana', label: 'साधना', title: 'साधना', sub: 'पञ्चाङ्ग, आरती व जप', icon: SadhanaIcon },
    { id: 'jyotish', label: 'ज्योतिष', title: 'ज्योतिष', sub: 'कुण्डली, विवाह व वास्तु', icon: JyotishIcon },
    { id: 'karma', label: 'कर्म', title: 'कर्म', sub: '२८ नरक व स्वप्न', icon: KarmaIcon }
  ];

  return (
    <>
      {/* Desktop & Tablet Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#120A05]/95 backdrop-blur-2xl border-b border-[#C58B4E]/30 shadow-2xl">
        {/* Panchang Live Ticker Ribbon */}
        <div className="bg-gradient-to-r from-[#1C1008] via-[#2A170C] to-[#1C1008] px-4 py-1.5 text-[11px] sm:text-xs border-b border-[#C58B4E]/20 flex flex-wrap items-center justify-between text-[#F3CA9D] gap-2">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="flex items-center gap-1.5 font-bold text-[#E0A96D] whitespace-nowrap">
              <span className="animate-diya text-sm">🪔</span>
              {panchangData?.tithi?.name || 'शुक्ल नवमी'}
            </span>
            <span className="text-[#C58B4E]/50">•</span>
            <span className="whitespace-nowrap">नक्षत्र: <strong className="text-[#F7E7D6]">{panchangData?.nakshatra?.name || 'रोहिणी'}</strong></span>
            <span className="text-[#C58B4E]/50 hidden sm:inline">•</span>
            <span className="whitespace-nowrap hidden sm:inline">योग: <strong className="text-[#F7E7D6]">{panchangData?.yoga?.name || 'शुभ'}</strong></span>
            <span className="text-[#C58B4E]/50 hidden md:inline">•</span>
            <span className="whitespace-nowrap hidden md:inline">वार: <strong className="text-[#F7E7D6]">{panchangData?.vara?.name || 'सोमवार'}</strong></span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="bg-[#2A180E] text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              अभिजित: {panchangData?.muhurtas?.abhijit ? panchangData.muhurtas.abhijit.split('(')[0] : '११:५८ - १२:४८'}
            </span>
            <span className="text-rose-300 bg-[#2A180E] border border-rose-500/30 px-2.5 py-0.5 rounded-full font-semibold hidden sm:inline whitespace-nowrap">
              राहु काल: {panchangData?.muhurtas?.rahuKalam ? panchangData.muhurtas.rahuKalam.split('(')[0] : '०७:३० - ०९:००'}
            </span>
          </div>
        </div>

        {/* Main Clean Brand Header with 3D App Logo (Profile Trigger) */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* 3D OM Lotus App Logo - Clicking opens User Profile & Settings Modal */}
            <button
              onClick={() => setIsProfileOpen(true)}
              title="ॐ प्रोफाइल, खाता व भाषा विन्यास (Click to open Profile & Settings)"
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-2xl shadow-[#C58B4E]/40 hover:scale-108 transition-all border-2 border-[#E0A96D] cursor-pointer group shrink-0"
            >
              <img 
                src={appLogo} 
                alt="Karmphal Divine OM Logo" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E0A96D] border-2 border-[#120A05] animate-ping"></span>
            </button>

            <div 
              onClick={() => setActiveSection('guru')}
              className="cursor-pointer"
            >
              <h1 className="font-dharmik text-2xl sm:text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#F7E7D6] via-[#F3CA9D] to-[#C58B4E] font-bold">
                {t.brandTitle}
              </h1>
              <p className="text-[10px] sm:text-xs text-[#D4A373] font-sans tracking-wide">
                {t.brandSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop 5 Sections Tabs Bar with Sacred Section Logos */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar pb-2.5 pt-1 border-t border-[#C58B4E]/15">
          <div className="flex items-center justify-between gap-2.5">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-1 flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C58B4E]/30 via-[#C58B4E]/15 to-transparent border border-[#E0A96D] shadow-lg shadow-[#C58B4E]/20'
                      : 'bg-[#1C1008]/60 hover:bg-[#2A180E] border border-white/5 text-[#D4A373] hover:text-[#F3CA9D]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-1.5 transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-[#2A170C] to-[#120A05] border border-[#E0A96D] shadow-md scale-105'
                      : 'bg-[#2A180E] border border-[#C58B4E]/20'
                  }`}>
                    <Icon className="w-full h-full" active={isActive} />
                  </div>
                  <div className="text-left">
                    <div className={`text-xs font-bold ${isActive ? 'text-[#F3CA9D]' : 'text-[#E6D0BA]'}`}>
                      {section.label}
                    </div>
                    <div className="text-[10px] text-[#A67C52] truncate max-w-[130px]">
                      {section.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Clean Navigation Bar with Sacred Section Logos */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#140B06]/98 backdrop-blur-2xl border-t border-[#C58B4E]/40 px-2 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#F3CA9D] scale-105'
                    : 'text-[#A67C52] hover:text-[#E6D0BA]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center p-1.5 transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-[#2A170C] to-[#120A05] border border-[#E0A96D] shadow-lg shadow-[#C58B4E]/40'
                    : 'bg-[#21120A] border border-[#C58B4E]/20'
                }`}>
                  <Icon className="w-full h-full" active={isActive} />
                </div>
                <span className={`text-[10px] mt-1 font-serif font-bold ${isActive ? 'text-[#F3CA9D]' : 'text-[#A67C52]'}`}>
                  {section.title}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ॐ Profile & Language Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        appState={appState}
      />
    </>
  );
}
