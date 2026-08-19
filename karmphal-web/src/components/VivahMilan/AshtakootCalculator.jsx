import React, { useState } from 'react';
import { HeartHandshake, CheckCircle2, AlertTriangle, XCircle, Sparkles, ShieldAlert, Award } from 'lucide-react';
import { calculateAshtakoot } from '../../services/ashtakootEngine';
import { NAKSHATRAS, ZODIAC_SIGNS } from '../../services/ephemerisEngine';
import { audioService } from '../../services/audioService';

export default function AshtakootCalculator() {
  const [groomData, setGroomData] = useState({
    nakshatraId: 4, // रोहिणी
    pada: 2,
    rashiId: 2, // वृषभ
    marsHouse: 1 // प्रथम भाव
  });

  const [brideData, setBrideData] = useState({
    nakshatraId: 13, // हस्त
    pada: 1,
    rashiId: 6, // कन्या
    marsHouse: 7
  });

  const [result, setResult] = useState(() => calculateAshtakoot(groomData, brideData));

  const handleMatch = () => {
    audioService.playTempleBell(528, 1.5);
    const res = calculateAshtakoot(groomData, brideData);
    setResult(res);
  };

  const getScoreColor = (score, max) => {
    const ratio = score / max;
    if (ratio >= 0.75) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (ratio >= 0.5) return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card-gold p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">३६ गुण अष्टकूट विवाह मिलन</span>
              <span className="badge-saffron">दोष परिहार (Parihara) एवं कुज दोष विश्लेषण</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-amber-400" />
              <span>अष्टकूट विवाह गुण मिलन एवं मांगलिक विचार</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट एवं नाड़ी—इन ८ आयामों पर आधारित चन्द्र राशि एवं नक्षत्र अनुकूलता परीक्षण तथा शास्त्रोक्त परिहार नियम।
            </p>
          </div>

          <button onClick={handleMatch} className="btn-gold">
            <Sparkles className="w-4 h-4" />
            <span>गुण मिलन गणना करें</span>
          </button>
        </div>
      </div>

      {/* Groom & Bride Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groom Profile */}
        <div className="glass-card p-5 border-t-4 border-blue-500">
          <h3 className="font-serif text-base font-bold text-blue-300 mb-3 flex items-center justify-between">
            <span>वर का जन्म विवरण (Groom Details)</span>
            <span className="text-xs bg-blue-950/80 px-2.5 py-0.5 rounded-full text-blue-200 border border-blue-500/30 font-bold">वर</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">चन्द्र नक्षत्र</label>
              <select
                value={groomData.nakshatraId}
                onChange={e => setGroomData({ ...groomData, nakshatraId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-blue-400 font-sans"
              >
                {NAKSHATRAS.map(n => (
                  <option key={n.id} value={n.id}>{n.id}. {n.name} (स्वामी: {n.lord})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">नक्षत्र पाद (१-४)</label>
              <select
                value={groomData.pada}
                onChange={e => setGroomData({ ...groomData, pada: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-blue-400 font-sans"
              >
                <option value={1}>प्रथम पाद</option>
                <option value={2}>द्वितीय पाद</option>
                <option value={3}>तृतीय पाद</option>
                <option value={4}>चतुर्थ पाद</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">जन्म चन्द्र राशि</label>
              <select
                value={groomData.rashiId}
                onChange={e => setGroomData({ ...groomData, rashiId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-blue-400 font-sans"
              >
                {ZODIAC_SIGNS.map(z => (
                  <option key={z.id} value={z.id}>{z.id}. {z.sanskrit} ({z.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">मंगल स्थिति (मांगलिक भाव)</label>
              <select
                value={groomData.marsHouse}
                onChange={e => setGroomData({ ...groomData, marsHouse: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-blue-400 font-sans"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>भाव {i + 1} {[1, 2, 4, 7, 8, 12].includes(i + 1) ? '(मांगलिक स्थान)' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bride Profile */}
        <div className="glass-card p-5 border-t-4 border-rose-500">
          <h3 className="font-serif text-base font-bold text-rose-300 mb-3 flex items-center justify-between">
            <span>कन्या का जन्म विवरण (Bride Details)</span>
            <span className="text-xs bg-rose-950/80 px-2.5 py-0.5 rounded-full text-rose-200 border border-rose-500/30 font-bold">कन्या</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">चन्द्र नक्षत्र</label>
              <select
                value={brideData.nakshatraId}
                onChange={e => setBrideData({ ...brideData, nakshatraId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-rose-400 font-sans"
              >
                {NAKSHATRAS.map(n => (
                  <option key={n.id} value={n.id}>{n.id}. {n.name} (स्वामी: {n.lord})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">नक्षत्र पाद (१-४)</label>
              <select
                value={brideData.pada}
                onChange={e => setBrideData({ ...brideData, pada: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-rose-400 font-sans"
              >
                <option value={1}>प्रथम पाद</option>
                <option value={2}>द्वितीय पाद</option>
                <option value={3}>तृतीय पाद</option>
                <option value={4}>चतुर्थ पाद</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">जन्म चन्द्र राशि</label>
              <select
                value={brideData.rashiId}
                onChange={e => setBrideData({ ...brideData, rashiId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-rose-400 font-sans"
              >
                {ZODIAC_SIGNS.map(z => (
                  <option key={z.id} value={z.id}>{z.id}. {z.sanskrit} ({z.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">मंगल स्थिति (मांगलिक भाव)</label>
              <select
                value={brideData.marsHouse}
                onChange={e => setBrideData({ ...brideData, marsHouse: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-rose-400 font-sans"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>भाव {i + 1} {[1, 2, 4, 7, 8, 12].includes(i + 1) ? '(मांगलिक स्थान)' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="glass-card-gold p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-28 h-28 rounded-full bg-slate-950 border-4 border-amber-500 flex flex-col items-center justify-center shadow-xl shadow-amber-500/20">
            <span className="text-3xl font-black text-amber-300 font-mono">{result.totalScore}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">/ ३६ गुण</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${result.isStrong ? 'text-emerald-400' : result.isViable ? 'text-amber-400' : 'text-rose-400'}`}>
                {result.totalScore >= 28 ? 'उत्तम मिलन (अत्यन्त शुभ)' : result.totalScore >= 18 ? 'मध्यम मिलन (स्वीकार्य)' : 'अधम मिलन (दोषयुक्त)'}
              </span>
              {result.isViable ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              {result.totalScore >= 24 
                ? 'वैवाहिक जीवन हेतु अत्यन्त शुभ व सामञ्जस्यपूर्ण मिलन। मानसिक शान्ति, सन्तान सुख एवं वंश वृद्धि के श्रेष्ठ योग हैं।'
                : result.totalScore >= 18
                ? 'शास्त्र सम्मत १८ गुणों से अधिक प्राप्त। साधारण दोष निवारण उपाय के उपरान्त सम्बन्ध स्वीकार्य है।'
                : '१८ से कम गुण प्राप्त। नाड़ी या भकूट दोष की सूक्ष्म जाँच तथा नवमांश कुण्डली मिलान अनिवार्य है।'}
            </p>
          </div>
        </div>

        {/* Manglik Status Box */}
        <div className="w-full md:w-auto bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>मांगलिक (कुज) दोष स्थिति</span>
          </div>
          <p className="text-slate-200 text-[11px] max-w-xs">{result.manglik.status}</p>
        </div>
      </div>

      {/* 8 Kootas Breakdown */}
      <div className="glass-card p-6">
        <h3 className="font-serif text-lg font-bold text-amber-200 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>८ अष्टकूट विस्तृत प्राप्ताङ्क विवरण</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {result.kootas.map((koota, idx) => (
            <div key={idx} className={`p-3.5 rounded-2xl border ${getScoreColor(koota.obtained, koota.max)} transition-all`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-100">{idx + 1}. {koota.name} कूट</span>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-950/60 border border-current">
                  {koota.obtained} / {koota.max}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">{koota.desc}</p>
              {koota.cancelled && (
                <div className="mt-2 text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>दोष परिहार नियम लागू (दोष मुक्त)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
