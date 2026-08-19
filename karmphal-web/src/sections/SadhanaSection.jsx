import React, { useState } from 'react';
import { 
  Calendar, Moon, Star, Flame, Scroll, Video, 
  ChevronRight, ArrowLeft, Sparkles, Copy, Check, Compass, ShieldCheck 
} from 'lucide-react';
import { computePanchang } from '../services/ephemerisEngine';
import { 
  SACRED_ARTIS, SACRED_CHALISAS, SACRED_MANTRAS_LIST, 
  SACRED_LIVE_DARSHAN, SACRED_STOTRAS 
} from '../services/sadhanaData';
import DigitalJapaMala from '../components/SadhanaGamification/DigitalJapaMala';
import PujaVidhanStateMachine from '../components/RitualVault/PujaVidhanStateMachine';

export default function SadhanaSection() {
  const [activeModal, setActiveModal] = useState(null); // 'arti', 'chalisa', 'mantra', 'live', 'stotra_detail', 'japa_mala', 'puja_vidhan'
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const now = new Date();
  const panchang = computePanchang(now, 28.6139, 77.2090);

  const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const tithiFormatted = panchang.tithi?.name || 'Dwadashi';
  const rashiFormatted = panchang.planets?.[2]?.signSanskrit || 'Mithun';
  const nakshatraFormatted = panchang.nakshatra?.name || 'Ashwini';

  const handleOpenAction = (actionType) => {
    setActiveModal(actionType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStotra = (stotra) => {
    setSelectedItem(stotra);
    setActiveModal('stotra_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Render Digital Japa Mala Full View
  if (activeModal === 'japa_mala') {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <button
          onClick={() => setActiveModal(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/40 text-[#F3CA9D] hover:bg-[#2A170C] text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>साधना मुख्य पृष्ठ पर वापस जाएं</span>
        </button>
        <DigitalJapaMala />
      </div>
    );
  }

  // 2. Render 7-Stage Puja Vidhan Full View
  if (activeModal === 'puja_vidhan') {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <button
          onClick={() => setActiveModal(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/40 text-[#F3CA9D] hover:bg-[#2A170C] text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>साधना मुख्य पृष्ठ पर वापस जाएं</span>
        </button>
        <PujaVidhanStateMachine />
      </div>
    );
  }

  // 3. Render ARTI Sangrah Modal
  if (activeModal === 'arti') {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/40 text-[#F3CA9D] hover:bg-[#2A170C] text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>साधना मुख्य पृष्ठ पर वापस जाएं</span>
          </button>
          <span className="badge-gold text-xs">आरती संग्रह</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SACRED_ARTIS.map(arti => (
            <div key={arti.id} className="glass-card p-6 space-y-4 border border-[#C58B4E]/30">
              <div className="flex items-center justify-between pb-3 border-b border-[#C58B4E]/20">
                <div>
                  <h3 className="font-dharmik text-lg font-bold text-[#F3CA9D]">{arti.title}</h3>
                  <span className="text-xs text-[#C58B4E] font-medium">{arti.deity}</span>
                </div>
                <button
                  onClick={() => handleCopyText(arti.id, `${arti.title}\n\n${arti.lyrics}`)}
                  className="p-2 rounded-xl bg-[#120A05] border border-[#C58B4E]/30 text-[#F3CA9D]"
                  title="आरती प्रतिलिपि बनाएं"
                >
                  {copiedId === arti.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <pre className="font-sanskrit text-xs sm:text-sm text-[#F7E7D6] whitespace-pre-line leading-relaxed bg-[#140B06]/80 p-4 rounded-2xl border border-[#C58B4E]/20">
                {arti.lyrics}
              </pre>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. Render CHALISA Sangrah Modal
  if (activeModal === 'chalisa') {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/40 text-[#F3CA9D] hover:bg-[#2A170C] text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>साधना मुख्य पृष्ठ पर वापस जाएं</span>
          </button>
          <span className="badge-gold text-xs">चालीसा संग्रह</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SACRED_CHALISAS.map(chalisa => (
            <div key={chalisa.id} className="glass-card p-6 space-y-4 border border-[#C58B4E]/30">
              <div className="flex items-center justify-between pb-3 border-b border-[#C58B4E]/20">
                <div>
                  <h3 className="font-dharmik text-lg font-bold text-[#F3CA9D]">{chalisa.title}</h3>
                  <span className="text-xs text-[#C58B4E]">रचयिता: {chalisa.author}</span>
                </div>
                <button
                  onClick={() => handleCopyText(chalisa.id, `${chalisa.title}\n\n[दोहा]:\n${chalisa.doha}\n\n[चौपाई]:\n${chalisa.chaupai}`)}
                  className="p-2 rounded-xl bg-[#120A05] border border-[#C58B4E]/30 text-[#F3CA9D]"
                >
                  {copiedId === chalisa.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {chalisa.doha && (
                <div className="p-3.5 rounded-xl bg-[#1A0E07] border border-[#C58B4E]/30">
                  <span className="text-[10px] font-bold text-[#C58B4E] uppercase block mb-1">॥ दोहा ॥</span>
                  <pre className="font-sanskrit text-xs text-[#F3CA9D] whitespace-pre-line leading-relaxed">{chalisa.doha}</pre>
                </div>
              )}

              <pre className="font-sanskrit text-xs sm:text-sm text-[#F7E7D6] whitespace-pre-line leading-relaxed bg-[#140B06]/80 p-4 rounded-2xl border border-[#C58B4E]/20 max-h-80 overflow-y-auto">
                {chalisa.chaupai}
              </pre>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. Render MANTRA Sangrah Modal
  if (activeModal === 'mantra') {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/40 text-[#F3CA9D] hover:bg-[#2A170C] text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>साधना मुख्य पृष्ठ पर वापस जाएं</span>
          </button>
          <span className="badge-gold text-xs">सिद्ध मन्त्र संग्रह</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SACRED_MANTRAS_LIST.map(item => (
            <div key={item.id} className="glass-card p-6 space-y-3 border border-[#C58B4E]/30">
              <div className="flex items-center justify-between pb-2 border-b border-[#C58B4E]/20">
                <div>
                  <h3 className="font-dharmik text-base font-bold text-[#F3CA9D]">{item.title}</h3>
                  <span className="text-xs text-[#C58B4E]">{item.deity}</span>
                </div>
                <button
                  onClick={() => handleCopyText(item.id, `${item.title}\n\n${item.mantra}\n\n[अर्थ]: ${item.meaning}`)}
                  className="p-2 rounded-xl bg-[#120A05] border border-[#C58B4E]/30 text-[#F3CA9D]"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#140B06] border border-[#C58B4E]/30 text-center">
                <pre className="font-sanskrit text-sm sm:text-base text-[#F3CA9D] whitespace-pre-line leading-relaxed font-bold">
                  {item.mantra}
                </pre>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                <strong className="text-[#C58B4E] block mb-0.5">हिन्दी भावार्थ:</strong>
                {item.meaning}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. Render LIVE Darshan Modal
  if (activeModal === 'live') {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/40 text-[#F3CA9D] hover:bg-[#2A170C] text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>साधना मुख्य पृष्ठ पर वापस जाएं</span>
          </button>
          <span className="badge-gold text-xs">लाइव मन्दिर दर्शन</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SACRED_LIVE_DARSHAN.map(temple => (
            <div key={temple.id} className="glass-card p-6 flex flex-col justify-between space-y-4 border border-[#C58B4E]/30">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#52311B] to-[#2A170C] border border-[#C58B4E] flex items-center justify-center text-3xl shrink-0 shadow-lg">
                  {temple.icon}
                </div>
                <div>
                  <h3 className="font-dharmik text-base font-bold text-[#F3CA9D]">{temple.name}</h3>
                  <p className="text-xs text-[#C58B4E] mt-0.5">{temple.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-[11px] text-emerald-300 font-semibold">{temple.status}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#C58B4E]/20 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">समय: {temple.timing}</span>
                <button
                  className="btn-gold text-xs py-1.5 px-3"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>दर्शन करें</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7. Render Stotra Detailed Reading View
  if (activeModal === 'stotra_detail' && selectedItem) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/40 text-[#F3CA9D] hover:bg-[#2A170C] text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>साधना मुख्य पृष्ठ पर वापस जाएं</span>
          </button>
          <span className="badge-gold text-xs">{selectedItem.title}</span>
        </div>

        <div className="glass-card-gold p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C58B4E]/20">
            <div>
              <h2 className="text-2xl font-dharmik font-bold text-[#F3CA9D]">{selectedItem.hindiTitle}</h2>
              <span className="text-xs text-[#C58B4E] mt-0.5 block">रचयिता: {selectedItem.author}</span>
            </div>

            <button
              onClick={() => handleCopyText(selectedItem.id, `${selectedItem.hindiTitle}\n\n${selectedItem.content}\n\n[अर्थ]: ${selectedItem.meaning}`)}
              className="p-2.5 rounded-xl bg-[#140B06] border border-[#C58B4E]/30 text-[#F3CA9D]"
            >
              {copiedId === selectedItem.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-[#140B06] border border-[#C58B4E]/30 text-center">
            <pre className="font-sanskrit text-base sm:text-lg text-[#F7E7D6] whitespace-pre-line leading-relaxed">
              {selectedItem.content}
            </pre>
          </div>

          <div className="p-5 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/30 space-y-1.5">
            <strong className="font-dharmik text-sm text-[#F3CA9D] block">हिन्दी भावार्थ एवं फलश्रुति:</strong>
            <p className="text-xs sm:text-sm text-[#E6D0BA] leading-relaxed font-sans">{selectedItem.meaning}</p>
          </div>
        </div>
      </div>
    );
  }

  // Master Sadhana Main Dashboard (Identical to reference mockup image)
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* 1. AAJ KA PANCHANG Card (Mockup Top Card) */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border-2 border-[#C58B4E]/60 shadow-2xl bg-gradient-to-b from-[#2E1A0F] via-[#21130B] to-[#160C06]">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-[#C58B4E]/10 pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-[#C58B4E]/10 pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          <h2 className="text-center font-serif text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F3CA9D] via-[#E0A96D] to-[#C58B4E] drop-shadow">
            AAJ KA PANCHANG
          </h2>

          <div className="space-y-3 pt-1 text-xs sm:text-sm">
            <div className="flex items-center gap-3 text-[#F3CA9D]">
              <span className="text-base sm:text-lg">📅</span>
              <span className="font-medium text-[#D4A373]">Date:</span>
              <span className="font-bold text-[#F7E7D6] ml-auto font-mono">{dateFormatted}</span>
            </div>

            <div className="flex items-center gap-3 text-[#F3CA9D]">
              <span className="text-base sm:text-lg">🌙</span>
              <span className="font-medium text-[#D4A373]">Thithi:</span>
              <span className="font-bold text-[#F7E7D6] ml-auto">{tithiFormatted}</span>
            </div>

            <div className="flex items-center gap-3 text-[#F3CA9D]">
              <span className="text-base sm:text-lg">🐂</span>
              <span className="font-medium text-[#D4A373]">Rashi:</span>
              <span className="font-bold text-[#F7E7D6] ml-auto">{rashiFormatted}</span>
            </div>

            <div className="flex items-center gap-3 text-[#F3CA9D]">
              <span className="text-base sm:text-lg">🌟</span>
              <span className="font-medium text-[#D4A373]">Nakshatra:</span>
              <span className="font-bold text-[#F7E7D6] ml-auto">{nakshatraFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Row of Sleek Circular Golden Icons (ARTI, CHALISA, MANTRA, LIVE) */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 py-2">
        <div 
          onClick={() => handleOpenAction('arti')}
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div className="circle-gold-btn">
            <span className="text-2xl group-hover:scale-110 transition-transform">🪔</span>
          </div>
          <span className="text-[11px] sm:text-xs font-serif font-bold tracking-widest text-[#E0A96D] uppercase group-hover:text-[#F3CA9D]">
            ARTI
          </span>
        </div>

        <div 
          onClick={() => handleOpenAction('chalisa')}
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div className="circle-gold-btn">
            <span className="text-2xl group-hover:scale-110 transition-transform">📜</span>
          </div>
          <span className="text-[11px] sm:text-xs font-serif font-bold tracking-widest text-[#E0A96D] uppercase group-hover:text-[#F3CA9D]">
            CHALISA
          </span>
        </div>

        <div 
          onClick={() => handleOpenAction('mantra')}
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div className="circle-gold-btn">
            <span className="text-2xl group-hover:scale-110 transition-transform">📖</span>
          </div>
          <span className="text-[11px] sm:text-xs font-serif font-bold tracking-widest text-[#E0A96D] uppercase group-hover:text-[#F3CA9D]">
            MANTRA
          </span>
        </div>

        <div 
          onClick={() => handleOpenAction('live')}
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div className="circle-gold-btn">
            <span className="text-2xl group-hover:scale-110 transition-transform">🎥</span>
          </div>
          <span className="text-[11px] sm:text-xs font-serif font-bold tracking-widest text-[#E0A96D] uppercase group-hover:text-[#F3CA9D]">
            LIVE
          </span>
        </div>
      </div>

      {/* 3. Sacred Stotras & Spiritual Action Tiles */}
      <div className="space-y-3 pt-2">
        <div 
          onClick={() => handleOpenStotra(SACRED_STOTRAS[0])}
          className="stotra-list-tile group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#52311B] to-[#25130A] border border-[#C58B4E]/40 flex items-center justify-center text-lg shadow">
              🔱
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#F3CA9D] group-hover:text-[#FFF] transition-colors">
                Shiv Stotra (Hindi)
              </h4>
              <p className="text-[11px] text-[#C58B4E] font-medium">शिव ताण्डव स्तोत्रम् व रुद्राष्टकम्</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#C58B4E] group-hover:translate-x-1 transition-transform" />
        </div>

        <div 
          onClick={() => handleOpenStotra(SACRED_STOTRAS[1])}
          className="stotra-list-tile group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#52311B] to-[#25130A] border border-[#C58B4E]/40 flex items-center justify-center text-lg shadow">
              🐘
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#F3CA9D] group-hover:text-[#FFF] transition-colors">
                Ganesha Mantra
              </h4>
              <p className="text-[11px] text-[#C58B4E] font-medium">संकटनाशन स्तोत्र एवं गणेश अष्टकम्</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#C58B4E] group-hover:translate-x-1 transition-transform" />
        </div>

        <div 
          onClick={() => handleOpenStotra(SACRED_STOTRAS[2])}
          className="stotra-list-tile group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#52311B] to-[#25130A] border border-[#C58B4E]/40 flex items-center justify-center text-lg shadow">
              🕉️
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#F3CA9D] group-hover:text-[#FFF] transition-colors">
                Bhagavad Gita
              </h4>
              <p className="text-[11px] text-[#C58B4E] font-medium">सम्पूर्ण १८ अध्याय, कर्मयोग एवं सार</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#C58B4E] group-hover:translate-x-1 transition-transform" />
        </div>

        <div 
          onClick={() => handleOpenStotra(SACRED_STOTRAS[3])}
          className="stotra-list-tile group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#52311B] to-[#25130A] border border-[#C58B4E]/40 flex items-center justify-center text-lg shadow">
              📿
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#F3CA9D] group-hover:text-[#FFF] transition-colors">
                Vishnu Sahasranama
              </h4>
              <p className="text-[11px] text-[#C58B4E] font-medium">श्री विष्णु सहस्रनाम स्तोत्रम्</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#C58B4E] group-hover:translate-x-1 transition-transform" />
        </div>

        <div 
          onClick={() => handleOpenAction('japa_mala')}
          className="stotra-list-tile group border-l-4 border-l-[#E0A96D]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E0A96D] to-[#996515] text-[#120A05] font-black flex items-center justify-center text-lg shadow">
              📿
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#F3CA9D] group-hover:text-[#FFF] transition-colors">
                १०८ डिजिटल जप माला एवं नित्य कर्म
              </h4>
              <p className="text-[11px] text-[#C58B4E] font-medium">अक्षर-वेग सुरक्षा एवं दैनिक सात्विक नियम</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#E0A96D] group-hover:translate-x-1 transition-transform" />
        </div>

        <div 
          onClick={() => handleOpenAction('puja_vidhan')}
          className="stotra-list-tile group border-l-4 border-l-[#C58B4E]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#52311B] to-[#25130A] border border-[#C58B4E]/40 flex items-center justify-center text-lg shadow">
              🔔
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#F3CA9D] group-hover:text-[#FFF] transition-colors">
                ७-चरणीय नित्य पूजा विधान
              </h4>
              <p className="text-[11px] text-[#C58B4E] font-medium">आचमन से क्षमा प्रार्थना पर्यन्त षोडशोपचार</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#C58B4E] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
