import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Compass, ShieldAlert, Award, RefreshCw, Sun, Moon, Calendar, HeartHandshake, CheckCircle2, User } from 'lucide-react';
import { computePlanetaryPositions, computePanchang } from '../../services/ephemerisEngine';
import { audioService } from '../../services/audioService';

export default function KundaliView({ onBack }) {
  const [formData, setFormData] = useState({
    name: 'राहुल शर्मा',
    dob: '1998-08-15',
    time: '08:30',
    place: 'नई दिल्ली (New Delhi)'
  });

  const [isGenerated, setIsGenerated] = useState(true);
  const [chartType, setChartType] = useState('north'); // 'north' or 'south'

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) return;
    audioService.playTempleBell(528, 1.5);
    setIsGenerated(true);
  };

  const planets = computePlanetaryPositions();
  const lagna = planets[0]; // Ascendant
  const moon = planets[2]; // Moon
  const sun = planets[1]; // Sun

  // Group planets by House for North Indian Chart
  const housePlanets = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];
  planets.forEach(p => {
    if (p.house >= 1 && p.house <= 12) {
      const shortName = p.sanskrit ? p.sanskrit.split(' ')[0] : p.name.split(' ')[0];
      housePlanets[p.house].push({ name: shortName, fullName: p.name, isRetro: p.isRetro });
    }
  });

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

        <span className="badge-gold font-bold text-xs">जन्म कुण्डली एवं जीवन चक्र</span>
      </div>

      {/* User Input Form */}
      <div className="glass-card-gold p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="font-dharmik text-xl sm:text-2xl font-bold text-amber-200 flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-400" />
            <span>जन्म कुण्डली निर्माण यन्त्र</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
            अपना नाम, जन्म तिथि, समय एवं स्थान दर्ज करके अपनी सम्पूर्ण जन्म कुण्डली, ग्रह स्थिति, दोष एवं जीवन चक्र विश्लेषण प्राप्त करें।
          </p>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">आपका नाम (Name)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="उदा. राहुल शर्मा"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">जन्म दिनांक (DOB)</label>
            <input
              type="date"
              required
              value={formData.dob}
              onChange={e => setFormData({ ...formData, dob: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">जन्म समय (Time)</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">जन्म स्थान (Place of Birth)</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.place}
                onChange={e => setFormData({ ...formData, place: e.target.value })}
                placeholder="उदा. वाराणसी, दिल्ली"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans"
              />
              <button
                type="submit"
                className="btn-gold text-xs py-2 px-4 shrink-0"
              >
                <span>कुण्डली देखें</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Generated Kundali Report */}
      {isGenerated && (
        <div className="space-y-6 animate-fade-in">
          {/* User Profile Summary Banner */}
          <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4 border-l-4 border-amber-400">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 font-bold text-xl">
                👤
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-200">{formData.name} की जन्म पत्रिका</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  जन्म: {formData.dob} | समय: {formData.time} | स्थान: {formData.place}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <span className="text-slate-400">लग्न राशि: </span>
                <strong className="text-amber-300">{lagna.signSanskrit}</strong>
              </div>
              <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                <span className="text-slate-400">चन्द्र राशि: </span>
                <strong className="text-cyan-300">{moon.signSanskrit}</strong>
              </div>
              <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <span className="text-slate-400">जन्म नक्षत्र: </span>
                <strong className="text-emerald-300">{moon.nakshatra} (पाद {moon.pada})</strong>
              </div>
            </div>
          </div>

          {/* Interactive Chart & Planetary Positions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart SVG */}
            <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between items-center">
              <div className="flex items-center justify-between w-full mb-4">
                <h4 className="font-dharmik text-base font-bold text-amber-200">
                  लग्न कुण्डली चक्र ({chartType === 'north' ? 'उत्तर भारतीय प्रारूप' : 'दक्षिण भारतीय प्रारूप'})
                </h4>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-amber-500/20 text-xs">
                  <button
                    onClick={() => setChartType('north')}
                    className={`px-3 py-1 rounded-lg ${chartType === 'north' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    उत्तर
                  </button>
                  <button
                    onClick={() => setChartType('south')}
                    className={`px-3 py-1 rounded-lg ${chartType === 'south' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    दक्षिण
                  </button>
                </div>
              </div>

              {/* North Indian Diamond Chart SVG */}
              <div className="relative aspect-square max-w-[380px] w-full bg-[#0B0C16] rounded-2xl p-4 border border-amber-500/30 shadow-2xl flex items-center justify-center">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <rect x="10" y="10" width="380" height="380" fill="none" stroke="#F3BA2F" strokeWidth="2.5" />
                  <line x1="10" y1="10" x2="390" y2="390" stroke="#F3BA2F" strokeWidth="1.5" />
                  <line x1="10" y1="390" x2="390" y2="10" stroke="#F3BA2F" strokeWidth="1.5" />
                  <polygon points="200,10 390,200 200,390 10,200" fill="rgba(243, 186, 47, 0.05)" stroke="#F3BA2F" strokeWidth="2" />

                  <text x="200" y="55" fill="#FDE047" fontSize="12" fontWeight="bold" textAnchor="middle">प्रथम भाव (लग्न)</text>
                  <text x="200" y="85" fill="#E2E8F0" fontSize="11" textAnchor="middle">{housePlanets[1]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="110" y="55" fill="#94A3B8" fontSize="10" textAnchor="middle">२. धन</text>
                  <text x="110" y="75" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[2]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="45" y="110" fill="#94A3B8" fontSize="10" textAnchor="middle">३. पराक्रम</text>
                  <text x="45" y="135" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[3]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="85" y="200" fill="#FDE047" fontSize="12" fontWeight="bold" textAnchor="middle">४. सुख भाव</text>
                  <text x="85" y="225" fill="#E2E8F0" fontSize="11" textAnchor="middle">{housePlanets[4]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="45" y="290" fill="#94A3B8" fontSize="10" textAnchor="middle">५. सन्तान</text>
                  <text x="45" y="315" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[5]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="110" y="355" fill="#94A3B8" fontSize="10" textAnchor="middle">६. रोग/शत्रु</text>
                  <text x="110" y="375" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[6]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="200" y="335" fill="#FDE047" fontSize="12" fontWeight="bold" textAnchor="middle">७. विवाह भाव</text>
                  <text x="200" y="360" fill="#E2E8F0" fontSize="11" textAnchor="middle">{housePlanets[7]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="290" y="355" fill="#94A3B8" fontSize="10" textAnchor="middle">८. आयु</text>
                  <text x="290" y="375" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[8]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="355" y="290" fill="#94A3B8" fontSize="10" textAnchor="middle">९. भाग्य भाव</text>
                  <text x="355" y="315" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[9]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="315" y="200" fill="#FDE047" fontSize="12" fontWeight="bold" textAnchor="middle">१०. कर्म भाव</text>
                  <text x="315" y="225" fill="#E2E8F0" fontSize="11" textAnchor="middle">{housePlanets[10]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="355" y="110" fill="#94A3B8" fontSize="10" textAnchor="middle">११. लाभ</text>
                  <text x="355" y="135" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[11]?.map(p => p.name).join(' ') || '-'}</text>

                  <text x="290" y="55" fill="#94A3B8" fontSize="10" textAnchor="middle">१२. व्यय</text>
                  <text x="290" y="75" fill="#E2E8F0" fontSize="10" textAnchor="middle">{housePlanets[12]?.map(p => p.name).join(' ') || '-'}</text>
                </svg>
              </div>
            </div>

            {/* Dosh Analysis & Planetary Table */}
            <div className="lg:col-span-6 space-y-4">
              {/* Dosh Evaluation Card */}
              <div className="glass-card p-5 space-y-3">
                <h4 className="font-dharmik text-base font-bold text-amber-200 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <span>दोष एवं ग्रह स्थिति परीक्षण (Dosh Analysis)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">मांगलिक (कुज) दोष</span>
                      <span className="text-emerald-400 font-bold">✓ दोष मुक्त</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">मंगल ग्रह शुभ भाव में होने से मांगलिक दोष नहीं है।</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">कालसर्प दोष</span>
                      <span className="text-emerald-400 font-bold">✓ दोष मुक्त</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">राहु-केतु अक्ष के बाहर ग्रह होने से कुण्डली निर्दोष है।</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">शनि साढ़े साती / ढैय्या</span>
                      <span className="text-amber-300 font-bold">मध्यम प्रभाव</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">शनि की ढैय्या चल रही है, शनिवार को दीपदान शुभ रहेगा।</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">पितृ दोष</span>
                      <span className="text-emerald-400 font-bold">✓ सामान्य</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">सूर्य देव पर शुभ ग्रहों की दृष्टि होने से पितृ दोष नहीं है।</p>
                  </div>
                </div>
              </div>

              {/* Life Predictions: Safalta Kab Milegi */}
              <div className="glass-card p-5 border-t-4 border-amber-500 space-y-3">
                <h4 className="font-dharmik text-base font-bold text-amber-300 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>सफलता एवं जीवन चक्र फलकथन (Predictions)</span>
                </h4>

                <div className="space-y-2.5 text-xs text-slate-200">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-amber-300 block mb-0.5">💼 करियर एवं सफलता कब मिलेगी:</strong>
                    <p className="leading-relaxed">
                      दशमेश (कर्म भाव स्वामी) एवं गुरु की शुभ दृष्टि के अनुसार, <strong>२६वें वर्ष से ३२वें वर्ष</strong> के मध्य आजीविका व व्यापार में विशेष सफलता के योग हैं। वर्तमान समय में किए गए प्रयास आने वाले समय में बड़ा फल देंगे।
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-cyan-300 block mb-0.5">💰 धन एवं आर्थिक स्थिति:</strong>
                    <p className="leading-relaxed">
                      द्वितीय (धन) एवं एकादश (लाभ) भाव में शुभ ग्रहों की युति से धन आगमन निरन्तर रहेगा। संचय की प्रवृत्ति आपके लिए विशेष फलदायी होगी।
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-emerald-300 block mb-0.5">🪔 वैदिक शान्ति एवं उन्नति उपाय:</strong>
                    <p className="leading-relaxed">
                      नित्य प्रातः सूर्य देव को ताम्बे के लोटे से अर्घ्य दें, गायत्री मन्त्र की १ माला जपें, तथा गुरुवार को पीले फल या चने की दाल का दान करें।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
