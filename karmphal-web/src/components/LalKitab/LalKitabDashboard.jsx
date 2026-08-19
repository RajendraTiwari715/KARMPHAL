import React, { useState } from 'react';
import { Sparkles, Moon, Flame, ShieldCheck, Droplets, Info } from 'lucide-react';
import { analyzeLalKitab, LAL_KITAB_HOUSES } from '../../services/lalKitabEngine';
import { audioService } from '../../services/audioService';

export default function LalKitabDashboard({ panchangData }) {
  const [placements, setPlacements] = useState([
    { name: 'सूर्य (Surya)', house: 1 },
    { name: 'चन्द्र (Chandra)', house: 4 },
    { name: 'मंगल (Mangala)', house: 10 },
    { name: 'बुध (Budha)', house: 6 },
    { name: 'बृहस्पति / गुरु (Guru)', house: 9 },
    { name: 'शुक्र (Shukra)', house: 7 },
    { name: 'शनि (Shani)', house: 10 },
    { name: 'राहु (Rahu)', house: 9 },
    { name: 'केतु (Ketu)', house: 3 }
  ]);

  const analysis = analyzeLalKitab(placements);

  const handleHouseChange = (planetName, newHouse) => {
    audioService.playBeadClick();
    setPlacements(prev => prev.map(p => p.name === planetName ? { ...p, house: Number(newHouse) } : p));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card-gold p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">मेष लग्न स्थिर कुण्डली सिद्धान्त</span>
              <span className="badge-saffron">अ-रत्न शास्त्रोक्त लाल किताब उपाय</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>लाल किताब एवं मसनूई ग्रह उपाय प्रणाली</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              प्रथम भाव को सदा मेष राशि मानकर सोया घर (सुप्त भाव), मसनूई ग्रह (कृत्रिम युति), पितृ/मातृ ऋण का सूक्ष्म परीक्षण एवं जल-प्रवाह, दान व सेवा आधारित शास्त्रोक्त समाधान।
            </p>
          </div>
        </div>
      </div>

      {/* Planetary Placements Adjuster & Sleeping Houses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Fixed-House Interactive Planetary Placement */}
        <div className="lg:col-span-5 glass-card p-5">
          <h3 className="font-serif text-base font-bold text-amber-200 mb-3 flex items-center justify-between">
            <span>ग्रह भाव स्थिति (लाल किताब जन्माङ्ग)</span>
            <span className="text-[10px] text-slate-400 font-mono">भाव १ = मेष राशि</span>
          </h3>

          <div className="space-y-2 text-xs max-h-[380px] overflow-y-auto pr-1">
            {placements.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-slate-200">{p.name}</span>
                <select
                  value={p.house}
                  onChange={e => handleHouseChange(p.name, e.target.value)}
                  className="bg-slate-950 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-lg outline-none font-sans"
                >
                  {Array.from({ length: 12 }, (_, h) => (
                    <option key={h + 1} value={h + 1}>भाव {h + 1} ({LAL_KITAB_HOUSES[h].domain.split(',')[0]})</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Soya Ghar & Masnooi Grahas */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sleeping Houses (Soya Ghar) */}
          <div className="glass-card p-5">
            <h3 className="font-serif text-base font-bold text-cyan-300 mb-2 flex items-center gap-2">
              <Moon className="w-4 h-4 text-cyan-400" />
              <span>सुप्त भाव (सोया घर - Soya Ghar)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              जिस भाव में कोई ग्रह नहीं होता वह सुप्त रहता है, जो वर्षफल अथवा उस भाव के प्राकृतिक स्वामी की वस्तु दान करने पर जाग्रत होता है।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {analysis.sleepingHouses.map((sh, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/70 border border-cyan-500/20">
                  <div className="font-bold text-cyan-300">भाव {sh.house} ({sh.domain})</div>
                  <div className="text-[10px] text-slate-300 mt-1">{sh.activationTrigger}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Artificial Planetary Pairs (Masnooi Graha) */}
          <div className="glass-card p-5">
            <h3 className="font-serif text-base font-bold text-purple-300 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-purple-400" />
              <span>मसनूई ग्रह युति (कृत्रिम ग्रह प्रभाव)</span>
            </h3>
            <div className="space-y-2 text-xs">
              {analysis.detectedMasnooi.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-purple-200 block">{m.components}</span>
                    <span className="text-[11px] text-amber-300 font-bold">{m.creates}</span>
                  </div>
                  <span className="text-[10px] text-slate-300 max-w-xs">{m.implication}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Karmic Debts & Non-Gemstone Remedial Decision Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Karmic Debts Section */}
        <div className="glass-card p-6 border-t-4 border-rose-500">
          <h3 className="font-serif text-lg font-bold text-rose-300 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <span>पितृ / मातृ ऋण परीक्षण (Karmic Debts)</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            पूर्वजों के अधूरे संस्कारों से उत्पन्न जन्मकालीन दोष।
          </p>

          <div className="space-y-3 text-xs">
            {analysis.karmicDebts.map((debt, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30">
                <div className="font-bold text-rose-300 text-sm">{debt.debt}</div>
                <div className="text-amber-200 mt-1 font-semibold">{debt.affliction}</div>
                <div className="text-slate-300 text-[11px] mt-1">{debt.effect}</div>
                <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
                  <strong className="text-amber-400 block mb-0.5 font-bold">शास्त्र सम्मत लाल किताब उपाय:</strong>
                  {debt.remedy}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scriptural Non-Gemstone Remedies */}
        <div className="glass-card p-6 border-t-4 border-emerald-500">
          <h3 className="font-serif text-lg font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-emerald-400" />
            <span>जल-प्रवाह एवं सेवा आधारित उपाय (Upays)</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            बिना किसी महँगे रत्न के घरेलू वस्तुओं, दिन के समय दान और बहते जल में विसर्जन द्वारा ग्रह-शान्ति।
          </p>

          <div className="space-y-3 text-xs">
            {analysis.remedies.map((rem, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-300">{rem.type}</span>
                  <span className="badge-gold text-[10px]">प्रामाणिक उपाय</span>
                </div>
                <div className="text-slate-200 font-bold">{rem.item}</div>
                <div className="text-slate-300 text-[11px] mt-1 italic">{rem.rule}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
