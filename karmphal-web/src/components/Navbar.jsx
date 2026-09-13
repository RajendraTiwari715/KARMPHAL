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
      {/* Desktop & Mobile Clean Header */}
      <header className="sticky top-0 z-40 bg-[#0A1005]/50 backdrop-blur-3xl border-b border-[#E0A96D]/20 shadow-2xl">
        {/* Main Clean Brand Header with 3D App Logo (Profile Trigger) */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* 3D OM Lotus App Logo - Clicking opens User Profile & Settings Modal */}
            <button
              onClick={() => setIsProfileOpen(true)}
              title="ॐ प्रोफाइल, खाता व भाषा विन्यास (Click to open Profile & Settings)"
              className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-2xl shadow-[#C58B4E]/40 hover:scale-108 transition-all border-2 border-[#E0A96D] cursor-pointer group shrink-0"
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
              <h1 className="font-dharmik text-xl sm:text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#F7E7D6] via-[#F3CA9D] to-[#C58B4E] font-bold">
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
                      ? 'bg-gradient-to-r from-[#C58B4E]/40 via-[#C58B4E]/20 to-transparent border border-[#E0A96D] shadow-lg shadow-[#C58B4E]/30 backdrop-blur-md'
                      : 'bg-black/20 hover:bg-black/40 border border-white/5 text-[#D4A373] hover:text-[#F3CA9D] backdrop-blur-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-1.5 transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-[#2A170C]/80 to-[#120A05]/80 border border-[#E0A96D] shadow-md scale-105'
                      : 'bg-black/30 border border-[#C58B4E]/20'
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A1005]/60 backdrop-blur-3xl border-t border-[#E0A96D]/20 px-2 py-1.5 shadow-2xl">
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
                    ? 'bg-gradient-to-br from-[#2A170C]/80 to-[#120A05]/80 border border-[#E0A96D] shadow-lg shadow-[#C58B4E]/40'
                    : 'bg-black/30 border border-[#C58B4E]/20'
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
