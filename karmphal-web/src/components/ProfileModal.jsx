import React, { useState, useEffect, memo } from 'react';
import { 
  User, 
  Globe, 
  Sparkles, 
  Flame, 
  Check, 
  X, 
  Edit3, 
  Save, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Bell, 
  Settings, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  Info,
  Download,
  Upload
} from 'lucide-react';
import { languageService } from '../services/languageService';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';
import { useProfile } from '../context/useProfile';
import { apiClient } from '../services/apiClient';
import LocationPickerModal from './LocationPickerModal';
import { backButtonService, BACK_PRIORITY } from '../services/backButtonService';
import { useFocusTrap } from '../hooks/useFocusTrap';

function ProfileModal({ isOpen, onClose, initialTab = 'profile' }) {
  const { punyaLedger, currentStreak, location, updateCity } = useProfile();
  const [currentLang, setCurrentLang] = useState(() => languageService.getLang());
  const modalRef = useFocusTrap(isOpen, onClose);

  useEffect(() => {
    return languageService.subscribe((l) => setCurrentLang(l));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonService.register(() => {
      onClose();
      return true;
    }, BACK_PRIORITY.MODAL);
    return unregister;
  }, [isOpen, onClose]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(() => ({
    name: 'साधक',
    phoneOrEmail: 'sadhaka@example.com',
    gotra: 'कश्यप (Kashyapa)',
    city: location?.cityName || 'वाराणसी (Varanasi)',
    isLoggedIn: true
  }));
  const [isMuted, setIsMuted] = useState(() => audioService.isSoundMuted());

  useEffect(() => {
    const handleMuteChange = (e) => {
      if (e?.detail?.isMuted !== undefined) {
        setIsMuted(e.detail.isMuted);
      }
    };
    window.addEventListener('karmphal_audio_mute_changed', handleMuteChange);
    return () => window.removeEventListener('karmphal_audio_mute_changed', handleMuteChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/api/user/profile')
        .then(data => {
          if (data && data.name) {
            setUserData(prev => ({
              ...prev,
              name: data.name,
              gotra: data.gotra || prev.gotra,
              city: data.city || location?.cityName || prev.city
            }));
          }
        })
        .catch(err => console.warn('Failed to load profile', err.message));
    }
  }, [isOpen, initialTab, location]);

  const handleToggleSound = () => {
    const nextMuted = audioService.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      audioService.playTempleBell(528, 0.8);
    }
  };

  const handleExportData = () => {
    storageService.exportAllData();
    window.dispatchEvent(new CustomEvent('karmphal:toast', {
      detail: {
        type: 'success',
        title: 'डेटा बैकअप सम्पन्न',
        message: 'समस्त साधना, जप एवं कुण्डली बैकअप (JSON) सुरक्षित डाउनलोड हो गया।'
      }
    }));
  };

  const handleImportFile = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const res = storageService.importAllData(content);
      if (res.success) {
        window.dispatchEvent(new CustomEvent('karmphal:toast', {
          detail: {
            type: 'success',
            title: 'डेटा आयात सम्पन्न',
            message: res.message
          }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('karmphal:toast', {
          detail: {
            type: 'error',
            title: 'आयात विफल',
            message: res.error
          }
        }));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    if (userData.city) {
      updateCity(userData.city);
    }
    apiClient.post('/api/user/profile', {
      name: userData.name,
      gotra: userData.gotra,
      city: userData.city
    }).catch(err => console.warn('Failed to save profile', err.message));
    setIsEditing(false);
  };

  const handleLanguageSelect = (langCode) => {
    languageService.setLang(langCode);
  };

  const languages = [
    { code: 'hi', label: 'हिन्दी (Hindi - पूर्वनिर्धारित)', desc: 'शुद्ध एवं प्रामाणिक वैदिक हिन्दी' },
    { code: 'sa', label: 'संस्कृतम् (Sanskrit)', desc: 'देववाणी मूल संस्कृतम्' },
    { code: 'en', label: 'English', desc: 'International English' }
  ];

  // Calculate spiritual milestone rank from Punya points
  const points = punyaLedger || 108;
  let rank = 'भक्त (Bhakta)';
  if (points >= 1000) rank = 'परमहंस (Paramahamsa)';
  else if (points >= 500) rank = 'ऋषि (Rishi)';
  else if (points >= 300) rank = 'तपस्वी (Tapasvi)';
  else if (points >= 150) rank = 'साधक (Sadhaka)';

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div ref={modalRef} tabIndex={-1} className="glass-card max-w-lg w-full p-5 sm:p-7 relative rounded-3xl border border-[#C58B4E]/40 shadow-2xl bg-[#140B06]/95 text-[#F7E7D6] max-h-[90vh] overflow-y-auto outline-none">
          {/* Close Button (min 44x44px tap target) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="पटल बंद करें (Close Modal)"
            className="absolute top-4 right-4 min-w-[44px] min-h-[44px] p-2 text-[#D4A373] hover:text-[#FFF] rounded-full bg-black/60 backdrop-blur-sm border border-[#C58B4E]/40 hover:border-[#E0A96D] transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header with ॐ Emblem */}
          <div className="flex items-center gap-3.5 mb-4 pb-3.5 border-b border-[#C58B4E]/25">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#E0A96D] via-[#C58B4E] to-[#6A3B18] flex items-center justify-center text-[#120A05] font-black text-2xl shadow-xl shadow-[#C58B4E]/30 border border-[#F3CA9D] shrink-0">
              ॐ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="profile-modal-title" className="font-dharmik text-lg sm:text-xl font-bold text-[#F3CA9D]">
                  ॐ साधना एवं विन्यास
                </h2>
                <span className="badge-gold text-[10px]">प्रमाणित साधक</span>
              </div>
              <p className="text-xs text-[#C58B4E] mt-0.5">साधक परिचय, भाषा चयन, ध्वनि एवं आध्यात्मिक विन्यास</p>
            </div>
          </div>

          {/* Tab Navigation: Profile vs Settings (Accessible Tabs with min 44px tap target) */}
          <div className="flex items-center gap-2 p-1 bg-black/50 rounded-2xl border border-[#C58B4E]/30 mb-5" role="tablist" aria-label="प्रोफाइल एवं विन्यास टैब्स">
            <button
              type="button"
              role="tab"
              id="tab-profile"
              aria-selected={activeTab === 'profile'}
              aria-controls="tabpanel-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold font-dharmik flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#C58B4E] to-[#E0A96D] text-[#120A05] shadow-md shadow-[#C58B4E]/30 font-black'
                  : 'text-[#D4A373] hover:text-[#FFF] hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>साधक प्रोफाइल</span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-settings"
              aria-selected={activeTab === 'settings'}
              aria-controls="tabpanel-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold font-dharmik flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-[#C58B4E] to-[#E0A96D] text-[#120A05] shadow-md shadow-[#C58B4E]/30 font-black'
                  : 'text-[#D4A373] hover:text-[#FFF] hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>विन्यास एवं सेटिंग्स</span>
            </button>
          </div>

          {/* TAB 1: साधक प्रोफाइल (PROFILE TABPANEL) */}
          {activeTab === 'profile' && (
            <div id="tabpanel-profile" role="tabpanel" aria-labelledby="tab-profile" className="space-y-4 animate-fade-in">
              {/* User Identity Card */}
              <div className="p-4 rounded-2xl bg-black/40 border border-[#C58B4E]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F3CA9D]">
                    <User className="w-4 h-4 text-[#E0A96D]" />
                    <span>साधक परिचय एवं विवरण</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    aria-label={isEditing ? "संशोधन रद्द करें" : "प्रोफाइल विवरण में संशोधन करें"}
                    className="min-h-[44px] px-2 flex items-center gap-1.5 text-xs text-[#E0A96D] hover:text-[#FFF] font-bold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'रद्द करें' : 'संशोधन करें'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 text-xs">
                    <div>
                      <label htmlFor="edit-name" className="block text-[#C58B4E] mb-1 font-bold">आपका नाम (Name):</label>
                      <input
                        id="edit-name"
                        type="text"
                        required
                        value={userData.name}
                        onChange={e => setUserData({ ...userData, name: e.target.value })}
                        className="w-full min-h-[44px] bg-white/5 border border-[#C58B4E]/40 text-[#F7E7D6] px-3 py-2 rounded-xl text-xs outline-none focus:border-[#E0A96D]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="edit-gotra" className="block text-[#C58B4E] mb-1 font-bold">गोत्र (Gotra):</label>
                        <input
                          id="edit-gotra"
                          type="text"
                          value={userData.gotra}
                          onChange={e => setUserData({ ...userData, gotra: e.target.value })}
                          className="w-full min-h-[44px] bg-white/5 border border-[#C58B4E]/40 text-[#F7E7D6] px-3 py-2 rounded-xl text-xs outline-none focus:border-[#E0A96D]"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-city" className="block text-[#C58B4E] mb-1 font-bold">स्थान (City):</label>
                        <input
                          id="edit-city"
                          type="text"
                          value={userData.city}
                          onChange={e => setUserData({ ...userData, city: e.target.value })}
                          className="w-full min-h-[44px] bg-white/5 border border-[#C58B4E]/40 text-[#F7E7D6] px-3 py-2 rounded-xl text-xs outline-none focus:border-[#E0A96D]"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      aria-label="प्रोफाइल विवरण सहेजें"
                      className="btn-gold w-full min-h-[44px] text-xs py-2.5 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>विवरण सहेजें (Save Profile)</span>
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-[#C58B4E]/20">
                      <span className="text-[#A67C52] text-[10px] block">नाम:</span>
                      <strong className="text-[#F7E7D6]">{userData.name}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-[#C58B4E]/20">
                      <span className="text-[#A67C52] text-[10px] block">गोत्र:</span>
                      <strong className="text-[#F3CA9D]">{userData.gotra}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-[#C58B4E]/20">
                      <span className="text-[#A67C52] text-[10px] block">स्थान:</span>
                      <strong className="text-[#F7E7D6]">{userData.city}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-[#C58B4E]/20 flex items-center justify-between">
                      <div>
                        <span className="text-[#A67C52] text-[10px] block">स्थिति:</span>
                        <strong className="text-emerald-400">सक्रिय</strong>
                      </div>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Sadhana Milestone Stats Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-[#C58B4E]/30">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#E0A96D] font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>कुल पुण्य अर्जन</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[#F3CA9D]">+{points} pts</div>
                  <span className="text-[10px] text-[#C58B4E] block mt-0.5">साधना पद: <strong className="text-[#F7E7D6]">{rank}</strong></span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-[#C58B4E]/30">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#E0A96D] font-bold mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>साधना निरन्तरता</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[#F3CA9D]">{currentStreak || 3} दिवस</div>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">नित्य सङ्कल्प सक्रिय</span>
                </div>
              </div>

              {/* Quick Link to Settings */}
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="w-full min-h-[44px] p-3 rounded-2xl bg-gradient-to-r from-black/40 to-[#2A170C]/40 border border-[#C58B4E]/30 hover:border-[#E0A96D] flex items-center justify-between text-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#E0A96D] group-hover:rotate-45 transition-transform" />
                  <span className="font-bold text-[#F3CA9D]">भाषा, ध्वनि, स्थान एवं विन्यास सेटिंग्स</span>
                </div>
                <span className="text-[11px] text-[#E0A96D] font-bold">खोलें →</span>
              </button>
            </div>
          )}

          {/* TAB 2: विन्यास एवं सेटिंग्स (SETTINGS TABPANEL) */}
          {activeTab === 'settings' && (
            <div id="tabpanel-settings" role="tabpanel" aria-labelledby="tab-settings" className="space-y-5 animate-fade-in">
              {/* 1. Language Selection (भाषा चयन) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F3CA9D]">
                  <Globe className="w-4 h-4 text-[#E0A96D]" />
                  <span>१. भाषा चयन (Language Selection)</span>
                </div>

                <div className="space-y-2" role="radiogroup" aria-label="एप्लिकेशन भाषा चुनें">
                  {languages.map(lang => {
                    const isSelected = currentLang === lang.code;

                    return (
                      <button
                        key={lang.code}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${lang.label} - ${lang.desc}`}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full min-h-[48px] p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-left ${
                          isSelected
                            ? 'bg-[#C58B4E]/25 border-[#E0A96D] shadow-md text-[#FFF]'
                            : 'bg-black/40 border-[#C58B4E]/25 text-[#D4A373] hover:border-[#C58B4E]/50'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-[#F7E7D6]">{lang.label}</div>
                          <div className="text-[11px] text-[#C58B4E] mt-0.5">{lang.desc}</div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#E0A96D] flex items-center justify-center text-[#120A05] font-bold shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Audio & Sacred Chimes Settings (ध्वनि नियंत्रण) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F3CA9D]">
                  <Bell className="w-4 h-4 text-[#E0A96D]" />
                  <span>२. ध्वनि एवं घण्टा नाद विन्यास (Sound Toggle)</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-[#C58B4E]/30 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#F7E7D6]">साधना ध्वनि एवं नाद</div>
                      <div className="text-[11px] text-[#C58B4E]">मन्दिर घण्टा, शंख एवं जप मनका नाद</div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleSound}
                      aria-label={`${isMuted ? 'म्यूट' : 'सक्रिय'} - ${isMuted ? 'ध्वनि चालू करें (Unmute Bell & Chimes)' : 'ध्वनि म्यूट करें (Mute Sound)'}`}
                      className={`min-w-[44px] min-h-[44px] px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isMuted 
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
                          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                      <span>{isMuted ? 'म्यूट' : 'सक्रिय'}</span>
                    </button>
                  </div>

                  {/* Test Audio Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-[#C58B4E]/15">
                    <button
                      type="button"
                      onClick={() => audioService.playTempleBell(528, 2.5)}
                      aria-label="मन्दिर घण्टा नाद सुनें और परीक्षण करें"
                      className="w-full sm:flex-1 min-h-[44px] py-2 px-3 rounded-xl border border-[#C58B4E]/30 bg-black/30 hover:bg-[#C58B4E]/20 text-xs text-[#F3CA9D] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>🔔</span>
                      <span>मन्दिर घण्टा नाद सुनें</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => audioService.playShankh()}
                      aria-label="दिव्य शंख नाद सुनें और परीक्षण करें"
                      className="w-full sm:flex-1 min-h-[44px] py-2 px-3 rounded-xl border border-[#C58B4E]/30 bg-black/30 hover:bg-[#C58B4E]/20 text-xs text-[#F3CA9D] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>🐚</span>
                      <span>दिव्य शंख नाद सुनें</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Profile Location (साधना नगर एवं पञ्चाङ्ग स्थान) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F3CA9D]">
                  <MapPin className="w-4 h-4 text-[#E0A96D]" />
                  <span>३. साधना नगर एवं पञ्चाङ्ग स्थान (Profile Location)</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-[#C58B4E]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#A67C52] text-[10px] block">सक्रिय साधना नगर:</span>
                      <strong className="text-sm text-[#F7E7D6]">
                        {location?.cityName || userData.city || 'वाराणसी (Varanasi)'}
                      </strong>
                      <span className="text-[10px] text-[#D4A373] block font-mono">
                        {location?.lat ? `${location.lat.toFixed(2)}° N, ${location.lon.toFixed(2)}° E` : '28.61° N, 77.21° E'}
                      </span>
                    </div>

                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${
                      location?.isDefaultLocation 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {location?.isDefaultLocation ? 'पूर्वनिर्धारित (दिल्ली)' : 'सक्रिय नगर'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLocationPickerOpen(true)}
                    aria-label="साधना नगर बदलें या जीपीएस स्थान से पहचानें"
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-[#C58B4E]/50 bg-gradient-to-r from-[#C58B4E]/20 to-[#E0A96D]/20 text-[#F3CA9D] hover:bg-[#C58B4E]/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Compass className="w-4 h-4 text-[#E0A96D]" />
                    <span>स्थान बदलें / जीपीएस से पहचानें (Change Location)</span>
                  </button>
                </div>
              </div>

              {/* 4. About & Privacy Section (परिचय एवं गोपनीयता नीति) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F3CA9D]">
                  <ShieldCheck className="w-4 h-4 text-[#E0A96D]" />
                  <span>४. परिचय एवं गोपनीयता नीति (About & Privacy)</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-[#C58B4E]/30 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#E0A96D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#F3CA9D] block">कर्मफल - सनातन वैदिक ऐप (v1.0.0-वैदिक)</strong>
                      <p className="text-[11px] text-[#D4A373] mt-0.5 leading-relaxed">
                        सनातन धर्म के शाश्वत ज्ञान, पञ्चाङ्ग, ज्योतिष, कुण्डली एवं नित्य साधना को समर्पित सम्पूर्ण आध्यात्मिक मञ्च।
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-[#C58B4E]/20 space-y-1">
                    <span className="text-[10px] font-bold text-[#E0A96D] uppercase block">
                      धर्मशास्त्र एवं गणितीय आधार:
                    </span>
                    <p className="text-[11px] text-[#F7E7D6]">
                      ऋग्वेद, श्रीमद्भगवद्गीता, गरुड़ पुराण, सूर्य सिद्धान्त एवं वृहत् पराशर होरा शास्त्र पर आधारित।
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                      १००% स्थानीय एवं सुरक्षित गोपनीयता (Privacy Guarantee):
                    </span>
                    <p className="text-[11px] text-emerald-200 leading-relaxed">
                      आपकी जन्म तिथि, समय, जन्म स्थान, कुण्डली एवं साधना सम्बन्धी समस्त गणनाएं केवल आपके उपकरण (Device Local Storage) में सुरक्षित रहती हैं। कोई भी व्यक्तिगत डेटा किसी बाहरी सर्वर या तीसरे पक्ष को नहीं भेजा जाता।
                    </p>
                  </div>

                  {/* Device-Bound Account Recovery Notice & Export/Import Data */}
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F3CA9D]">
                      <ShieldCheck className="w-4 h-4 text-[#E0A96D]" />
                      <span>उपकरण डेटा एवं बैकअप नीति (Device-Bound Data Notice)</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      इस एप्लिकेशन में कोई बाह्य ईमेल/पासवर्ड खाता नहीं है। आपका समस्त डेटा (पुण्य खाता, जप गणना, कुण्डली एवं साधना नियम) केवल आपके इसी उपकरण में सुरक्षित है। उपकरण बदलने अथवा ब्राउज़र डेटा हटाने से पूर्व अपना बैकअप निर्यात (Export) कर सुरक्षित रख लें।
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleExportData}
                        aria-label="मेरा डेटा JSON फाइल में निर्यात करें"
                        className="w-full sm:flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-gradient-to-r from-[#C58B4E] to-[#8C5318] text-[#120A05] font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>डेटा निर्यात (Export JSON)</span>
                      </button>

                      <label 
                        className="w-full sm:flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-black/60 border border-[#C58B4E]/40 hover:border-[#E0A96D] text-[#F7E7D6] font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.currentTarget.querySelector('input')?.click();
                          }
                        }}
                      >
                        <Upload className="w-4 h-4 text-[#E0A96D]" />
                        <span>डेटा आयात (Import JSON)</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleImportFile}
                          className="hidden"
                          aria-label="JSON बैकअप फ़ाइल चुनें"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="text-[10px] text-center text-[#A67C52] pt-1">
                    सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। निष्काम धर्म सेवा हेतु समर्पित।
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Done / Close Button (min 44px tap target) */}
          <div className="mt-6 pt-3 border-t border-[#C58B4E]/20">
            <button
              type="button"
              onClick={onClose}
              className="btn-gold w-full min-h-[44px] justify-center text-xs py-2.5 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>सम्पन्न (Done)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
      />
    </>
  );
}

export default memo(ProfileModal);

