import React, { useState, useEffect } from 'react';
import { ShieldCheck, Flame, Search, BookOpen, HeartHandshake, Sparkles, ArrowLeft, Info, AlertOctagon } from 'lucide-react';
import { NARAKAS_28, searchNarakas, KARMIC_CATEGORIES, calculateKarmicAudit } from '../../services/narakasData';
import { audioService } from '../../services/audioService';

export default function Narakas28Explorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeNaraka, setActiveNaraka] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'detail', 'audit'
  
  const [auditResponses, setAuditResponses] = useState({
    ahimsaViolations: 0,
    truthViolations: 0,
    greedViolations: 0,
    betrayalViolations: 0
  });

  const filteredNarakas = searchNarakas(searchQuery, selectedCategory);
  const auditResult = calculateKarmicAudit(auditResponses);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      


      {/* Mode 1: Karmic Self-Audit Tool */}
      {view === 'audit' && (
        <div className="glass-card p-6 border-t-4 border-amber-500 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-amber-400" />
              <span>कर्म आत्म-परीक्षण एवं पाप शुद्धि परामर्श</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              यम-नियम एवं सदाचार के आधार पर अपने कर्मों का निष्पक्ष आत्म-मूल्यांकन करें।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <label className="block font-bold text-slate-200 mb-1">१. अहिंसा (किसी जीव को मन/वचन/कर्म से कष्ट देना)</label>
              <select
                value={auditResponses.ahimsaViolations}
                onChange={e => setAuditResponses({ ...auditResponses, ahimsaViolations: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2.5 rounded-xl outline-none font-sans"
              >
                <option value={0}>कभी नहीं (पूर्ण अहिंसक आचरण)</option>
                <option value={1}>अल्प अनजाने में (सूक्ष्म हिंसा)</option>
                <option value={2}>क्रोधवश कटु वचन व आघात</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <label className="block font-bold text-slate-200 mb-1">२. सत्य (असत्य भाषण अथवा कपटपूर्ण व्यवहार)</label>
              <select
                value={auditResponses.truthViolations}
                onChange={e => setAuditResponses({ ...auditResponses, truthViolations: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2.5 rounded-xl outline-none font-sans"
              >
                <option value={0}>सर्वदा सत्य एवं प्रिय भाषण</option>
                <option value={1}>सांसारिक स्वार्थवश असत्य</option>
                <option value={2}>किसी को हानि पहुँचाने हेतु असत्य साक्ष्य</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <label className="block font-bold text-slate-200 mb-1">३. अस्तेय (लोभ अथवा अनैतिक धनार्जन)</label>
              <select
                value={auditResponses.greedViolations}
                onChange={e => setAuditResponses({ ...auditResponses, greedViolations: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2.5 rounded-xl outline-none font-sans"
              >
                <option value={0}>न्यायोपार्जित धन एवं सन्तोष</option>
                <option value={1}>धन का अतिशय मोह</option>
                <option value={2}>अधर्म द्वारा धन संचय</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <label className="block font-bold text-slate-200 mb-1">४. विश्वास एवं कृतज्ञता (माता-पिता, गुरु व मित्र के प्रति)</label>
              <select
                value={auditResponses.betrayalViolations}
                onChange={e => setAuditResponses({ ...auditResponses, betrayalViolations: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2.5 rounded-xl outline-none font-sans"
              >
                <option value={0}>सदा पूज्य भाव एवं सेवा</option>
                <option value={1}>अनादर या उपेक्षा</option>
                <option value={2}>विश्वासघात या गुरु-द्रोह</option>
              </select>
            </div>
          </div>

          {/* Audit Results Card */}
          <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3">
              <span className="font-bold text-amber-300 text-sm">आत्म-परीक्षण परिणाम: {auditResult.verdict}</span>
              <span className="font-mono text-amber-200 font-bold">पुण्य सन्तुलन अंक: {auditResult.score} / १००</span>
            </div>
            <div className="space-y-2">
              <strong className="text-amber-400 block">शास्त्रोक्त प्रायश्चित मार्गदर्शिका:</strong>
              {auditResult.recommendedExpiations.map((exp, idx) => (
                <div key={idx} className="text-slate-200 flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: 28 Narakas Encyclopedia Front Page List */}
      {view === 'list' && (
        <div className="glass-card p-6 space-y-6 animate-fade-in">
          {/* Search & Category Filter */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
                <input
                  type="text"
                  placeholder="नरक का नाम, पाप कर्म या श्लोक खोजें... (उदा. चोरी, हत्या, मांस)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm pl-11 pr-4 py-3 rounded-xl outline-none focus:border-amber-400 font-sans"
                />
              </div>
              <button
                onClick={() => {
                  audioService.playBeadClick();
                  setView(view === 'audit' ? 'list' : 'audit');
                }}
                className="btn-gold whitespace-nowrap shrink-0 flex items-center gap-2 justify-center py-3 px-6"
              >
                <Sparkles className="w-4 h-4" />
                <span>{view === 'audit' ? '२८ नरक सूची देखें' : 'कर्म आत्म-परीक्षण करें'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {KARMIC_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    audioService.playBeadClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all font-semibold border ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-amber-500/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Narakas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNarakas.map(naraka => (
              <button
                key={naraka.id}
                onClick={() => {
                  audioService.playBeadClick();
                  setActiveNaraka(naraka);
                  setView('detail');
                }}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-700 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all text-left group flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-serif font-bold text-lg text-amber-200 group-hover:text-amber-300">
                      {naraka.id}. {naraka.nameDevanagari}
                    </span>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-amber-400/80 font-mono border border-amber-500/20">
                      {naraka.shlokaRef.split(' ')[2] || naraka.shlokaRef}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mb-2 block border-b border-slate-700/50 pb-2">
                    {naraka.nameIAST}
                  </span>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    {naraka.transgression}
                  </p>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-rose-400 text-xs font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                  <span>विस्तृत विवरण पढ़ें</span>
                  <BookOpen className="w-4 h-4" />
                </div>
              </button>
            ))}
            
            {filteredNarakas.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <Info className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>आपके द्वारा खोजा गया शब्द किसी नरक या पाप विवरण में नहीं मिला।</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Detailed View for Selected Naraka */}
      {view === 'detail' && activeNaraka && (
        <div className="animate-fade-in-up space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                audioService.playBeadClick();
                setView('list');
                setActiveNaraka(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-sm font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>२८ नरक सूची में वापस जाएं</span>
            </button>
          </div>
          
          <div className="glass-card p-6 md:p-10 flex flex-col justify-between border-t-4 border-rose-600">
            <div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-amber-500/20 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-saffron">नरक क्रमांक #{activeNaraka.id}</span>
                    <span className="badge-gold font-mono">{activeNaraka.shlokaRef}</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-serif font-bold text-amber-200 mt-2">
                    {activeNaraka.nameDevanagari}
                  </h3>
                  <span className="text-lg text-amber-400/80 font-mono mt-1 block">
                    ({activeNaraka.nameIAST})
                  </span>
                </div>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_30px_rgba(225,29,72,0.3)] shrink-0">
                  <Flame className="w-8 h-8 md:w-10 md:h-10 text-slate-950" />
                </div>
              </div>

              {/* Sanskrit Mool Shloka */}
              <div className="p-6 md:p-8 rounded-2xl bg-slate-950 border border-amber-500/30 mb-8 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <div className="flex items-center justify-between text-sm text-amber-400 font-bold mb-4">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>गरुड़ पुराण मूल श्लोक (Sanskrit Shloka)</span>
                  </span>
                </div>
                <pre className="font-sanskrit text-lg md:text-xl text-amber-100 whitespace-pre-line leading-loose text-center py-4 bg-amber-950/20 rounded-xl">
                  {activeNaraka.sanskritShloka}
                </pre>
              </div>

              {/* Transgression & Metaphysical Consequence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm md:text-base">
                <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/20 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertOctagon className="w-5 h-5 text-rose-500" />
                    <strong className="text-rose-400 font-bold text-lg">कारण (विहित पाप कर्म):</strong>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans text-justify">
                    {activeNaraka.transgression}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/20 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <strong className="text-amber-400 font-bold text-lg">आध्यात्मिक दण्ड एवं शुद्धि स्वरूप:</strong>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans text-justify">
                    {activeNaraka.punishmentMetaphysics}
                  </p>
                </div>
              </div>
            </div>

            {/* Prayashchitta Expiation Roadmap */}
            <div className="p-6 md:p-8 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-sm md:text-base shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <strong className="text-emerald-300 block font-bold mb-3 flex items-center gap-2 text-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span>शास्त्र सम्मत प्रायश्चित विधान (पाप मुक्ति व कर्म शुद्धि उपाय):</span>
              </strong>
              <p className="text-emerald-100/90 leading-relaxed font-semibold font-sans text-justify">
                {activeNaraka.prayashchittaRoadmap}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
