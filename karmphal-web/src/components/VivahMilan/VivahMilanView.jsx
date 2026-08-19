import React, { useState } from 'react';
import { HeartHandshake, CheckCircle2, XCircle, Sparkles, ShieldAlert, Award, ArrowLeft } from 'lucide-react';
import { calculateAshtakoot } from '../../services/ashtakootEngine';
import { NAKSHATRAS, ZODIAC_SIGNS } from '../../services/ephemerisEngine';
import { audioService } from '../../services/audioService';

export default function VivahMilanView({ onBack }) {
  const [groomData, setGroomData] = useState({
    name: 'अमित कुमार',
    nakshatraId: 4, // रोहिणी
    pada: 2,
    rashiId: 2, // वृषभ
    marsHouse: 1
  });

  const [brideData, setBrideData] = useState({
    name: 'पूजा शर्मा',
    nakshatraId: 13, // हस्त
    pada: 1,
    rashiId: 6, // कन्या
    marsHouse: 7
  });

  const [result, setResult] = useState(() => calculateAshtakoot(groomData, brideData));

  const handleMatch = (e) => {
    e?.preventDefault();
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

        <span className="badge-gold font-bold text-xs">३६ गुण अष्टकूट विवाह मिलन</span>
      </div>

      {/* Hero Banner */}
      <div className="glass-card-gold p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">वर-कन्या कुण्डली गुण मिलान</span>
              <span className="badge-saffron">दोष परिहार (Parihara) सहित</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-dharmik font-bold text-amber-200 flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-amber-400" />
              <span>अष्टकूट ३६ गुण विवाह मिलन यन्त्र</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
              वर एवं कन्या के नाम, जन्म नक्षत्र व राशि के आधार पर वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट एवं नाड़ी दोष का विस्तृत मिलान।
            </p>
          </div>
        </div>
      </div>

      {/* Groom & Bride Input Form */}
      <form onSubmit={handleMatch} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groom Profile */}
        <div className="glass-card p-5 sm:p-6 border-t-4 border-blue-500 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-dharmik text-base font-bold text-blue-300">
              वर का विवरण (Groom Details)
            </h3>
            <span className="badge-gold text-[10px]">वर पक्ष</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">वर का नाम (Groom Name)</label>
            <input
              type="text"
              required
              value={groomData.name}
              onChange={e => setGroomData({ ...groomData, name: e.target.value })}
              placeholder="उदा. अमित कुमार"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-blue-400 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">चन्द्र नक्षत्र</label>
              <select
                value={groomData.nakshatraId}
                onChange={e => setGroomData({ ...groomData, nakshatraId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
              >
                {NAKSHATRAS.map(n => (
                  <option key={n.id} value={n.id}>{n.id}. {n.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">नक्षत्र पाद (१-४)</label>
              <select
                value={groomData.pada}
                onChange={e => setGroomData({ ...groomData, pada: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
              >
                <option value={1}>पाद १</option>
                <option value={2}>पाद २</option>
                <option value={3}>पाद ३</option>
                <option value={4}>पाद ४</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">जन्म चन्द्र राशि</label>
              <select
                value={groomData.rashiId}
                onChange={e => setGroomData({ ...groomData, rashiId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
              >
                {ZODIAC_SIGNS.map(z => (
                  <option key={z.id} value={z.id}>{z.id}. {z.sanskrit} ({z.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">मंगल स्थिति (मांगलिक)</label>
              <select
                value={groomData.marsHouse}
                onChange={e => setGroomData({ ...groomData, marsHouse: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
              >
                {[1, 2, 4, 7, 8, 12].includes(groomData.marsHouse) ? (
                  <option value={groomData.marsHouse}>मांगलिक भाव में स्थित</option>
                ) : (
                  <option value={3}>सामान्य (अ-मांगलिक)</option>
                )}
                <option value={1}>भाव १ (मांगलिक)</option>
                <option value={4}>भाव ४ (मांगलिक)</option>
                <option value={7}>भाव ७ (मांगलिक)</option>
                <option value={8}>भाव ८ (मांगलिक)</option>
                <option value={12}>भाव १२ (मांगलिक)</option>
                <option value={3}>भाव ३ (निर्दोष)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bride Profile */}
        <div className="glass-card p-5 sm:p-6 border-t-4 border-rose-500 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-dharmik text-base font-bold text-rose-300">
              कन्या का विवरण (Bride Details)
            </h3>
            <span className="badge-saffron text-[10px]">कन्या पक्ष</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">कन्या का नाम (Bride Name)</label>
            <input
              type="text"
              required
              value={brideData.name}
              onChange={e => setBrideData({ ...brideData, name: e.target.value })}
              placeholder="उदा. पूजा शर्मा"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-rose-400 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">चन्द्र नक्षत्र</label>
              <select
                value={brideData.nakshatraId}
                onChange={e => setBrideData({ ...brideData, nakshatraId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
              >
                {NAKSHATRAS.map(n => (
                  <option key={n.id} value={n.id}>{n.id}. {n.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">नक्षत्र पाद (१-४)</label>
              <select
                value={brideData.pada}
                onChange={e => setBrideData({ ...brideData, pada: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
              >
                <option value={1}>पाद १</option>
                <option value={2}>पाद २</option>
                <option value={3}>पाद ३</option>
                <option value={4}>पाद ४</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">जन्म चन्द्र राशि</label>
              <select
                value={brideData.rashiId}
                onChange={e => setBrideData({ ...brideData, rashiId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
              >
                {ZODIAC_SIGNS.map(z => (
                  <option key={z.id} value={z.id}>{z.id}. {z.sanskrit} ({z.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">मंगल स्थिति (मांगलिक)</label>
              <select
                value={brideData.marsHouse}
                onChange={e => setBrideData({ ...brideData, marsHouse: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
              >
                {[1, 2, 4, 7, 8, 12].includes(brideData.marsHouse) ? (
                  <option value={brideData.marsHouse}>मांगलिक भाव में स्थित</option>
                ) : (
                  <option value={3}>सामान्य (अ-मांगलिक)</option>
                )}
                <option value={1}>भाव १ (मांगलिक)</option>
                <option value={4}>भाव ४ (मांगलिक)</option>
                <option value={7}>भाव ७ (मांगलिक)</option>
                <option value={8}>भाव ८ (मांगलिक)</option>
                <option value={12}>भाव १२ (मांगलिक)</option>
                <option value={3}>भाव ३ (निर्दोष)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 text-center">
          <button type="submit" className="btn-gold py-3 px-8 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>३६ गुण मिलन गणना करें</span>
          </button>
        </div>
      </form>

      {/* Match Result Output Card */}
      <div className="glass-card-gold p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950 border-4 border-amber-500 flex flex-col items-center justify-center shadow-xl shadow-amber-500/20 shrink-0">
            <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">{result.totalScore}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">/ ३६ गुण</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg sm:text-xl font-bold ${result.totalScore >= 24 ? 'text-emerald-400' : result.totalScore >= 18 ? 'text-amber-400' : 'text-rose-400'}`}>
                {result.totalScore >= 24 ? 'उत्तम मिलन (अत्यन्त शुभ)' : result.totalScore >= 18 ? 'मध्यम मिलन (स्वीकार्य)' : 'अधम मिलन (दोषयुक्त)'}
              </span>
              {result.isViable ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
            </div>
            <p className="text-xs text-slate-300 mt-1.5 max-w-md font-sans leading-relaxed">
              <strong>{groomData.name}</strong> एवं <strong>{brideData.name}</strong> के मध्य कुल {result.totalScore} गुण मिलते हैं। 
              {result.totalScore >= 18 ? ' वैवाहिक जीवन हेतु यह सम्बन्ध शास्त्र सम्मत एवं शुभ है।' : ' गुणों की संख्या कम होने के कारण कुण्डली के अन्य भावों का परीक्षण आवश्यक है।'}
            </p>
          </div>
        </div>

        {/* Manglik Status */}
        <div className="w-full md:w-auto bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>मांगलिक (कुज) दोष स्थिति</span>
          </div>
          <p className="text-slate-200 text-[11px] max-w-xs">{result.manglik.status}</p>
        </div>
      </div>

      {/* 8 Kootas Detailed Grid */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-dharmik text-base font-bold text-amber-200 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>८ अष्टकूट विस्तृत प्राप्ताङ्क विवरण</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {result.kootas.map((koota, idx) => (
            <div key={idx} className={`p-3.5 rounded-2xl border ${getScoreColor(koota.obtained, koota.max)}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-100">{idx + 1}. {koota.name} कूट</span>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-950/60 border border-current">
                  {koota.obtained} / {koota.max}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed font-sans">{koota.desc}</p>
              {koota.cancelled && (
                <div className="mt-2 text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                  <span>✓ दोष परिहार लागू</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
