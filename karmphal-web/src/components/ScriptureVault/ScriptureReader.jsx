import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, Volume2, Copy, Check, Filter } from 'lucide-react';
import { SCRIPTURES_CATALOG, searchScriptures } from '../../services/scripturesData';
import { audioService } from '../../services/audioService';

export default function ScriptureReader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeScripture, setActiveScripture] = useState(SCRIPTURES_CATALOG[0]);
  const [activeBhashyaTab, setActiveBhashyaTab] = useState('advaita'); // 'advaita', 'vishishtadvaita', 'dvaita'
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: 'all', label: 'समस्त ग्रन्थ (All Books)' },
    { id: 'श्रुति / वेद संहिता', label: 'वेद संहिता (Vedas)' },
    { id: 'श्रुति / प्रधान उपनिषद्', label: 'उपनिषद् (Upanishads)' },
    { id: 'स्मृति / इतिहास (प्रस्थानत्रयी)', label: 'श्रीमद्भगवद्गीता (Gita)' },
    { id: 'स्मृति / १८ महापुराण', label: 'महापुराण (Puranas)' },
    { id: 'स्मृति / इतिहास', label: 'रामायण व महाभारत' },
    { id: 'षड् दर्शन / योग दर्शन', label: 'दर्शन एवं योगसूत्र' }
  ];

  const filteredScriptures = SCRIPTURES_CATALOG.filter(s => {
    const matchesSearch = !searchQuery || 
      s.granth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shlokaDevanagari.includes(searchQuery) ||
      s.translationHindi.includes(searchQuery);
    
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(`${activeScripture.granth} - ${activeScripture.section}\n\n${activeScripture.shlokaDevanagari}\n\n[हिन्दी अनुवाद]: ${activeScripture.translationHindi}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Bar */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="वेद, उपनिषद्, गीता, पुराण अथवा संस्कृत श्लोक खोजें..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs pl-9 pr-4 py-3 rounded-xl outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <button
            onClick={() => audioService.playTempleBell(432, 1.2)}
            className="btn-gold px-6 text-xs justify-center"
          >
            <span>🔔 ग्रन्थ मङ्गल पाठ</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                audioService.playBeadClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all font-semibold ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scripture Viewer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scripture Catalog Index */}
        <div className="lg:col-span-4 glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-amber-200 mb-3 flex items-center justify-between">
              <span>ग्रन्थ सूची ({filteredScriptures.length} मन्त्र/श्लोक)</span>
              <span className="text-[10px] text-slate-400 font-mono">शास्त्र निधि</span>
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredScriptures.map(s => {
                const isSelected = activeScripture.id === s.id;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      audioService.playBeadClick();
                      setActiveScripture(s);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 shadow-md scale-[1.01]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="text-[10px] text-amber-400 font-bold mb-0.5">{s.category}</div>
                    <div className="font-bold text-slate-100 text-xs">{s.granth}</div>
                    <div className="text-[11px] text-slate-300 truncate mt-0.5">{s.section}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: In-Depth Scripture Reader with Padachheda, Anvaya & Bhashyas */}
        <div className="lg:col-span-8 glass-card-gold p-6 space-y-6">
          {/* Shloka Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
            <div>
              <span className="badge-gold text-xs">{activeScripture.category}</span>
              <h3 className="text-2xl font-serif font-bold text-amber-200 mt-1">{activeScripture.granth}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{activeScripture.section}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="btn-gold text-xs py-2 px-3.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'प्रतिलिपि बनाई गई' : 'प्रतिलिपि बनाएँ'}</span>
              </button>
            </div>
          </div>

          {/* Sanskrit Devanagari Shloka */}
          <div className="p-6 rounded-3xl bg-slate-950/90 border border-amber-500/30 text-center shadow-xl">
            <pre className="font-sanskrit text-lg md:text-xl text-amber-100 whitespace-pre-line leading-loose tracking-wide">
              {activeScripture.shlokaDevanagari}
            </pre>
            <div className="mt-3 pt-3 border-t border-white/5 font-mono text-xs text-slate-400 italic">
              {activeScripture.shlokaIAST}
            </div>
          </div>

          {/* Padachheda (Word-by-Word Analysis) */}
          <div className="glass-card p-5">
            <h4 className="font-serif text-sm font-bold text-amber-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>पदच्छेद एवं शब्दार्थ (Word-by-Word Morphological Parsing)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {activeScripture.padachheda?.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-sanskrit text-amber-200 font-bold">{p.word}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{p.meaning}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Anvaya (Syntactic Prose Ordering) */}
          {activeScripture.anvaya && (
            <div className="glass-card p-5">
              <h4 className="font-serif text-sm font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>अन्वय (श्लोक का व्याकरणिक गद्य क्रम)</span>
              </h4>
              <p className="font-sanskrit text-sm text-cyan-100 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20">
                {activeScripture.anvaya}
              </p>
            </div>
          )}

          {/* Hindi Translation */}
          <div className="glass-card p-5 border-l-4 border-amber-400">
            <h4 className="font-serif text-sm font-bold text-amber-300 mb-1">प्रामाणिक हिन्दी अनुवाद:</h4>
            <p className="text-slate-100 text-sm leading-relaxed font-sans">{activeScripture.translationHindi}</p>
          </div>

          {/* 3-Acharya Bhashyas (Commentaries) */}
          {activeScripture.bhashyas && (
            <div className="glass-card p-6">
              <h4 className="font-serif text-sm font-bold text-amber-300 mb-3">
                त्रिविध आचार्य भाष्य (Comparative Vedanta Bhashyas)
              </h4>

              <div className="flex gap-2 border-b border-amber-500/20 pb-2 mb-4">
                <button
                  onClick={() => setActiveBhashyaTab('advaita')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeBhashyaTab === 'advaita'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  अद्वैत भाष्य (शंकराचार्य)
                </button>
                <button
                  onClick={() => setActiveBhashyaTab('vishishtadvaita')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeBhashyaTab === 'vishishtadvaita'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  विशिष्टाद्वैत भाष्य (रामानुजाचार्य)
                </button>
                <button
                  onClick={() => setActiveBhashyaTab('dvaita')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeBhashyaTab === 'dvaita'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  द्वैत भाष्य (मध्वाचार्य)
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                <strong className="text-amber-400 block font-bold mb-1">
                  {activeScripture.bhashyas[activeBhashyaTab]?.acharya}:
                </strong>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {activeScripture.bhashyas[activeBhashyaTab]?.text}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
