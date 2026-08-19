import React, { useState } from 'react';
import { Moon, Sparkles, Search, Clock, ShieldCheck, Sun, Info, AlertTriangle } from 'lucide-react';
import { DREAM_PRAHARS, DREAM_MOTIFS, analyzeDream } from '../../services/swapnaData';
import { audioService } from '../../services/audioService';

export default function DreamAnalyzer() {
  const [dreamQuery, setDreamQuery] = useState('');
  const [selectedPrahar, setSelectedPrahar] = useState(4); // 4th Prahar default
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyze = (queryToUse = null) => {
    const q = queryToUse || dreamQuery;
    if (!q.trim()) return;

    audioService.playTempleBell(432, 1.2);
    const result = analyzeDream(q, selectedPrahar);
    setAnalysisResult(result);
  };

  const sampleDreamChips = [
    'पर्वत या मन्दिर के शिखर पर चढ़ना',
    'श्वेत गौ का दर्शन अथवा दुग्ध पान',
    'सर्प का काटना अथवा उड़ते देखना',
    'निर्मल जल की वर्षा या नदी में स्नान',
    'कीचड़ अथवा तैल में डूबना'
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card-gold p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">अग्नि पुराण (अध्याय १४) स्वप्न फल विचार</span>
              <span className="badge-saffron">बृहत्संहिता एवं चरक संहिता</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
              <Moon className="w-6 h-6 text-amber-400" />
              <span>स्वप्न शास्त्र एवं ४ प्रहर काल फल विचार</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              रात्रि के चारों प्रहरों के अनुसार स्वप्न फलित होने की समय-सीमा, शुभ-अशुभ स्वप्न प्रतीकों का शास्त्रीय रहस्योद्घाटन, तथा अशुभ स्वप्न के निवारण हेतु वैदिक शान्ति उपाय।
            </p>
          </div>
        </div>
      </div>

      {/* 4 Prahars Horizon Timing Horizon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DREAM_PRAHARS.map(prahar => {
          const isSelected = selectedPrahar === prahar.praharNumber;

          return (
            <div
              key={prahar.praharNumber}
              onClick={() => {
                audioService.playBeadClick();
                setSelectedPrahar(prahar.praharNumber);
                if (dreamQuery) handleAnalyze();
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500 shadow-lg scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-300">प्रहर #{prahar.praharNumber}</span>
                <span className="text-[10px] text-slate-400 font-mono">{prahar.timeWindow}</span>
              </div>
              <div className="font-bold text-slate-100 text-sm mt-1">{prahar.name}</div>
              <div className="text-xs text-amber-400/90 font-semibold mt-1">
                फलित काल: {prahar.fulfillmentHorizon}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                {prahar.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Dream Search & Analysis Bar */}
      <div className="glass-card p-6">
        <h3 className="font-serif text-base font-bold text-amber-200 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-400" />
          <span>अपने स्वप्न का मुख्य दृश्य या प्रतीक लिखें</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="text"
            placeholder="जैसे: पर्वत, मन्दिर, श्वेत गौ, सर्प, जल, वर्षा, उड़ना, हाथी..."
            value={dreamQuery}
            onChange={e => setDreamQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-4 py-3 rounded-xl outline-none focus:border-amber-400 font-sans"
          />
          <button
            onClick={() => handleAnalyze()}
            className="btn-gold py-3 px-6 text-xs justify-center"
          >
            <Sparkles className="w-4 h-4" />
            <span>स्वप्न फल जानें</span>
          </button>
        </div>

        {/* Preset Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {sampleDreamChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDreamQuery(chip);
                handleAnalyze(chip);
              }}
              className="px-3 py-1 rounded-xl text-[11px] whitespace-nowrap bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-slate-800 hover:border-amber-500/30 transition-all font-medium"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Result Card */}
      {analysisResult && (
        <div className="glass-card-gold p-6 border-t-4 border-amber-500 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
            <div>
              <span className={`badge-gold text-xs ${analysisResult.isShubha ? 'text-emerald-300 border-emerald-500/40' : 'text-rose-300 border-rose-500/40'}`}>
                {analysisResult.isShubha ? 'शुभ स्वप्न (कल्याणकारी)' : 'अशुभ स्वप्न (सावधानी आवश्यक)'}
              </span>
              <h3 className="text-2xl font-serif font-bold text-amber-200 mt-1">
                {analysisResult.matchedMotif.motif}
              </h3>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-500/30 text-xs text-right">
              <span className="text-slate-400 block">फल प्राप्ति समय</span>
              <span className="text-amber-300 font-bold font-mono text-sm">{analysisResult.praharHorizon}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <strong className="text-amber-300 block font-bold mb-1">शास्त्रोक्त स्वप्न फल:</strong>
              <p className="text-slate-200 text-sm leading-relaxed">{analysisResult.interpretation}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <strong className="text-cyan-300 block font-bold mb-1">शास्त्र सन्दर्भ एवं प्रमाण:</strong>
              <p className="text-slate-200 leading-relaxed">{analysisResult.matchedMotif.scripturalRef}</p>
            </div>
          </div>

          {/* Remedial Expiation for Dreams */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs">
            <strong className="text-emerald-300 block font-bold mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>शास्त्र सम्मत स्वप्न शान्ति विधान (Reversible Expiation):</span>
            </strong>
            <p className="text-emerald-100 leading-relaxed font-semibold">
              {analysisResult.remedy}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
