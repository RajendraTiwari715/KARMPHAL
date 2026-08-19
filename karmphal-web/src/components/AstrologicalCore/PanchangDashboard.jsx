import React, { useState } from 'react';
import { Sun, Moon, Sparkles, Clock, Compass, Calendar, RefreshCw, Star, Info } from 'lucide-react';
import { computePlanetaryPositions, computePanchang, computeVimshottariDasha } from '../../services/ephemerisEngine';
import { audioService } from '../../services/audioService';
import { languageService } from '../../services/languageService';

export default function PanchangDashboard({ panchangData, setPanchangData }) {
  const t = languageService.t();
  const [chartType, setChartType] = useState('north'); // 'north' or 'south'
  const [selectedVarga, setSelectedVarga] = useState('D1'); // 'D1', 'D9', 'D10', 'D60'
  const [dob, setDob] = useState('1998-05-15T08:30');
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.2090);
  const [activeDashaTab, setActiveDashaTab] = useState(0);

  const handleRecalculate = () => {
    audioService.playTempleBell(432, 1.0);
    const dateObj = new Date(dob);
    const updated = computePanchang(dateObj, Number(lat), Number(lon));
    setPanchangData(updated);
  };

  const planets = panchangData?.planets || computePlanetaryPositions();
  const moon = planets.find(p => p.name.includes('Moon')) || planets[2];
  const dashaData = computeVimshottariDasha(new Date(dob), moon.longitude);

  // Group planets by House for North/South Indian Kundali Chart
  const housePlanets = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];
  planets.forEach(p => {
    if (p.house >= 1 && p.house <= 12) {
      const shortName = p.sanskrit ? p.sanskrit.split(' ')[0] : p.name.split(' ')[0];
      housePlanets[p.house].push({ name: shortName, fullName: p.name, deg: p.degreeInSign, isRetro: p.isRetro });
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Astrological Engine Specs */}
      <div className="glass-card-gold p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <span className="text-[180px] font-sanskrit">ॐ</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">दृक गणित प्रत्यक्ष खगोल विज्ञान</span>
              <span className="badge-saffron">लाहिड़ी (चित्रा पक्ष) अयनांश</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-amber-200">
              दैनिक पञ्चाङ्ग स्तम्भ एवं कुण्डली चक्र
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              उच्च परिशुद्धता दृक गणितीय गणना (λ_sidereal = λ_tropical - Δ_Lahiri), भाव-लग्न, षोडशवर्ग चक्र एवं ५-स्तरीय विंशोत्तरी महादशा।
            </p>
          </div>

          {/* Date-Time & Coordinate Inputs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-3 rounded-2xl border border-amber-500/30">
            <div>
              <label className="text-[10px] text-amber-300 block font-bold mb-0.5">जन्म दिनांक एवं समय</label>
              <input
                type="datetime-local"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-amber-100 px-2 py-1.5 rounded-xl outline-none focus:border-amber-400 font-sans"
              />
            </div>
            <div>
              <label className="text-[10px] text-amber-300 block font-bold mb-0.5">अक्षांश, रेखांश (स्थान)</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.01"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  className="w-16 bg-slate-900 border border-slate-700 text-xs text-amber-100 px-1.5 py-1.5 rounded-xl"
                  placeholder="अक्षांश"
                />
                <input
                  type="number"
                  step="0.01"
                  value={lon}
                  onChange={e => setLon(e.target.value)}
                  className="w-16 bg-slate-900 border border-slate-700 text-xs text-amber-100 px-1.5 py-1.5 rounded-xl"
                  placeholder="देशान्तर"
                />
              </div>
            </div>
            <button
              onClick={handleRecalculate}
              className="btn-gold self-end text-xs py-2 px-4"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.calculate}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Panchang Pillars Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Tithi */}
        <div className="glass-card p-4 border-l-4 border-amber-400">
          <div className="flex items-center justify-between text-amber-300 text-xs font-bold mb-1">
            <span>{t.tithi}</span>
            <Moon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchangData?.tithi?.name}</div>
          <div className="text-xs text-amber-200/80 mt-1">
            {panchangData?.tithi?.paksha} • चन्द्र-सूर्य अन्तर कोण {(planets[2].longitude - planets[1].longitude + 360) % 360 | 0}°
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            सूत्र: ⌊(λ_M - λ_S mod 360°) / 12°⌋ + 1
          </div>
        </div>

        {/* 2. Nakshatra */}
        <div className="glass-card p-4 border-l-4 border-cyan-400">
          <div className="flex items-center justify-between text-cyan-300 text-xs font-bold mb-1">
            <span>{t.nakshatra}</span>
            <Star className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchangData?.nakshatra?.name}</div>
          <div className="text-xs text-cyan-200/80 mt-1">
            पाद {panchangData?.nakshatra?.pada} • स्वामी: <strong className="text-cyan-300">{panchangData?.nakshatra?.lord}</strong>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            अधिष्ठाता देवता: {panchangData?.nakshatra?.deity} (१३°२०' चाप)
          </div>
        </div>

        {/* 3. Yoga */}
        <div className="glass-card p-4 border-l-4 border-emerald-400">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold mb-1">
            <span>{t.yoga}</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchangData?.yoga?.name}</div>
          <div className="text-xs text-emerald-200/80 mt-1">
            योग #{panchangData?.yoga?.index} (२७ यौगिक स्थिति)
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            सूत्र: ⌊(λ_S + λ_M mod 360°) / 13°20'⌋ + 1
          </div>
        </div>

        {/* 4. Karana */}
        <div className="glass-card p-4 border-l-4 border-purple-400">
          <div className="flex items-center justify-between text-purple-300 text-xs font-bold mb-1">
            <span>{t.karana}</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchangData?.karana?.name}</div>
          <div className="text-xs text-purple-200/80 mt-1">
            अर्ध-तिथि क्रम #{panchangData?.karana?.number} (६° विस्तार)
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            कर्म आरम्भ व कार्य सिद्धि नियामक
          </div>
        </div>

        {/* 5. Vara */}
        <div className="glass-card p-4 border-l-4 border-orange-400">
          <div className="flex items-center justify-between text-orange-300 text-xs font-bold mb-1">
            <span>{t.vara}</span>
            <Sun className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">{panchangData?.vara?.name.split(' ')[0]}</div>
          <div className="text-xs text-orange-200/80 mt-1">
            अधिष्ठाता ग्रह: <strong className="text-orange-300">{panchangData?.vara?.deity}</strong>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            सूर्योदय से अगले सूर्योदय पर्यन्त
          </div>
        </div>
      </div>

      {/* Muhurta Windows Banner */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-serif font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>शुभ एवं अशुभ मुहूर्त काल (स्थानीय सूर्योदय-सूर्यास्त विभाजन)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-emerald-500/20">
            <span className="text-emerald-400 font-bold block">{t.brahmaMuhurta}</span>
            <span className="text-slate-200 font-mono text-sm font-bold mt-1 block">
              {panchangData?.muhurtas?.brahmaMuhurta}
            </span>
            <span className="text-[10px] text-slate-400">सूर्योदय से ९६ से ४८ मिनट पूर्व</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-amber-500/20">
            <span className="text-amber-400 font-bold block">{t.abhijitMuhurta}</span>
            <span className="text-slate-200 font-mono text-sm font-bold mt-1 block">
              {panchangData?.muhurtas?.abhijit}
            </span>
            <span className="text-[10px] text-slate-400">सर्वकार्य सिद्धिदायक परम शुभ काल</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-rose-500/20">
            <span className="text-rose-400 font-bold block">{t.rahuKalam}</span>
            <span className="text-slate-200 font-mono text-sm font-bold mt-1 block">
              {panchangData?.muhurtas?.rahuKalam}
            </span>
            <span className="text-[10px] text-slate-400">नये कार्य व यात्रा वर्जित</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-cyan-500/20">
            <span className="text-cyan-400 font-bold block">खगोलीय सूर्योदय व सूर्यास्त</span>
            <div className="flex justify-between text-slate-200 font-mono text-xs mt-1">
              <span>🌅 {panchangData?.muhurtas?.sunrise}</span>
              <span>🌇 {panchangData?.muhurtas?.sunset}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">स्थानीय अक्षांश-देशान्तर पर आधारित</span>
          </div>
        </div>
      </div>

      {/* Interactive Kundali Chart & Planetary Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Kundali Chart SVG */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>जन्म कुण्डली चक्र ({selectedVarga})</span>
              </h3>
              <p className="text-xs text-slate-400">भाव-लग्न, दृष्टि एवं ग्रह स्थिति</p>
            </div>

            {/* Switchers */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-amber-500/20 text-xs">
                <button
                  onClick={() => setChartType('north')}
                  className={`px-3 py-1 rounded-lg transition-all ${chartType === 'north' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  उत्तर भारतीय
                </button>
                <button
                  onClick={() => setChartType('south')}
                  className={`px-3 py-1 rounded-lg transition-all ${chartType === 'south' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  दक्षिण भारतीय
                </button>
              </div>

              <select
                value={selectedVarga}
                onChange={e => setSelectedVarga(e.target.value)}
                className="bg-slate-900 border border-amber-500/30 text-amber-200 text-xs px-2 py-1 rounded-xl outline-none"
              >
                <option value="D1">D1 (लग्न राशि)</option>
                <option value="D9">D9 (नवांश चक्र)</option>
                <option value="D10">D10 (दशांश चक्र)</option>
                <option value="D60">D60 (षष्ट्यंश)</option>
              </select>
            </div>
          </div>

          {/* North Indian Diamond Chart SVG */}
          {chartType === 'north' ? (
            <div className="relative aspect-square max-w-[420px] mx-auto w-full bg-[#0B0C16] rounded-2xl p-4 border border-amber-500/30 shadow-2xl flex items-center justify-center">
              <svg viewBox="0 0 400 400" className="w-full h-full kundali-chart-svg">
                <rect x="10" y="10" width="380" height="380" fill="none" stroke="#F3BA2F" strokeWidth="2.5" />
                <line x1="10" y1="10" x2="390" y2="390" stroke="#F3BA2F" strokeWidth="1.5" />
                <line x1="10" y1="390" x2="390" y2="10" stroke="#F3BA2F" strokeWidth="1.5" />
                <polygon points="200,10 390,200 200,390 10,200" fill="rgba(243, 186, 47, 0.04)" stroke="#F3BA2F" strokeWidth="2" />

                <text x="200" y="55" fill="#FDE047" fontSize="12" fontWeight="bold" textAnchor="middle">प्रथम भाव (लग्न)</text>
                <text x="200" y="85" fill="#E2E8F0" fontSize="11" textAnchor="middle">{housePlanets[1]?.map(p => `${p.name}${p.isRetro ? '(व)' : ''}`).join(' ') || '-'}</text>

                <text x="110" y="45" fill="#94A3B8" fontSize="11" textAnchor="middle">द्वितीय</text>
                <text x="110" y="70" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[2]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="45" y="110" fill="#94A3B8" fontSize="11" textAnchor="middle">तृतीय</text>
                <text x="45" y="135" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[3]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="85" y="200" fill="#FDE047" fontSize="12" fontWeight="bold" textAnchor="middle">चतुर्थ भाव</text>
                <text x="85" y="225" fill="#E2E8F0" fontSize="11" textAnchor="middle">{housePlanets[4]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="45" y="290" fill="#94A3B8" fontSize="11" textAnchor="middle">पञ्चम</text>
                <text x="45" y="315" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[5]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="110" y="355" fill="#94A3B8" fontSize="11" textAnchor="middle">षष्ठ</text>
                <text x="110" y="375" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[6]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="200" y="335" fill="#FDE047" fontSize="12" fontWeight="bold" textAnchor="middle">सप्तम भाव</text>
                <text x="200" y="360" fill="#E2E8F0" fontSize="11" textAnchor="middle">{housePlanets[7]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="290" y="355" fill="#94A3B8" fontSize="11" textAnchor="middle">अष्टम</text>
                <text x="290" y="375" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[8]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="355" y="290" fill="#94A3B8" fontSize="11" textAnchor="middle">नवम (भाग्य)</text>
                <text x="355" y="315" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[9]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="315" y="200" fill="#FDE047" fontSize="12" fontWeight="bold" textAnchor="middle">दशम (कर्म)</text>
                <text x="315" y="225" fill="#E2E8F0" fontSize="11" textAnchor="middle">{housePlanets[10]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="355" y="110" fill="#94A3B8" fontSize="11" textAnchor="middle">एकादश (लाभ)</text>
                <text x="355" y="135" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[11]?.map(p => p.name).join(' ') || '-'}</text>

                <text x="290" y="45" fill="#94A3B8" fontSize="11" textAnchor="middle">द्वादश (व्यय)</text>
                <text x="290" y="70" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[12]?.map(p => p.name).join(' ') || '-'}</text>
              </svg>
            </div>
          ) : (
            <div className="relative aspect-square max-w-[420px] mx-auto w-full bg-[#0B0C16] rounded-2xl p-4 border border-amber-500/30 shadow-2xl flex items-center justify-center">
              <div className="grid grid-cols-4 grid-rows-4 w-full h-full gap-1 p-2 bg-amber-950/20 border border-amber-500/40 rounded-xl text-center text-xs">
                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">मीन (१२)</div><div className="text-slate-200">{housePlanets[12]?.map(p => p.name).join(' ') || '-'}</div></div>
                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">मेष (१)</div><div className="text-slate-200">{housePlanets[1]?.map(p => p.name).join(' ') || '-'}</div></div>
                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">वृषभ (२)</div><div className="text-slate-200">{housePlanets[2]?.map(p => p.name).join(' ') || '-'}</div></div>
                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">मिथुन (३)</div><div className="text-slate-200">{housePlanets[3]?.map(p => p.name).join(' ') || '-'}</div></div>

                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">कुम्भ (११)</div><div className="text-slate-200">{housePlanets[11]?.map(p => p.name).join(' ') || '-'}</div></div>
                <div className="col-span-2 row-span-2 border border-dashed border-amber-500/20 flex flex-col items-center justify-center p-2"><span className="font-serif text-sm font-bold text-amber-300">दक्षिण भारतीय कुण्डली</span><span className="text-[10px] text-slate-400 mt-1">स्थिर राशि प्रारूप</span></div>
                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">कर्क (४)</div><div className="text-slate-200">{housePlanets[4]?.map(p => p.name).join(' ') || '-'}</div></div>

                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">मकर (१०)</div><div className="text-slate-200">{housePlanets[10]?.map(p => p.name).join(' ') || '-'}</div></div>
                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">सिंह (५)</div><div className="text-slate-200">{housePlanets[5]?.map(p => p.name).join(' ') || '-'}</div></div>

                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">धनु (९)</div><div className="text-slate-200">{housePlanets[9]?.map(p => p.name).join(' ') || '-'}</div></div>
                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">वृश्चिक (८)</div><div className="text-slate-200">{housePlanets[8]?.map(p => p.name).join(' ') || '-'}</div></div>
                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">तुला (७)</div><div className="text-slate-200">{housePlanets[7]?.map(p => p.name).join(' ') || '-'}</div></div>
                <div className="border border-amber-500/30 p-1 rounded bg-slate-900/80"><div className="text-[10px] text-amber-400">कन्या (६)</div><div className="text-slate-200">{housePlanets[6]?.map(p => p.name).join(' ') || '-'}</div></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Planetary Positions Table */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-200 mb-1 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <span>ग्रह स्थिति एवं नक्षत्र पाद विवरण</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              प्रत्यक्ष अयनांश-युक्त भोगांश, भाव, नक्षत्र पाद एवं D9 नवांश स्थिति।
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-amber-500/20 text-amber-300 font-bold text-[11px]">
                    <th className="py-2 px-1.5">ग्रह</th>
                    <th className="py-2 px-1.5">राशि व भाव</th>
                    <th className="py-2 px-1.5">अंश (° ' ")</th>
                    <th className="py-2 px-1.5">नक्षत्र (पाद)</th>
                    <th className="py-2 px-1.5">D9 नवांश</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {planets.map((p, idx) => (
                    <tr key={idx} className="hover:bg-amber-500/5 transition-colors">
                      <td className="py-2 px-1.5 font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{p.sanskrit || p.name}</span>
                        {p.isRetro && (
                          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-500/40 px-1 rounded font-bold">
                            व
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-1.5 text-slate-300">
                        <span className="text-amber-200">{p.signSanskrit || p.signName}</span> (भाव {p.house})
                      </td>
                      <td className="py-2 px-1.5 font-mono text-slate-200">{p.degreeInSign}°</td>
                      <td className="py-2 px-1.5 text-cyan-200">
                        {p.nakshatra} <span className="text-slate-400 text-[10px]">({p.pada})</span>
                      </td>
                      <td className="py-2 px-1.5 text-amber-300">{p.navamshaSanskrit || p.navamshaSign}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-950/25 border border-amber-500/25 rounded-2xl text-xs text-amber-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              आपका लग्न <strong>{planets[0]?.signSanskrit}</strong> है। चन्द्रमा <strong>{moon.nakshatra}</strong> में होने से जन्म महादशा स्वामी <strong>{moon.nakshatraLord}</strong> हैं।
            </span>
          </div>
        </div>
      </div>

      {/* 5-Level Vimshottari Dasha Progression */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>५-स्तरीय विंशोत्तरी महादशा चक्र (१२० वर्षीय कालखण्ड)</span>
            </h3>
            <p className="text-xs text-slate-400">
              जन्म महादशा स्वामी: <strong className="text-amber-300">{dashaData.startingLord}</strong> (जन्म समय भुक्त-भोग्य अवशेष: {dashaData.balanceYears} वर्ष)।
            </p>
          </div>
          <span className="badge-gold text-xs">महादशा ➔ अन्तर्दशा ➔ प्रत्यन्तर्दशा</span>
        </div>

        {/* Mahadasha Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {dashaData.dashaTimeline.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveDashaTab(idx);
                audioService.playBeadClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex flex-col items-start ${
                activeDashaTab === idx
                  ? 'bg-amber-500/25 border border-amber-500 text-amber-200 font-bold shadow-lg'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span>{item.lord.split(' ')[0]}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">{item.years} वर्ष ({item.startDate})</span>
            </button>
          ))}
        </div>

        {/* Sub-Antardashas Table */}
        <div className="mt-4 bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs mb-3 text-amber-300 font-bold">
            <span>
              {dashaData.dashaTimeline[activeDashaTab]?.lord} महादशा अन्तर्गत प्रत्यन्तर्दशा विवरण ({dashaData.dashaTimeline[activeDashaTab]?.startDate} से {dashaData.dashaTimeline[activeDashaTab]?.endDate})
            </span>
            <span className="text-slate-400">सूत्र: (महावर्ष × उपवर्ष) / १२०</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {dashaData.dashaTimeline[activeDashaTab]?.antardashas?.map((sub, sIdx) => (
              <div key={sIdx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">{sub.lord}</span>
                  <span className="text-[10px] text-slate-400">{sub.start} ➔ {sub.end}</span>
                </div>
                <span className="text-[11px] font-mono text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/20">
                  {sub.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
