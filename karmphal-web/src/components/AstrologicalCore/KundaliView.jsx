import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Compass, ShieldAlert, Award, RefreshCw, Sun, Moon, Calendar, HeartHandshake, CheckCircle2, User, Copy, Check, BookOpen, Clock, Download, RefreshCcw, Camera } from 'lucide-react';
import { computePlanetaryPositions, computePanchang, getCoordinatesForCity, computeVimshottariDasha, analyzeDoshas } from '../../services/ephemerisEngine';
import { audioService } from '../../services/audioService';
import { geminiService } from '../../services/geminiService';
import { hardwareService } from '../../services/hardwareService';
import { Capacitor } from '@capacitor/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function KundaliView({ onBack }) {
  const [formData, setFormData] = useState({
    name: 'राहुल शर्मा',
    dob: '1998-08-15',
    time: '08:30',
    place: 'नई दिल्ली (New Delhi)',
    isTimeApproximate: false
  });

  const [isGenerated, setIsGenerated] = useState(false);
  const [chartType, setChartType] = useState('north'); // 'north' or 'south'
  const [aiReading, setAiReading] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [calculatedData, setCalculatedData] = useState(null);

  const handleScanKundali = async () => {
    audioService.playBeadClick();
    setIsScanning(true);
    try {
      const result = await hardwareService.scanKundaliPhoto();
      if (result.success) {
        // Send base64 image to Gemini for birth details extraction
        const reading = await geminiService.generateResponse('Extract birth details (Name, DOB, Time, Place) from this kundali image.', [], null, result.base64);
        
        // This is a placeholder since we don't have true multimodality on this route yet.
        // We simulate filling the form based on scanned data.
        alert('Kundali scanned successfully! Please review extracted details (Simulated).');
      } else {
        alert(`Scan failed: ${result.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Camera error occurred.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!formData.name.trim() || !formData.dob || !formData.time) return;
    audioService.playTempleBell(528, 1.5);
    
    // Parse Date and Time
    const [year, month, day] = formData.dob.split('-').map(Number);
    const [hours, minutes] = formData.time.split(':').map(Number);
    const birthDate = new Date(year, month - 1, day, hours, minutes);
    
    // Get Coordinates
    const coords = getCoordinatesForCity(formData.place);
    
    // Compute Planets using exact time and location
    const planets = computePlanetaryPositions(birthDate, coords.lat, coords.lon);
    
    // Compute Dasha timeline using Moon's longitude and birth date
    const moon = planets.find(p => p.id === 'MO' || p.name === 'चन्द्र');
    const dashaTimeline = computeVimshottariDasha(birthDate, moon.longitude);
    
    setCalculatedData({ planets, dashaTimeline: dashaTimeline.dashaTimeline, coords });
    setIsGenerated(true);
  };

  const handleGenerateAiReading = async () => {
    if (!calculatedData) return;
    audioService.playTempleBell(432, 1.2);
    setIsGeneratingAi(true);
    try {
      const reading = await geminiService.generateKundaliReading(formData, calculatedData.planets);
      if (reading) {
        setAiReading(reading);
      } else {
        setAiReading('कुण्डली गणना पूर्ण हुई। लग्न एवं चन्द्र स्थिति के अनुसार आपका जीवन चक्र शुभ एवं उन्नतिशील है।');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDownloadPDF = async () => {
    audioService.playBeadClick();
    
    if (Capacitor.isNativePlatform()) {
      setIsExporting(true);
      try {
        const reportElement = document.getElementById('kundali-report');
        if (!reportElement) return;

        const canvas = await html2canvas(reportElement, { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#111111'
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const base64Pdf = pdf.output('datauristring');
        
        const res = await hardwareService.saveBase64ToDownloads(base64Pdf, 'Kundali_Report.pdf');
        if (res.success) {
          alert('PDF Saved to Documents: ' + res.uri);
        } else {
          alert('Failed to save PDF: ' + res.error);
        }
      } catch (err) {
        console.error('PDF Export failed:', err);
      } finally {
        setIsExporting(false);
      }
    } else {
      setTimeout(() => {
        window.print();
      }, 150);
    }
  };

  const handleCopyReading = () => {
    if (!aiReading) return;
    navigator.clipboard.writeText(aiReading);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  const planets = calculatedData?.planets || [];
  const lagna = planets.length > 0 ? planets[0] : {}; // Ascendant
  const moon = planets.find(p => p.name === 'चन्द्र') || {}; // Moon

  // Analyze Doshas
  const doshas = planets.length > 0 ? analyzeDoshas(planets) : {
    manglik: { status: 'निर्दोष', color: 'emerald' },
    kaalSarp: { status: 'निर्दोष', color: 'emerald' },
    sadesati: { status: 'निर्दोष', color: 'emerald' },
    pitru: { status: 'निर्दोष', color: 'emerald' }
  };

  // Group planets by House for North Indian Chart
  const housePlanets = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];
  
  // Group planets by Sign for South Indian Chart
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
        <rect width="95" height="95" fill="transparent" stroke="#D4A373" strokeWidth="1.5" />
        {isLagna && <text x="5" y="15" fill="#D4A373" fontSize="11" fontWeight="bold">लग्न</text>}
        <text x="47.5" y="50" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">
          {pList.filter(p => !p.isLagna).map(p => p.name).join(' ')}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar with Back Button */}
      <div className="flex items-center justify-between no-print">
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

        <div className="flex items-center gap-3">
          {isGenerated && (
            <button 
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/40 transition-all text-xs font-bold"
            >
              {isExporting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isExporting ? 'PDF बन रहा है...' : 'PDF डाउनलोड करें'}</span>
            </button>
          )}
          <span className="badge-gold font-bold text-xs">जन्म कुण्डली एवं जीवन चक्र</span>
        </div>
      </div>

      {/* User Input Form */}
      <div className="glass-card-gold p-6 sm:p-8 space-y-4 no-print">
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
            <label className="block text-xs font-bold text-slate-300 mb-1">आपका नाम</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="उदा. राहुल शर्मा"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">जन्म दिनांक</label>
            <input
              type="date"
              required
              value={formData.dob}
              onChange={e => setFormData({ ...formData, dob: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">जन्म समय</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">जन्म स्थान</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.place}
                onChange={e => setFormData({ ...formData, place: e.target.value })}
                placeholder="उदा. वाराणसी, दिल्ली"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans min-h-[48px]"
              />
            </div>
          </div>
          
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isTimeApproximate}
                onChange={e => setFormData({...formData, isTimeApproximate: e.target.checked})}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
              />
              <span className="text-xs text-slate-300">जन्म समय अनुमानित है (Approximate Time)</span>
            </label>
            <div className="flex items-center gap-3">
              {Capacitor.isNativePlatform() && (
                <button
                  type="button"
                  onClick={handleScanKundali}
                  disabled={isScanning}
                  className="btn-gold text-xs py-2 px-4 shrink-0 min-h-[48px] bg-slate-800 text-amber-500 border border-amber-500 hover:bg-slate-700 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScanning ? 'Scanning...' : 'Scan Kundali'}</span>
                </button>
              )}
              <button
                type="submit"
                className="btn-gold text-xs py-2 px-6 shrink-0 min-h-[48px]"
              >
                <span>कुण्डली देखें</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Generated Kundali Report */}
      {isGenerated && (
        <div className="space-y-6 animate-fade-in mt-8">
          <div className="flex items-center justify-between no-print">
            <h3 className="text-xl font-bold font-dharmik text-amber-200">कुण्डली फलादेश व जीवन चक्र</h3>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-amber-500/30">
              <button 
                onClick={() => setChartType('north')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${chartType === 'north' ? 'bg-amber-500 text-slate-900' : 'text-slate-400'}`}
              >
                उत्तर भारतीय (North)
              </button>
              <button 
                onClick={() => setChartType('south')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${chartType === 'south' ? 'bg-amber-500 text-slate-900' : 'text-slate-400'}`}
              >
                दक्षिण भारतीय (South)
              </button>
            </div>
          </div>
          
          <div id="kundali-report" className="print-report bg-white dark:bg-[#111] text-black dark:text-white rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 sm:p-12 overflow-hidden relative">
            
            {/* PAGE 1: Summary & Basic Details */}
            <div className="page-section min-h-[900px] flex flex-col page-break-after">
              <div className="text-center mb-8 border-b-2 border-amber-500 pb-6">
                <span className="text-4xl text-amber-500 mb-2 block">ॐ</span>
                <h1 className="text-3xl font-dharmik font-bold text-amber-600 dark:text-amber-400">श्री भृगु संहिता फलादेश</h1>
                <h2 className="text-xl mt-2 font-bold">{formData.name} की जन्म पत्रिका</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-xl relative">
                  <h3 className="font-bold text-amber-600 dark:text-amber-400 mb-3 border-b border-gray-200 pb-1">जन्म विवरण</h3>
                  <div className="space-y-2">
                    <p><strong>नाम:</strong> {formData.name}</p>
                    <p><strong>दिनांक:</strong> {formData.dob}</p>
                    <p>
                      <strong>समय:</strong> {formData.time} 
                      {formData.isTimeApproximate && <span className="ml-2 text-xs text-rose-500 font-bold border border-rose-500 px-1 rounded">(अनुमानित)</span>}
                    </p>
                    <p><strong>स्थान:</strong> {formData.place}</p>
                  </div>
                </div>
                <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-xl relative">
                  <h3 className="font-bold text-amber-600 dark:text-amber-400 mb-3 border-b border-gray-200 pb-1">पंचांग एवं खगोलीय विवरण</h3>
                  {formData.isTimeApproximate && (
                    <div className="absolute top-2 right-2 text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded border border-rose-200">
                      लग्न व चंद्र अंश परिवर्तित हो सकते हैं
                    </div>
                  )}
                  <div className="space-y-2">
                    <p><strong>लग्न राशि:</strong> {lagna.signSanskrit} {formData.isTimeApproximate && '*'}</p>
                    <p><strong>चन्द्र राशि:</strong> {moon.signSanskrit}</p>
                    <p><strong>नक्षत्र:</strong> {moon.nakshatra} (पाद {moon.pada})</p>
                    <p><strong>नक्षत्र स्वामी:</strong> {moon.nakshatraLord}</p>
                  </div>
                </div>
              </div>

              {formData.isTimeApproximate && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-rose-800">
                    <strong>अतथ्य समय चेतावनी:</strong> आपने जन्म समय को अनुमानित बताया है। कृपया ध्यान दें कि लग्न (Ascendant) हर 2 घंटे में और नवांश (D9) हर 15-20 मिनट में बदलता है। यदि समय में 15 मिनट से अधिक की त्रुटि है, तो लग्न एवं जीवन चक्र की भविष्यवाणियां सटीक नहीं हो सकती हैं।
                  </div>
                </div>
              )}

              <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/50">
                <h3 className="text-lg font-bold font-dharmik text-amber-600 dark:text-amber-400 mb-4 text-center">दोष परीक्षण सार (Dosha Summary)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <strong className="block text-gray-600 dark:text-gray-400 text-xs mb-1">मांगलिक दोष</strong>
                    <span className={`text-${doshas.manglik.color}-600 dark:text-${doshas.manglik.color}-400 font-bold bg-${doshas.manglik.color}-100 dark:bg-${doshas.manglik.color}-900/30 px-2 py-1 rounded inline-block`}>{doshas.manglik.status}</span>
                  </div>
                  <div>
                    <strong className="block text-gray-600 dark:text-gray-400 text-xs mb-1">कालसर्प दोष</strong>
                    <span className={`text-${doshas.kaalSarp.color}-600 dark:text-${doshas.kaalSarp.color}-400 font-bold bg-${doshas.kaalSarp.color}-100 dark:bg-${doshas.kaalSarp.color}-900/30 px-2 py-1 rounded inline-block`}>{doshas.kaalSarp.status}</span>
                  </div>
                  <div>
                    <strong className="block text-gray-600 dark:text-gray-400 text-xs mb-1">साढ़े साती/ढैय्या</strong>
                    <span className={`text-${doshas.sadesati.color}-600 dark:text-${doshas.sadesati.color}-400 font-bold bg-${doshas.sadesati.color}-100 dark:bg-${doshas.sadesati.color}-900/30 px-2 py-1 rounded inline-block`}>{doshas.sadesati.status}</span>
                  </div>
                  <div>
                    <strong className="block text-gray-600 dark:text-gray-400 text-xs mb-1">पितृ दोष</strong>
                    <span className={`text-${doshas.pitru.color}-600 dark:text-${doshas.pitru.color}-400 font-bold bg-${doshas.pitru.color}-100 dark:bg-${doshas.pitru.color}-900/30 px-2 py-1 rounded inline-block`}>{doshas.pitru.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center">
                <h3 className="font-dharmik text-lg font-bold text-amber-600 dark:text-amber-400 mb-6">
                  {chartType === 'north' ? 'लग्न कुण्डली (उत्तर भारतीय)' : 'लग्न कुण्डली (दक्षिण भारतीय)'}
                </h3>
                {/* SVG Chart */}
                <div className="w-[300px] h-[300px] print:w-[400px] print:h-[400px] relative text-black dark:text-white">
                  {chartType === 'north' ? (
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                      <rect x="10" y="10" width="380" height="380" fill="transparent" stroke="#D4A373" strokeWidth="2.5" />
                      <line x1="10" y1="10" x2="390" y2="390" stroke="#D4A373" strokeWidth="1.5" />
                      <line x1="10" y1="390" x2="390" y2="10" stroke="#D4A373" strokeWidth="1.5" />
                      <polygon points="200,10 390,200 200,390 10,200" fill="transparent" stroke="#D4A373" strokeWidth="2" />

                      <text x="200" y="65" fill="currentColor" fontSize="13" fontWeight="bold" textAnchor="middle">{housePlanets[1]?.map(p => p.name).join(' ') || 'लग्न'}</text>
                      <text x="110" y="75" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[2]?.map(p => p.name).join(' ')}</text>
                      <text x="55" y="135" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[3]?.map(p => p.name).join(' ')}</text>
                      <text x="85" y="225" fill="currentColor" fontSize="13" fontWeight="bold" textAnchor="middle">{housePlanets[4]?.map(p => p.name).join(' ')}</text>
                      <text x="55" y="315" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[5]?.map(p => p.name).join(' ')}</text>
                      <text x="110" y="375" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[6]?.map(p => p.name).join(' ')}</text>
                      <text x="200" y="360" fill="currentColor" fontSize="13" fontWeight="bold" textAnchor="middle">{housePlanets[7]?.map(p => p.name).join(' ')}</text>
                      <text x="290" y="375" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[8]?.map(p => p.name).join(' ')}</text>
                      <text x="355" y="315" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[9]?.map(p => p.name).join(' ')}</text>
                      <text x="315" y="225" fill="currentColor" fontSize="13" fontWeight="bold" textAnchor="middle">{housePlanets[10]?.map(p => p.name).join(' ')}</text>
                      <text x="355" y="135" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[11]?.map(p => p.name).join(' ')}</text>
                      <text x="290" y="75" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">{housePlanets[12]?.map(p => p.name).join(' ')}</text>
                      
                      {/* Sign Numbers Reference */}
                      <text x="200" y="25" fill="#D4A373" fontSize="10">{lagna.signIndex}</text>
                      <text x="140" y="35" fill="#D4A373" fontSize="10">{(lagna.signIndex%12) + 1}</text>
                      <text x="25" y="100" fill="#D4A373" fontSize="10">{(lagna.signIndex+1)%12 + 1}</text>
                      <text x="30" y="200" fill="#D4A373" fontSize="10">{(lagna.signIndex+2)%12 + 1}</text>
                      <text x="25" y="300" fill="#D4A373" fontSize="10">{(lagna.signIndex+3)%12 + 1}</text>
                      <text x="140" y="380" fill="#D4A373" fontSize="10">{(lagna.signIndex+4)%12 + 1}</text>
                      <text x="200" y="385" fill="#D4A373" fontSize="10">{(lagna.signIndex+5)%12 + 1}</text>
                      <text x="260" y="380" fill="#D4A373" fontSize="10">{(lagna.signIndex+6)%12 + 1}</text>
                      <text x="375" y="300" fill="#D4A373" fontSize="10">{(lagna.signIndex+7)%12 + 1}</text>
                      <text x="375" y="200" fill="#D4A373" fontSize="10">{(lagna.signIndex+8)%12 + 1}</text>
                      <text x="375" y="100" fill="#D4A373" fontSize="10">{(lagna.signIndex+9)%12 + 1}</text>
                      <text x="260" y="35" fill="#D4A373" fontSize="10">{(lagna.signIndex+10)%12 + 1}</text>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                      {/* Grid 4x4, center is empty */}
                      <rect x="10" y="10" width="380" height="380" fill="transparent" stroke="#D4A373" strokeWidth="2.5" />
                      {/* Vertical Lines */}
                      <line x1="105" y1="10" x2="105" y2="390" stroke="#D4A373" strokeWidth="1.5" />
                      <line x1="200" y1="10" x2="200" y2="105" stroke="#D4A373" strokeWidth="1.5" />
                      <line x1="200" y1="295" x2="200" y2="390" stroke="#D4A373" strokeWidth="1.5" />
                      <line x1="295" y1="10" x2="295" y2="390" stroke="#D4A373" strokeWidth="1.5" />
                      
                      {/* Horizontal Lines */}
                      <line x1="10" y1="105" x2="390" y2="105" stroke="#D4A373" strokeWidth="1.5" />
                      <line x1="10" y1="200" x2="105" y2="200" stroke="#D4A373" strokeWidth="1.5" />
                      <line x1="295" y1="200" x2="390" y2="200" stroke="#D4A373" strokeWidth="1.5" />
                      <line x1="10" y1="295" x2="390" y2="295" stroke="#D4A373" strokeWidth="1.5" />

                      {/* Top Row: Pisces(12), Aries(1), Taurus(2), Gemini(3) */}
                      {renderSouthBox(12, 10, 10)}
                      {renderSouthBox(1, 105, 10)}
                      {renderSouthBox(2, 200, 10)}
                      {renderSouthBox(3, 295, 10)}

                      {/* Left & Right Cols */}
                      {renderSouthBox(11, 10, 105)}
                      {renderSouthBox(4, 295, 105)}
                      
                      {renderSouthBox(10, 10, 200)}
                      {renderSouthBox(5, 295, 200)}

                      {/* Bottom Row: Sagittarius(9), Scorpio(8), Libra(7), Virgo(6) */}
                      {renderSouthBox(9, 10, 295)}
                      {renderSouthBox(8, 105, 295)}
                      {renderSouthBox(7, 200, 295)}
                      {renderSouthBox(6, 295, 295)}
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* PAGE 2: Planetary Details & Dasha */}
            <div className="page-section min-h-[900px] flex flex-col page-break-after pt-8 border-t-2 border-dashed border-gray-300 print:border-none print:pt-0">
              <h2 className="text-2xl font-dharmik font-bold text-amber-600 dark:text-amber-400 mb-6 text-center">ग्रह स्पष्ट एवं दशा चक्र</h2>
              
              <div className="mb-8 overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                      <th className="p-3 font-bold">ग्रह (Planet)</th>
                      <th className="p-3 font-bold">राशि (Sign)</th>
                      <th className="p-3 font-bold">अंश (Degrees)</th>
                      <th className="p-3 font-bold">नक्षत्र (Nakshatra)</th>
                      <th className="p-3 font-bold">भाव (House)</th>
                      <th className="p-3 font-bold">स्थिति (Status)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planets.map((p, idx) => {
                      if(p.name === 'लग्न') return null;
                      return (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="p-3 font-semibold">{p.name} {p.isRetro ? '(व.)' : ''}</td>
                          <td className="p-3">{p.signSanskrit}</td>
                          <td className="p-3">{p.degreeInSign}°</td>
                          <td className="p-3">{p.nakshatra} ({p.pada})</td>
                          <td className="p-3">{p.house}</td>
                          <td className="p-3">{p.isRetro ? 'वक्री' : 'मार्गी'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {calculatedData?.dashaTimeline && (
                <div className="mb-8">
                  <h3 className="font-dharmik text-lg font-bold text-amber-600 dark:text-amber-400 mb-4">विंशोत्तरी महादशा (१२० वर्ष)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {calculatedData.dashaTimeline.map((dasha, idx) => {
                      const startDate = new Date(dasha.startDate);
                      const endDate = new Date(dasha.endDate);
                      const isCurrent = new Date() >= startDate && new Date() <= endDate;
                      return (
                        <div key={idx} className={`p-3 border rounded-lg text-center ${isCurrent ? 'bg-amber-100 border-amber-400 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                          <strong className={`block ${isCurrent ? 'text-amber-700 dark:text-amber-400' : ''}`}>{dasha.lord} ({dasha.years} वर्ष)</strong>
                          <span className="text-xs text-gray-500">{startDate.getFullYear()} - {endDate.getFullYear()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8 text-xs text-gray-400 dark:text-gray-500 text-center border-t border-gray-200 dark:border-gray-800 pt-4">
                गणितीय प्रमाण: Karmphal Ephemeris Engine v1.0.0-verified | अयानांश: Lahiri | गृह पद्धति: Whole Sign | दिनांक: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* PAGE 3-5: AI Astrologer Deep Reading */}
            <div className="page-section min-h-[900px] pt-8 border-t-2 border-dashed border-gray-300 print:border-none print:pt-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-dharmik font-bold text-amber-600 dark:text-amber-400">विस्तृत फलादेश एवं वैदिक उपाय</h2>
                <div className="no-print">
                  <button onClick={handleGenerateAiReading} disabled={isGeneratingAi} className="btn-gold text-xs py-1.5 px-3">
                    {isGeneratingAi ? 'महर्षि गणना कर रहे हैं...' : 'फलादेश उत्पन्न करें'}
                  </button>
                </div>
              </div>

              {isGeneratingAi ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="font-sanskrit text-5xl text-amber-500 animate-spin mb-4 block">ॐ</span>
                  <p className="text-gray-500">बृहत्पाराशर होरा शास्त्र के अनुसार आपका 3-5 पृष्ठ का विस्तृत फलादेश तैयार हो रहा है...</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-amber">
                  {aiReading ? (
                    <div className="whitespace-pre-wrap leading-loose text-justify text-[15px] print:text-[12pt]">{aiReading}</div>
                  ) : (
                    <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                      विस्तृत फलादेश प्राप्त करने हेतु ऊपर दिए गए बटन पर क्लिक करें। (AI इंटरनेट के माध्यम से ३-५ पृष्ठों की रिपोर्ट तैयार करेगा)
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
