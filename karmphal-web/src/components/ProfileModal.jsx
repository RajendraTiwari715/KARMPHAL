import React, { useState } from 'react';
import { User, Globe, Award, Sparkles, Flame, Check, X, ShieldCheck, Edit3, Save, LogIn, CheckCircle } from 'lucide-react';
import { languageService } from '../services/languageService';

export default function ProfileModal({ isOpen, onClose, appState }) {
  if (!isOpen) return null;

  const currentLang = languageService.getLang();
  const t = languageService.t();

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('karmphal_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'सत्येन्द्र शर्मा',
      phoneOrEmail: 'satyendra@karmphal.app',
      gotra: 'कश्यप (Kashyapa)',
      city: 'वाराणसी (Varanasi)',
      isLoggedIn: true
    };
  });

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    localStorage.setItem('karmphal_user_profile', JSON.stringify(userData));
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
  const points = appState.punyaLedger || 108;
  let rank = 'भक्त (Bhakta)';
  if (points >= 1000) rank = 'परमहंस (Paramahamsa)';
  else if (points >= 500) rank = 'ऋषि (Rishi)';
  else if (points >= 300) rank = 'तपस्वी (Tapasvi)';
  else if (points >= 150) rank = 'साधक (Sadhaka)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card-gold max-w-lg w-full p-6 sm:p-7 relative rounded-3xl border border-[#C58B4E]/60 shadow-2xl bg-[#1C1008] text-[#F7E7D6] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#D4A373] hover:text-[#FFF] rounded-full bg-[#120A05] border border-[#C58B4E]/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header with ॐ Emblem */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-[#C58B4E]/25">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E0A96D] via-[#C58B4E] to-[#6A3B18] flex items-center justify-center text-[#120A05] font-black text-2xl shadow-xl shadow-[#C58B4E]/30 border border-[#F3CA9D]">
            ॐ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-dharmik text-xl font-bold text-[#F3CA9D]">ॐ साधना प्रोफाइल एवं विन्यास</h3>
              <span className="badge-gold text-[10px]">प्रमाणित साधक</span>
            </div>
            <p className="text-xs text-[#C58B4E] mt-0.5">साधक परिचय, भाषा चयन एवं आध्यात्मिक स्थिति</p>
          </div>
        </div>

        {/* User Login Information Card */}
        <div className="p-4 rounded-2xl bg-[#140B06] border border-[#C58B4E]/30 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F3CA9D]">
              <User className="w-4 h-4 text-[#E0A96D]" />
              <span>उपभोक्ता परिचय एवं विवरण (User Profile)</span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 text-[11px] text-[#E0A96D] hover:text-[#FFF] font-bold"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? 'रद्द करें' : 'संशोधन करें'}</span>
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-[#C58B4E] mb-1 font-bold">आपका नाम (Name):</label>
                <input
                  type="text"
                  required
                  value={userData.name}
                  onChange={e => setUserData({ ...userData, name: e.target.value })}
                  className="w-full bg-[#1C1008] border border-[#C58B4E]/40 text-[#F7E7D6] p-2 rounded-xl text-xs outline-none focus:border-[#E0A96D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#C58B4E] mb-1 font-bold">गोत्र (Gotra):</label>
                  <input
                    type="text"
                    value={userData.gotra}
                    onChange={e => setUserData({ ...userData, gotra: e.target.value })}
                    className="w-full bg-[#1C1008] border border-[#C58B4E]/40 text-[#F7E7D6] p-2 rounded-xl text-xs outline-none focus:border-[#E0A96D]"
                  />
                </div>
                <div>
                  <label className="block text-[#C58B4E] mb-1 font-bold">स्थान (City):</label>
                  <input
                    type="text"
                    value={userData.city}
                    onChange={e => setUserData({ ...userData, city: e.target.value })}
                    className="w-full bg-[#1C1008] border border-[#C58B4E]/40 text-[#F7E7D6] p-2 rounded-xl text-xs outline-none focus:border-[#E0A96D]"
                  />
                </div>
              </div>

              <button type="submit" className="btn-gold w-full text-xs py-2 mt-2">
                <Save className="w-3.5 h-3.5" />
                <span>विवरण सहेजें (Save Profile)</span>
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-[#1C1008] border border-[#C58B4E]/20">
                <span className="text-[#A67C52] text-[10px] block">नाम:</span>
                <strong className="text-[#F7E7D6]">{userData.name}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C1008] border border-[#C58B4E]/20">
                <span className="text-[#A67C52] text-[10px] block">गोत्र:</span>
                <strong className="text-[#F3CA9D]">{userData.gotra}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C1008] border border-[#C58B4E]/20">
                <span className="text-[#A67C52] text-[10px] block">स्थान:</span>
                <strong className="text-[#F7E7D6]">{userData.city}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C1008] border border-[#C58B4E]/20 flex items-center justify-between">
                <div>
                  <span className="text-[#A67C52] text-[10px] block">स्थिति:</span>
                  <strong className="text-emerald-400">सक्रिय (Active)</strong>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          )}
        </div>

        {/* Sadhana Stats Card */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-[#140B06] border border-[#C58B4E]/30">
            <div className="flex items-center gap-1.5 text-[11px] text-[#E0A96D] font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>कुल पुण्य अर्जन</span>
            </div>
            <div className="text-xl font-bold font-mono text-[#F3CA9D]">+{appState.punyaLedger || 108} pts</div>
            <span className="text-[10px] text-[#C58B4E] block mt-0.5">साधना पद: <strong className="text-[#F7E7D6]">{rank}</strong></span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#140B06] border border-[#C58B4E]/30">
            <div className="flex items-center gap-1.5 text-[11px] text-[#E0A96D] font-bold mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>साधना निरन्तरता</span>
            </div>
            <div className="text-xl font-bold font-mono text-[#F3CA9D]">{appState.currentStreak || 3} दिवस</div>
            <span className="text-[10px] text-emerald-400 block mt-0.5">नित्य सङ्कल्प सक्रिय</span>
          </div>
        </div>

        {/* Language Selection Section */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F3CA9D]">
            <Globe className="w-4 h-4 text-[#E0A96D]" />
            <span>भाषा चयन (Select App Language)</span>
          </div>

          <div className="space-y-2">
            {languages.map(lang => {
              const isSelected = currentLang === lang.code;

              return (
                <div
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#C58B4E]/25 border-[#E0A96D] shadow-md text-[#FFF]'
                      : 'bg-[#140B06] border-[#C58B4E]/25 text-[#D4A373] hover:border-[#C58B4E]/50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[#F7E7D6]">{lang.label}</div>
                    <div className="text-[11px] text-[#C58B4E] mt-0.5">{lang.desc}</div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#E0A96D] flex items-center justify-center text-[#120A05] font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-gold w-full justify-center text-xs py-2.5"
        >
          <span>सम्पन्न (Done)</span>
        </button>
      </div>
    </div>
  );
}
