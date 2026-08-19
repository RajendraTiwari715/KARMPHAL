import React, { useState } from 'react';
import { Sun, Moon, Sparkles, Clock, Calendar, Star, Compass, ArrowLeft } from 'lucide-react';
import { computePanchang } from '../../services/ephemerisEngine';
import { audioService } from '../../services/audioService';

const HINDU_FESTIVALS = [
  { name: 'महाशिवरात्रि', date: 'फाल्गुन कृष्ण चतुर्दशी', gregorian: 'फरवरी / मार्च', desc: 'देवाधिदेव भगवान् शिव एवं माता पार्वती के विवाह का परम पावन महापर्व। रुद्राभिषेक एवं रात्रि जागरण।' },
  { name: 'होली / होलिका दहन', date: 'फाल्गुन पूर्णिमा', gregorian: 'मार्च', desc: 'भक्त प्रह्लाद की रक्षा, होलिका दहन एवं रंगों का उल्लासमय पावन पर्व।' },
  { name: 'चैत्र नवरात्रि / नववर्ष', date: 'चैत्र शुक्ल प्रतिपदा', gregorian: 'मार्च / अप्रैल', desc: 'हिन्दू नववर्ष (विक्रम संवत्सर) आरम्भ एवं माँ दुर्गा के ९ रूपों की दिव्य आराधना।' },
  { name: 'श्री राम नवमी', date: 'चैत्र शुक्ल नवमी', gregorian: 'अप्रैल', desc: 'मर्यादा पुरुषोत्तम भगवान् श्रीराम का प्राकट्य दिवस। रामचरितमानस पाठ एवं भजन।' },
  { name: 'श्री कृष्ण जन्माष्टमी', date: 'भाद्रपद कृष्ण अष्टमी', gregorian: 'अगस्त / सितम्बर', desc: 'भगवान् श्रीकृष्ण का मध्यरात्रि में दिव्य प्राकट्य उत्सव, व्रत एवं मटकी फोड़।' },
  { name: 'गणेश चतुर्थी', date: 'भाद्रपद शुक्ल चतुर्थी', gregorian: 'सितम्बर', desc: 'विघ्नहर्ता भगवान् श्री गणेश जी की १० दिवसीय प्राण-प्रतिष्ठा एवं पूजनोत्सव।' },
  { name: 'शारदीय नवरात्रि', date: 'आश्विन शुक्ल प्रतिपदा', gregorian: 'अक्टूबर', desc: 'माँ जगदम्बा की ९ दिवसीय शक्ति साधना, गरबा एवं दुर्गा पूजा।' },
  { name: 'विजयादशमी / दशहरा', date: 'आश्विन शुक्ल दशमी', gregorian: 'अक्टूबर', desc: 'अधर्म पर धर्म की विजय, रावण वध एवं शस्त्र पूजन।' },
  { name: 'धनतेरस एवं दीपावली', date: 'कार्तिक कृष्ण त्रयोदशी से अमावस्या', gregorian: 'अक्टूबर / नवम्बर', desc: 'भगवान् धन्वन्तरि प्राकट्य, माँ महालक्ष्मी पूजन एवं दीप प्रज्वलन का महापर्व।' },
  { name: 'मकर संक्रान्ति', date: 'पौष शुक्ल (सूर्य का मकर राशि प्रवेश)', gregorian: '१४-१५ जनवरी', desc: 'सूर्य देव का उत्तरायण प्रवेश, गंगा स्नान, तिल-गुड़ दान एवं पतंगोत्सव।' },
  { name: 'निर्जला एकादशी', date: 'ज्येष्ठ शुक्ल एकादशी', gregorian: 'मई / जून', desc: 'समस्त २४ एकादशियों का पुण्य देने वाला परम पवित्र निर्जल व्रत एवं जल-दान।' },
  { name: 'गुरु पूर्णिमा', date: 'आषाढ़ पूर्णिमा', gregorian: 'जुलाई', desc: 'महर्षि वेदव्यास जयन्ती एवं अपने सद्गुरु के चरणों में कृतज्ञता ज्ञापन।' }
];

export default function PanchangView({ onBack, panchangData }) {
  const panchang = panchangData || computePanchang(new Date(), 28.6139, 77.2090);
  const now = new Date();
  const englishDate = now.toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const englishTime = now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            audioService.playBeadClick();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ज्योतिष खण्ड में वापस जाएं</span>
        </button>

        <span className="badge-gold font-bold text-xs">१००% शुद्ध दृक पञ्चाङ्ग</span>
      </div>

      {/* Hero Panchang Header */}
      <div className="glass-card-gold p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge-gold">विक्रम संवत् २०८१ (कालयुक्त)</span>
              <span className="badge-saffron">शाके १९४६</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-dharmik font-bold text-amber-200">
              दैनिक शुद्ध वैदिक पञ्चाङ्ग
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans">
              सूर्य सिद्धान्त एवं नासा दृक गणित आधारित सटीक तिथि, नक्षत्र, योग, करण एवं पञ्चाङ्ग स्तम्भ।
            </p>
          </div>

          {/* Real-time English Clock & Date Box */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-amber-500/30 text-right">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">अंग्रेजी दिनांक एवं समय</div>
            <div className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">{englishDate}</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-0.5">{englishTime}</div>
          </div>
        </div>
      </div>

      {/* 5 Panchang Pillars Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="glass-card p-4 border-l-4 border-amber-400">
          <div className="flex items-center justify-between text-amber-300 text-xs font-bold mb-1">
            <span>१. तिथि</span>
            <Moon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchang.tithi?.name}</div>
          <div className="text-xs text-amber-200/80 mt-1">{panchang.tithi?.paksha}</div>
          <div className="text-[11px] text-slate-400 mt-1">चन्द्र कला स्थिति</div>
        </div>

        <div className="glass-card p-4 border-l-4 border-cyan-400">
          <div className="flex items-center justify-between text-cyan-300 text-xs font-bold mb-1">
            <span>२. नक्षत्र</span>
            <Star className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchang.nakshatra?.name}</div>
          <div className="text-xs text-cyan-200/80 mt-1">पाद {panchang.nakshatra?.pada} (स्वामी: {panchang.nakshatra?.lord})</div>
          <div className="text-[11px] text-slate-400 mt-1">देवता: {panchang.nakshatra?.deity}</div>
        </div>

        <div className="glass-card p-4 border-l-4 border-emerald-400">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold mb-1">
            <span>३. योग</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchang.yoga?.name}</div>
          <div className="text-xs text-emerald-200/80 mt-1">सूर्य-चन्द्र कोण योग</div>
          <div className="text-[11px] text-slate-400 mt-1">शुभ कर्म फल प्रदायक</div>
        </div>

        <div className="glass-card p-4 border-l-4 border-purple-400">
          <div className="flex items-center justify-between text-purple-300 text-xs font-bold mb-1">
            <span>४. करण</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchang.karana?.name}</div>
          <div className="text-xs text-purple-200/80 mt-1">अर्ध-तिथि क्रम</div>
          <div className="text-[11px] text-slate-400 mt-1">कार्य सिद्धि नियामक</div>
        </div>

        <div className="glass-card p-4 border-l-4 border-orange-400">
          <div className="flex items-center justify-between text-orange-300 text-xs font-bold mb-1">
            <span>५. वार</span>
            <Sun className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchang.vara?.name.split(' ')[0]}</div>
          <div className="text-xs text-orange-200/80 mt-1">अधिपति: {panchang.vara?.deity}</div>
          <div className="text-[11px] text-slate-400 mt-1">सूर्योदय पर्यन्त</div>
        </div>
      </div>

      {/* Muhurta Windows */}
      <div className="glass-card p-5">
        <h3 className="font-dharmik text-base font-bold text-amber-300 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>शुभ एवं अशुभ मुहूर्त काल</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/30">
            <span className="text-emerald-400 font-bold block">ब्रह्म मुहूर्त (१.५x साधना फल)</span>
            <span className="text-slate-100 font-mono text-sm font-bold mt-1 block">{panchang.muhurtas?.brahmaMuhurta}</span>
            <span className="text-[10px] text-slate-400">सूर्योदय से पूर्व सर्वोत्तम काल</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/30">
            <span className="text-amber-400 font-bold block">अभिजित मुहूर्त (सर्वकार्य सिद्धि)</span>
            <span className="text-slate-100 font-mono text-sm font-bold mt-1 block">{panchang.muhurtas?.abhijit}</span>
            <span className="text-[10px] text-slate-400">सर्वोत्तम शुभ मुहूर्त काल</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-rose-500/30">
            <span className="text-rose-400 font-bold block">राहु काल (वर्जित समय)</span>
            <span className="text-slate-100 font-mono text-sm font-bold mt-1 block">{panchang.muhurtas?.rahuKalam}</span>
            <span className="text-[10px] text-slate-400">नये कार्य व यात्रा वर्जित</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/30">
            <span className="text-cyan-400 font-bold block">स्थानीय सूर्योदय व सूर्यास्त</span>
            <div className="flex justify-between text-slate-100 font-mono text-xs mt-1">
              <span>🌅 {panchang.muhurtas?.sunrise}</span>
              <span>🌇 {panchang.muhurtas?.sunset}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">स्थान: नई दिल्ली (२८.६१° N)</span>
          </div>
        </div>
      </div>

      {/* Hindu Festivals & Vrat Calendar List */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
          <h3 className="font-dharmik text-lg font-bold text-amber-300 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>प्रमुख हिन्दू व्रत एवं त्यौहार (Hindu Festivals & Vrats)</span>
          </h3>
          <span className="badge-gold text-xs">वार्षिक व्रत पञ्चाङ्ग</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {HINDU_FESTIVALS.map((fest, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-amber-200 text-sm">{fest.name}</h4>
                  <span className="text-[11px] font-mono text-amber-400/90 font-semibold">{fest.gregorian}</span>
                </div>
                <div className="text-[11px] text-cyan-300 font-semibold">{fest.date}</div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">{fest.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
