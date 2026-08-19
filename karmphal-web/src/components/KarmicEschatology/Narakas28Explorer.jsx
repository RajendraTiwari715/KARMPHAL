import React, { useState } from 'react';
import { ShieldCheck, Flame, Search, BookOpen, AlertOctagon, HeartHandshake, Sparkles, Filter } from 'lucide-react';
import { NARAKAS_28, searchNarakas, KARMIC_CATEGORIES, calculateKarmicAudit } from '../../services/narakasData';
import { audioService } from '../../services/audioService';

export default function Narakas28Explorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeNaraka, setActiveNaraka] = useState(NARAKAS_28[0]);
  const [auditMode, setAuditMode] = useState(false);
  const [auditResponses, setAuditResponses] = useState({
    ahimsaViolations: 0,
    truthViolations: 0,
    greedViolations: 0,
    betrayalViolations: 0
  });

  const filteredNarakas = searchNarakas(searchQuery, selectedCategory);
  const auditResult = calculateKarmicAudit(auditResponses);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card-gold p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">गरुड़ पुराण सारोद्धार (३.२-३.२९)</span>
              <span className="badge-saffron">श्रीमद्भागवत पुराण पञ्चम स्कन्ध</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>२८ नरक विवरण, कर्म शुद्धि एवं प्रायश्चित ग्रन्थागार</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              धर्मराज यम एवं चित्रगुप्त के न्याय सिद्धान्त के अनुसार पाप कर्मों का आध्यात्मिक विपाक, सूक्ष्म शरीर (लिङ्ग शरीर) की शुद्धि प्रक्रिया, तथा वेद-विहित प्रायश्चित विधान।
            </p>
          </div>

          <button
            onClick={() => {
              audioService.playBeadClick();
              setAuditMode(!auditMode);
            }}
            className="btn-gold self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>{auditMode ? '२८ नरक सूची देखें' : 'कर्म आत्म-परीक्षण करें'}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Karmic Self-Audit Tool */}
      {auditMode ? (
        <div className="glass-card p-6 border-t-4 border-amber-500 space-y-6">
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
      ) : (
        /* Mode 2: 28 Narakas Encyclopedia Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Search, Filter & 28 Narakas List */}
          <div className="lg:col-span-5 glass-card p-5 flex flex-col justify-between">
            <div>
              {/* Search & Category Filter */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="नरक का नाम, पाप या श्लोक खोजें..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {KARMIC_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        audioService.playBeadClick();
                        setSelectedCategory(cat.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all font-semibold ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 28 Narakas Scrollable List */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredNarakas.map(naraka => {
                  const isSelected = activeNaraka.id === naraka.id;

                  return (
                    <div
                      key={naraka.id}
                      onClick={() => {
                        audioService.playBeadClick();
                        setActiveNaraka(naraka);
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 shadow-md scale-[1.01]'
                          : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-amber-200">
                          {naraka.id}. {naraka.nameDevanagari} ({naraka.nameIAST})
                        </span>
                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-mono">
                          {naraka.shlokaRef}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1">
                        पाप: {naraka.transgression}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Naraka In-Depth Canonical Shloka & Expiation */}
          <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
                <div>
                  <span className="badge-saffron text-xs">नरक #{activeNaraka.id} • {activeNaraka.shlokaRef}</span>
                  <h3 className="text-2xl font-serif font-bold text-amber-200 mt-1">
                    {activeNaraka.nameDevanagari} ({activeNaraka.nameIAST})
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg">
                  <Flame className="w-5 h-5 text-slate-950" />
                </div>
              </div>

              {/* Sanskrit Mool Shloka */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 mb-4">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold mb-2">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>गरुड़ पुराण मूल श्लोक (Sanskrit Shloka)</span>
                  </span>
                  <span className="font-mono text-[11px]">{activeNaraka.shlokaRef}</span>
                </div>
                <pre className="font-sanskrit text-sm text-amber-100 whitespace-pre-line leading-relaxed">
                  {activeNaraka.sanskritShloka}
                </pre>
              </div>

              {/* Transgression & Metaphysical Consequence */}
              <div className="space-y-3 text-xs mb-4">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-rose-400 block font-bold mb-1">कारण (विहित पाप कर्म):</strong>
                  <p className="text-slate-200 leading-relaxed">{activeNaraka.transgression}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-amber-400 block font-bold mb-1">आध्यात्मिक दण्ड एवं शुद्धि स्वरूप:</strong>
                  <p className="text-slate-200 leading-relaxed">{activeNaraka.punishmentMetaphysics}</p>
                </div>
              </div>
            </div>

            {/* Prayashchitta Expiation Roadmap */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs">
              <strong className="text-emerald-300 block font-bold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>शास्त्र सम्मत प्रायश्चित विधान (पाप मुक्ति उपाय):</span>
              </strong>
              <p className="text-emerald-100 leading-relaxed font-semibold">
                {activeNaraka.prayashchittaRoadmap}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
