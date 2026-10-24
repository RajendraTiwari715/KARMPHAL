import React, { useState, useEffect, useCallback, memo } from 'react';
import { Volume2, VolumeX, User, Settings } from 'lucide-react';
import { languageService } from '../services/languageService';
import { audioService } from '../services/audioService';
import ProfileModal from './ProfileModal';
import appLogo from '../assets/app_logo.webp';
import { GuruIcon, GyanIcon, SadhanaIcon, JyotishIcon, KarmaIcon } from './SectionIcons';

function Navbar({ activeSection, setActiveSection, panchangData: _panchangData }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');

  const handleOpenProfile = useCallback(() => {
    setProfileModalTab('profile');
    setIsProfileOpen(true);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setProfileModalTab('settings');
    setIsProfileOpen(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  const [, setLang] = useState(languageService.getLang());
  const [isMuted, setIsMuted] = useState(audioService.isSoundMuted());

  useEffect(() => {
    const unsub = languageService.subscribe(lang => setLang(lang));
    const handleMuteChange = (e) => {
      setIsMuted(e.detail?.isMuted ?? audioService.isSoundMuted());
    };
    window.addEventListener('karmphal_audio_mute_changed', handleMuteChange);
    return () => {
      unsub();
      window.removeEventListener('karmphal_audio_mute_changed', handleMuteChange);
    };
  }, []);

  const handleToggleSound = () => {
    const nextMuted = audioService.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      audioService.playTempleBell(660, 0.5);
    }
  };

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
      <header className="sticky top-0 z-40 bg-[#0A1005]/80 backdrop-blur-3xl border-b border-[#E0A96D]/20 shadow-2xl pt-safe">
        {/* Main Clean Brand Header */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5">
            {/* 3D OM Lotus App Logo - Plain Home Link (min 44x44px tap target, no ping dot) */}
            <button
              type="button"
              onClick={() => setActiveSection('guru')}
              aria-label="कर्मफल मुख्य पृष्ठ पर जाएं (Go to Home)"
              title="कर्मफल मुख्य पृष्ठ (Home)"
              className="relative min-w-[44px] min-h-[44px] w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-2xl shadow-[#C58B4E]/30 hover:scale-105 active:scale-95 transition-all border-2 border-[#E0A96D]/80 cursor-pointer group shrink-0 flex items-center justify-center"
            >
              <img 
                src={appLogo} 
                alt="Karmphal Divine OM Logo" 
                width="56"
                height="56"
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </button>

            <div 
              onClick={() => setActiveSection('guru')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveSection('guru'); }}
              aria-label="कर्मफल मुख्य पृष्ठ पर जाएं"
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

          {/* Right Action Icons: Sound Mute Toggle, Settings Entry, & Profile Avatar Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sound Mute Toggle (min 44x44px tap target) */}
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={isMuted ? "ध्वनि चालू करें (Unmute Bell & Chimes)" : "ध्वनि म्यूट करें (Mute Sound)"}
              title={isMuted ? "ध्वनि चालू करें (Unmute Bell & Chimes)" : "ध्वनि म्यूट करें (Mute Sound)"}
              className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isMuted 
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:border-rose-400' 
                  : 'bg-black/30 border-[#C58B4E]/40 text-[#E0A96D] hover:border-[#E0A96D] shadow-sm'
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-300" />
              )}
              <span className="text-[11px] font-bold font-dharmik hidden lg:inline">
                {isMuted ? 'म्यूट' : 'नाद सक्रिय'}
              </span>
            </button>

            {/* Settings Entry Button (min 44x44px tap target) */}
            <button
              type="button"
              onClick={handleOpenSettings}
              aria-label="एप्लिकेशन विन्यास एवं सेटिंग्स (Settings: भाषा, ध्वनि, स्थान, गोपनीयता)"
              title="विन्यास एवं सेटिंग्स (Settings)"
              className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl border border-[#C58B4E]/40 bg-black/40 text-[#F3CA9D] hover:text-white hover:border-[#E0A96D] hover:bg-[#C58B4E]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm group"
            >
              <Settings className="w-4 h-4 text-[#E0A96D] group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-xs font-bold font-dharmik hidden sm:inline">विन्यास</span>
            </button>

            {/* Profile Avatar Button (min 44x44px tap target, gold aesthetic) */}
            <button
              type="button"
              onClick={handleOpenProfile}
              aria-label="साधक प्रोफाइल (Seeker Profile & Sadhana Stats)"
              title="साधक प्रोफाइल (Profile)"
              className="min-w-[44px] min-h-[44px] pl-2.5 pr-3 py-1.5 rounded-2xl border border-[#E0A96D] bg-gradient-to-r from-[#2A170C]/90 to-[#120A05]/90 text-[#F3CA9D] hover:scale-105 active:scale-95 hover:border-[#FFF2D4] hover:shadow-lg hover:shadow-[#C58B4E]/30 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#C58B4E] via-[#F3CA9D] to-[#FFF2D4] p-0.5 shadow-sm shrink-0">
                <div className="w-full h-full rounded-full bg-[#1A0E08] flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#F3CA9D] group-hover:text-white transition-colors" />
                </div>
              </div>
              <span className="text-xs font-bold font-dharmik text-[#F7E7D6] hidden xs:inline sm:inline">प्रोफाइल</span>
            </button>
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
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  aria-label={`${section.label} खण्ड पर जाएं (${section.sub})`}
                  className={`flex-1 min-h-[44px] flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer ${
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

      {/* Mobile Bottom Clean Navigation Bar with Sacred Section Logos & 1-Tap Profile Access */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A1005]/85 backdrop-blur-3xl border-t border-[#E0A96D]/25 px-1 py-1.5 shadow-2xl pb-safe">
        <div className="flex items-center justify-around">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                aria-label={`${section.title} खण्ड`}
                className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] p-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#F3CA9D] scale-105'
                    : 'text-[#A67C52] hover:text-[#E6D0BA]'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center p-1 transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-[#2A170C]/80 to-[#120A05]/80 border border-[#E0A96D] shadow-lg shadow-[#C58B4E]/40'
                    : 'bg-black/30 border border-[#C58B4E]/20'
                }`}>
                  <Icon className="w-full h-full" active={isActive} />
                </div>
                <span className={`text-[9px] mt-0.5 font-serif font-bold ${isActive ? 'text-[#F3CA9D]' : 'text-[#A67C52]'}`}>
                  {section.title}
                </span>
              </button>
            );
          })}

          {/* 1-Tap Mobile Profile Button */}
          <button
            type="button"
            onClick={handleOpenProfile}
            aria-label="साधक प्रोफाइल एवं सेटिंग्स (Profile & Settings)"
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] p-1 rounded-xl transition-all text-[#A67C52] hover:text-[#E6D0BA]"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center p-1 transition-all bg-gradient-to-br from-[#2A170C]/70 to-[#120A05]/70 border border-[#E0A96D]/60 shadow-sm hover:border-[#E0A96D]">
              <User className="w-4 h-4 text-[#F3CA9D]" />
            </div>
            <span className="text-[9px] mt-0.5 font-serif font-bold text-[#E6D0BA]">
              प्रोफाइल
            </span>
          </button>
        </div>
      </nav>

      {/* ॐ Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={handleCloseProfile}
        initialTab={profileModalTab}
      />
    </>
  );
}

export default memo(Navbar);

