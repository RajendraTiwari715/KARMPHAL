import React, { useState } from 'react';
import { languageService } from '../../services/languageService';

/**
 * KundaliPrintReport - Dedicated A4 print and PDF export layout component.
 * Completely separate from the interactive web UI.
 * Standard A4 proportions: 794px x 1123px (210mm x 297mm at 96 DPI).
 */
export default function KundaliPrintReport({
  formData,
  calculatedData,
  chartType = 'north',
  doshas,
  aiReading,
  containerRef
}) {
  const currentLang = languageService.getLang();
  const isEn = currentLang === 'en';

  const [currentDateStr] = useState(() => new Date().toLocaleDateString(languageService.getLang() === 'en' ? 'en-US' : 'hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }));
  const [now] = useState(() => new Date());

  if (!formData || !calculatedData) return null;

  const planets = calculatedData.planets || [];
  const lagna = planets.length > 0 ? planets[0] : {};
  const moon = planets.find(p => p.name === 'चन्द्र') || {};
  const coords = calculatedData.coords || { lat: 28.61, lon: 77.20 };
  const dashaTimeline = calculatedData.dashaTimeline || [];

  // Group planets for North Indian chart by House (1 to 12)
  const housePlanets = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];

  // Group planets for South Indian chart by Sign (1 to 12)
  const signPlanets = {};
  for (let i = 1; i <= 12; i++) signPlanets[i] = [];

  planets.forEach(p => {
    const shortName = p.sanskrit ? p.sanskrit.split(' ')[0] : p.name.split(' ')[0];
    const isLagna = p.name === 'लग्न';

    if (p.house >= 1 && p.house <= 12) {
      housePlanets[p.house].push({ name: shortName, fullName: p.name, isRetro: p.isRetro, isLagna });
    }
    if (p.signIndex >= 1 && p.signIndex <= 12) {
      signPlanets[p.signIndex].push({ name: shortName, fullName: p.name, isRetro: p.isRetro, isLagna });
    }
  });

  const renderSouthBox = (signNum, x, y) => {
    const pList = signPlanets[signNum] || [];
    const isLagna = pList.some(p => p.isLagna);
    return (
      <g transform={`translate(${x},${y})`} key={signNum}>
        <rect width="90" height="90" fill="#FCF9F2" stroke="#9A6B32" strokeWidth="1.5" />
        <text x="8" y="16" fill="#8C5318" fontSize="10" fontWeight="bold">
          {signNum}
        </text>
        {isLagna && (
          <text x="45" y="24" fill="#9A6B32" fontSize="10" fontWeight="bold" textAnchor="middle">
            लग्न
          </text>
        )}
        <text x="45" y="55" fill="#1C1917" fontSize="11" fontWeight="bold" textAnchor="middle">
          {pList.filter(p => !p.isLagna).map(p => p.name).join(' ')}
        </text>
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      id="kundali-print-container"
      className="print-only font-['Noto_Sans_Devanagari',sans-serif] text-slate-900 bg-white"
      style={{
        width: '794px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A'
      }}
    >
      {/* ==================== A4 PAGE 1: PRIMARY CHART & SUMMARY ==================== */}
      <div
        className="page-1-a4 page-break-after"
        data-page="1"
        style={{
          width: '794px',
          minHeight: '1123px',
          padding: '28px 32px',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '3px double #C48E48',
          position: 'relative'
        }}
      >
        {/* Outer decorative border corner symbols */}
        <div className="absolute top-2 left-3 text-xs text-amber-700 font-bold select-none">卐</div>
        <div className="absolute top-2 right-3 text-xs text-amber-700 font-bold select-none">卐</div>
        <div className="absolute bottom-2 left-3 text-xs text-amber-700 font-bold select-none">卐</div>
        <div className="absolute bottom-2 right-3 text-xs text-amber-700 font-bold select-none">卐</div>

        <div>
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-amber-600 mb-4">
            <div className="text-2xl text-amber-700 font-bold">ॐ</div>
            <p className="text-xs font-semibold text-amber-800 tracking-wider">॥ श्री गणेशाय नमः ॥</p>
            <h1 className="text-2xl font-bold text-amber-900 mt-1">
              {isEn ? 'Shri Bhrigu Samhita Vedic Kundali Horoscope' : 'श्री भृगु संहिता वैदिक जन्म पत्रिका'}
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              {isEn ? 'Native:' : 'जातक:'} <span className="text-amber-800 font-bold text-base">{formData.name}</span>
            </p>
          </div>

          {/* Birth Particulars & Astronomical Signatures */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            {/* Box 1: Birth Particulars */}
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-300">
              <h3 className="font-bold text-amber-900 border-b border-amber-200 pb-1 mb-2 text-xs flex items-center justify-between">
                <span>जन्म विवरण (Birth Details)</span>
                {formData.isTimeApproximate && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 border border-rose-300 px-1.5 py-0.2 rounded font-bold">
                    अनुमानित समय
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-y-1.5 text-slate-800">
                <p><strong>नाम:</strong> {formData.name}</p>
                <p><strong>दिनांक:</strong> {formData.dob}</p>
                <p><strong>समय:</strong> {formData.time} {formData.isTimeApproximate ? '*' : ''}</p>
                <p><strong>स्थान:</strong> {formData.place}</p>
                <p className="col-span-2 text-[11px] text-slate-600">
                  <strong>अक्षांश/देशांतर:</strong> {coords.lat.toFixed(2)}°N, {coords.lon.toFixed(2)}°E
                </p>
              </div>
            </div>

            {/* Box 2: Panchang & Astronomical Credentials */}
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-300">
              <h3 className="font-bold text-amber-900 border-b border-amber-200 pb-1 mb-2 text-xs">
                पंचांग एवं ग्रह स्थिति (Panchang Signatures)
              </h3>
              <div className="grid grid-cols-2 gap-y-1.5 text-slate-800">
                <p><strong>लग्न राशि:</strong> {lagna.signSanskrit || 'मेष'} ({lagna.signIndex || 1})</p>
                <p><strong>चन्द्र राशि:</strong> {moon.signSanskrit || 'वृषभ'}</p>
                <p><strong>जन्म नक्षत्र:</strong> {moon.nakshatra || '-'}</p>
                <p><strong>नक्षत्र चरण:</strong> पाद {moon.pada || 1}</p>
                <p className="col-span-2">
                  <strong>नक्षत्र अधिपति:</strong> {moon.nakshatraLord || '-'} | <strong>अयानांश:</strong> लाहिड़ी (Lahiri)
                </p>
              </div>
            </div>
          </div>

          {/* Dosha Summary */}
          {doshas && (
            <div className="mb-4 p-3 bg-amber-50/40 rounded-lg border border-amber-200">
              <h3 className="text-xs font-bold text-amber-900 text-center mb-2">
                दोष परीक्षण विश्लेषण (Dosha Samiksha)
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="block text-[11px] text-slate-600 font-medium">मांगलिक</span>
                  <strong className={doshas.manglik?.status === 'दोष युक्त' ? 'text-rose-700' : 'text-emerald-700'}>
                    {doshas.manglik?.status || 'निर्दोष'}
                  </strong>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="block text-[11px] text-slate-600 font-medium">कालसर्प</span>
                  <strong className={doshas.kaalSarp?.status === 'दोष युक्त' ? 'text-rose-700' : 'text-emerald-700'}>
                    {doshas.kaalSarp?.status || 'निर्दोष'}
                  </strong>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="block text-[11px] text-slate-600 font-medium">साढ़े साती</span>
                  <strong className={doshas.sadesati?.status === 'सक्रिय' ? 'text-amber-700' : 'text-emerald-700'}>
                    {doshas.sadesati?.status || 'निर्दोष'}
                  </strong>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="block text-[11px] text-slate-600 font-medium">पितृ दोष</span>
                  <strong className={doshas.pitru?.status === 'दोष युक्त' ? 'text-rose-700' : 'text-emerald-700'}>
                    {doshas.pitru?.status || 'निर्दोष'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Primary Kundali Chart */}
          <div className="flex flex-col items-center justify-center my-2">
            <h3 className="text-sm font-bold text-amber-900 mb-2">
              {chartType === 'north' ? '॥ लग्न कुण्डली (उत्तर भारतीय चक्र) ॥' : '॥ लग्न कुण्डली (दक्षिण भारतीय चक्र) ॥'}
            </h3>

            <div className="w-[360px] h-[360px] bg-white relative">
              {chartType === 'north' ? (
                <svg viewBox="0 0 400 400" className="w-full h-full" style={{ backgroundColor: '#FCFBF7' }}>
                  {/* Outer Frame */}
                  <rect x="8" y="8" width="384" height="384" fill="#FCFBF7" stroke="#9A6B32" strokeWidth="2.5" />
                  
                  {/* Diagonals */}
                  <line x1="8" y1="8" x2="392" y2="392" stroke="#9A6B32" strokeWidth="1.5" />
                  <line x1="8" y1="392" x2="392" y2="8" stroke="#9A6B32" strokeWidth="1.5" />
                  
                  {/* Inner Diamond */}
                  <polygon points="200,8 392,200 200,392 8,200" fill="transparent" stroke="#9A6B32" strokeWidth="2" />

                  {/* House Planets (Text) */}
                  <text x="200" y="65" fill="#1C1917" fontSize="13" fontWeight="bold" textAnchor="middle">{housePlanets[1]?.map(p => p.name).join(' ') || 'लग्न'}</text>
                  <text x="110" y="75" fill="#1C1917" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[2]?.map(p => p.name).join(' ')}</text>
                  <text x="55" y="135" fill="#1C1917" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[3]?.map(p => p.name).join(' ')}</text>
                  <text x="85" y="225" fill="#1C1917" fontSize="13" fontWeight="bold" textAnchor="middle">{housePlanets[4]?.map(p => p.name).join(' ')}</text>
                  <text x="55" y="315" fill="#1C1917" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[5]?.map(p => p.name).join(' ')}</text>
                  <text x="110" y="375" fill="#1C1917" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[6]?.map(p => p.name).join(' ')}</text>
                  <text x="200" y="360" fill="#1C1917" fontSize="13" fontWeight="bold" textAnchor="middle">{housePlanets[7]?.map(p => p.name).join(' ')}</text>
                  <text x="290" y="375" fill="#1C1917" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[8]?.map(p => p.name).join(' ')}</text>
                  <text x="355" y="315" fill="#1C1917" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[9]?.map(p => p.name).join(' ')}</text>
                  <text x="315" y="225" fill="#1C1917" fontSize="13" fontWeight="bold" textAnchor="middle">{housePlanets[10]?.map(p => p.name).join(' ')}</text>
                  <text x="355" y="135" fill="#1C1917" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[11]?.map(p => p.name).join(' ')}</text>
                  <text x="290" y="75" fill="#1C1917" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[12]?.map(p => p.name).join(' ')}</text>

                  {/* Sign Numbers Reference */}
                  <text x="200" y="25" fill="#9A6B32" fontSize="10" fontWeight="bold">{lagna.signIndex || 1}</text>
                  <text x="140" y="35" fill="#9A6B32" fontSize="10" fontWeight="bold">{((lagna.signIndex || 1) % 12) + 1}</text>
                  <text x="25" y="100" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 1) % 12) + 1}</text>
                  <text x="30" y="200" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 2) % 12) + 1}</text>
                  <text x="25" y="300" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 3) % 12) + 1}</text>
                  <text x="140" y="380" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 4) % 12) + 1}</text>
                  <text x="200" y="385" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 5) % 12) + 1}</text>
                  <text x="260" y="380" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 6) % 12) + 1}</text>
                  <text x="375" y="300" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 7) % 12) + 1}</text>
                  <text x="375" y="200" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 8) % 12) + 1}</text>
                  <text x="375" y="100" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 9) % 12) + 1}</text>
                  <text x="260" y="35" fill="#9A6B32" fontSize="10" fontWeight="bold">{(((lagna.signIndex || 1) + 10) % 12) + 1}</text>
                </svg>
              ) : (
                <svg viewBox="0 0 380 380" className="w-full h-full" style={{ backgroundColor: '#FCFBF7' }}>
                  <rect x="10" y="10" width="360" height="360" fill="transparent" stroke="#9A6B32" strokeWidth="2.5" />
                  <line x1="100" y1="10" x2="100" y2="370" stroke="#9A6B32" strokeWidth="1.5" />
                  <line x1="190" y1="10" x2="190" y2="100" stroke="#9A6B32" strokeWidth="1.5" />
                  <line x1="190" y1="280" x2="190" y2="370" stroke="#9A6B32" strokeWidth="1.5" />
                  <line x1="280" y1="10" x2="280" y2="370" stroke="#9A6B32" strokeWidth="1.5" />

                  <line x1="10" y1="100" x2="370" y2="100" stroke="#9A6B32" strokeWidth="1.5" />
                  <line x1="10" y1="190" x2="100" y2="190" stroke="#9A6B32" strokeWidth="1.5" />
                  <line x1="280" y1="190" x2="370" y2="190" stroke="#9A6B32" strokeWidth="1.5" />
                  <line x1="10" y1="280" x2="370" y2="280" stroke="#9A6B32" strokeWidth="1.5" />

                  {renderSouthBox(12, 10, 10)}
                  {renderSouthBox(1, 100, 10)}
                  {renderSouthBox(2, 190, 10)}
                  {renderSouthBox(3, 280, 10)}

                  {renderSouthBox(11, 10, 100)}
                  {renderSouthBox(4, 280, 100)}

                  {renderSouthBox(10, 10, 190)}
                  {renderSouthBox(5, 280, 190)}

                  {renderSouthBox(9, 10, 280)}
                  {renderSouthBox(8, 100, 280)}
                  {renderSouthBox(7, 190, 280)}
                  {renderSouthBox(6, 280, 280)}
                </svg>
              )}
            </div>

            <p className="text-[11px] text-amber-900 font-semibold mt-2 italic text-center">
              "ग्रहाधीनं जगत्सर्वं ग्रहाधीना नराधिपाः। कालधीनास्तु ते सर्वे ग्रहाः कालप्रबोधिताः॥"
            </p>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-2 border-t border-amber-300 flex justify-between items-center text-[10px] text-slate-500">
          <span>कर्मफल वैदिक ज्योतिषीय गणना (Karmphal Drik Ganita Engine v1.0)</span>
          <span>प्रमाणित प्रतिवेदन • दिनांक: {currentDateStr}</span>
          <span>पृष्ठ १ / २</span>
        </div>
      </div>

      {/* ==================== A4 PAGE 2: PLANETARY TABLE, DASHA & REMARKS ==================== */}
      <div
        className="page-2-a4"
        data-page="2"
        style={{
          width: '794px',
          minHeight: '1123px',
          padding: '28px 32px',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '3px double #C48E48',
          position: 'relative'
        }}
      >
        <div className="absolute top-2 left-3 text-xs text-amber-700 font-bold select-none">卐</div>
        <div className="absolute top-2 right-3 text-xs text-amber-700 font-bold select-none">卐</div>
        <div className="absolute bottom-2 left-3 text-xs text-amber-700 font-bold select-none">卐</div>
        <div className="absolute bottom-2 right-3 text-xs text-amber-700 font-bold select-none">卐</div>

        <div>
          {/* Header Page 2 */}
          <div className="text-center pb-2 border-b-2 border-amber-600 mb-4">
            <h2 className="text-xl font-bold text-amber-900">॥ ग्रह स्पष्ट स्थिति एवं विंशोत्तरी दशा चक्र ॥</h2>
            <p className="text-xs text-slate-700">
              जातक: <span className="font-bold text-amber-900">{formData.name}</span> • जन्म दिनांक: {formData.dob} ({formData.time})
            </p>
          </div>

          {/* Planetary Table */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-amber-900 mb-1.5 flex items-center justify-between">
              <span>ग्रह स्पष्ट सारणी (Planetary Degrees & Houses)</span>
              <span className="text-[10px] font-normal text-slate-600">पद्धति: भाव स्पष्ट (Whole Sign)</span>
            </h3>
            <table className="w-full text-xs text-left border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-amber-100/70 border-b border-amber-300 text-amber-950 font-bold">
                  <th className="p-1.5 border-r border-amber-200">ग्रह (Planet)</th>
                  <th className="p-1.5 border-r border-amber-200">राशि (Sign)</th>
                  <th className="p-1.5 border-r border-amber-200">स्पष्ट अंश (Degree)</th>
                  <th className="p-1.5 border-r border-amber-200">नक्षत्र व पाद (Nakshatra)</th>
                  <th className="p-1.5 border-r border-amber-200">भाव (House)</th>
                  <th className="p-1.5">गति (Status)</th>
                </tr>
              </thead>
              <tbody>
                {planets.map((p, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/20'} ${p.name === 'लग्न' ? 'font-bold bg-amber-50/60' : ''}`}
                  >
                    <td className="p-1.5 border-r border-slate-200">
                      {p.name} {p.isRetro ? '(व.)' : ''}
                    </td>
                    <td className="p-1.5 border-r border-slate-200">{p.signSanskrit || '-'}</td>
                    <td className="p-1.5 border-r border-slate-200">{p.degreeInSign || p.longitude?.toFixed(1) || 0}°</td>
                    <td className="p-1.5 border-r border-slate-200">
                      {p.nakshatra || '-'} ({p.pada || 1})
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-center">{p.house || 1}</td>
                    <td className="p-1.5 text-center">
                      {p.name === 'लग्न' ? 'लग्न बिंदु' : p.isRetro ? 'वक्री (R)' : 'मार्गी (D)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vimshottari Dasha Timeline */}
          {dashaTimeline.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-amber-900 mb-1.5">
                विंशोत्तरी महादशा चक्र (१२० वर्ष कालावधि)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {dashaTimeline.map((dasha, idx) => {
                  const startDate = new Date(dasha.startDate);
                  const endDate = new Date(dasha.endDate);
                  const isCurrent = now >= startDate && now <= endDate;
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded border text-center text-xs ${
                        isCurrent
                          ? 'bg-amber-100 border-amber-500 font-bold text-amber-950 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{`${dasha.lord} महादशा`}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-amber-600 text-white px-1 py-0.2 rounded font-semibold">
                            वर्तमान
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {startDate.getFullYear()} - {endDate.getFullYear()} ({dasha.years} वर्ष)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Astrological Remarks & Guidelines */}
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-300 text-xs">
            <h3 className="font-bold text-amber-900 border-b border-amber-200 pb-1 mb-2 flex items-center justify-between">
              <span>वैदिक परामर्श एवं जीवन निर्देश (Astrological Remarks & Guidance)</span>
              <span className="text-[10px] text-amber-800 font-normal">बृहत्पाराशर होरा शास्त्रानुमोदित</span>
            </h3>

            {aiReading ? (
              <div className="text-slate-800 leading-relaxed text-[11px] whitespace-pre-wrap max-h-[190px] overflow-hidden text-justify">
                {aiReading.length > 900 ? `${aiReading.slice(0, 900)}...` : aiReading}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-slate-800 text-[11px]">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <p><strong>इष्ट देव उपासना:</strong> {lagna.signSanskrit === 'मेष' || lagna.signSanskrit === 'वृश्चिक' ? 'श्री हनुमान जी' : lagna.signSanskrit === 'कर्क' ? 'भगवान शिव' : 'श्री नारायण / गायत्री'}</p>
                  <p className="mt-1"><strong>अनुकूल रत्न:</strong> {lagna.signSanskrit === 'मेष' ? 'मूंगा (Red Coral)' : lagna.signSanskrit === 'वृषभ' ? 'ओपल / हीरा' : 'लग्न स्वामी अनुसार ज्योतिषी परामर्श'}</p>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <p><strong>शुभ वार:</strong> {lagna.signSanskrit === 'सिंह' ? 'रविवार' : lagna.signSanskrit === 'कर्क' ? 'सोमवार' : 'गुरुवार व मंगलवार'}</p>
                  <p className="mt-1"><strong>नित्य महामंत्र:</strong> ॐ नमो भगवते वासुदेवाय अथवा गायत्री महामंत्र का नित्य जप कल्याणकारी है।</p>
                </div>
                <div className="col-span-2 text-[10px] text-slate-600 mt-1">
                  * यह कुंडली दृश्य गणितीय पंचांग गणना पर आधारित है। विशेष दशा-अंतर्दशा में किसी सिद्ध ज्योतिषाचार्य से प्रत्यक्ष परामर्श श्रेयस्कर है।
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page 2 Footer */}
        <div className="pt-2 border-t border-amber-300 flex justify-between items-center text-[10px] text-slate-500">
          <span>कर्मफल वैदिक ज्योतिषीय गणना (Karmphal Drik Ganita Engine v1.0)</span>
          <span>प्रमाणित प्रतिवेदन • दिनांक: {currentDateStr}</span>
          <span>पृष्ठ २ / २</span>
        </div>
      </div>
    </div>
  );
}
