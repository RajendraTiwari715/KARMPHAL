import React, { useState } from 'react';
import { HeartHandshake, CheckCircle2, XCircle, Sparkles, ShieldAlert, Award, ArrowLeft, BookOpen, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { calculateAshtakoot } from '../../services/ashtakootEngine';
import { NAKSHATRAS, ZODIAC_SIGNS } from '../../services/ephemerisEngine';
import { audioService } from '../../services/audioService';
import { geminiService } from '../../services/geminiService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [aiMilanReading, setAiMilanReading] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleMatch = (e) => {
    e?.preventDefault();
    audioService.playTempleBell(528, 1.5);
    const res = calculateAshtakoot(groomData, brideData);
    setResult(res);
  };

  const handleGenerateAiMilanReading = async () => {
    audioService.playTempleBell(432, 1.2);
    setIsGeneratingAi(true);
    try {
      const groomFull = {
        ...groomData,
        nakshatraName: NAKSHATRAS.find(n => n.id === groomData.nakshatraId)?.name || 'रोहिणी',
        rashiName: ZODIAC_SIGNS.find(z => z.id === groomData.rashiId)?.sanskrit || 'वृषभ'
      };
      const brideFull = {
        ...brideData,
        nakshatraName: NAKSHATRAS.find(n => n.id === brideData.nakshatraId)?.name || 'हस्त',
        rashiName: ZODIAC_SIGNS.find(z => z.id === brideData.rashiId)?.sanskrit || 'कन्या'
      };

      const reading = await geminiService.generateVivahMilanReading(groomFull, brideFull, result);
      if (reading) {
        setAiMilanReading(reading);
      } else {
        setAiMilanReading('अष्टकूट मिलान की विस्तृत गणना पूर्ण हुई। वर एवं कन्या के मध्य संस्कार, स्वभाव और गृहस्थ धर्म का तालमेल उत्तम है।');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyReading = () => {
    if (!aiMilanReading) return;
    navigator.clipboard.writeText(aiMilanReading);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  const handleDownloadPDF = async () => {
    const reportElement = document.getElementById('milan-report');
    if (!reportElement) return;

    audioService.playBeadClick();
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportElement, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${groomData.name}_${brideData.name}_Milan_Report.pdf`);
    } catch (err) {
      console.error('PDF Export failed:', err);
    } finally {
      setIsExporting(false);
    }
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
          {result && (
            <button 
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/40 transition-all text-xs font-bold"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'PDF बन रहा है...' : 'PDF डाउनलोड करें'}</span>
            </button>
          )}
          <span className="badge-gold font-bold text-xs">३६ गुण अष्टकूट विवाह मिलन</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="glass-card-gold p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">वर-कन्या कुण्डली गुण मिलान</span>
              <span className="badge-saffron">दोष परिहार सहित</span>
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
      <form onSubmit={handleMatch} className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        {/* Groom Profile */}
        <div className="glass-card p-5 sm:p-6 border-t-4 border-blue-500 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-dharmik text-base font-bold text-blue-300">
              वर का विवरण
            </h3>
            <span className="badge-gold text-[10px]">वर पक्ष</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">वर का नाम</label>
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
              कन्या का विवरण
            </h3>
            <span className="badge-gold text-[10px]">कन्या पक्ष</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">कन्या का नाम</label>
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

      {result && (
        <div className="mt-8 animate-fade-in">
          <div id="milan-report" className="print-report bg-white dark:bg-[#111] text-black dark:text-white rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 sm:p-12 overflow-hidden relative">
            
            {/* PAGE 1: Summary */}
            <div className="page-section min-h-[900px] print:h-[1050px] flex flex-col page-break-after">
              <div className="text-center mb-8 border-b-2 border-amber-500 pb-6">
                <span className="text-4xl text-amber-500 mb-2 block">ॐ</span>
                <h1 className="text-3xl font-dharmik font-bold text-amber-600 dark:text-amber-400">विवाह मेलापक फलादेश</h1>
                <h2 className="text-xl mt-2 font-bold">{groomData.name} एवं {brideData.name} का अष्टकूट मिलान</h2>
              </div>

              <div className="flex flex-col items-center justify-center mb-10">
                <div className="relative w-32 h-32 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center shadow-xl shadow-amber-500/20 mb-4">
                  <span className="text-4xl font-black text-amber-600 dark:text-amber-400 font-mono">{result.totalScore}</span>
                  <span className="text-xs uppercase tracking-widest font-bold">/ ३६ गुण</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-2xl font-bold ${result.totalScore >= 24 ? 'text-emerald-600 dark:text-emerald-400' : result.totalScore >= 18 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {result.totalScore >= 24 ? 'उत्तम मिलन (अत्यन्त शुभ)' : result.totalScore >= 18 ? 'मध्यम मिलन (स्वीकार्य)' : 'अधम मिलन (दोषयुक्त)'}
                  </span>
                  {result.isViable ? <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
                </div>
                <p className="text-sm text-center max-w-lg leading-relaxed">
                  <strong>{groomData.name}</strong> एवं <strong>{brideData.name}</strong> के मध्य कुल {result.totalScore} गुण मिलते हैं। 
                  {result.totalScore >= 18 ? ' वैवाहिक जीवन हेतु यह सम्बन्ध शास्त्र सम्मत एवं शुभ है।' : ' गुणों की संख्या कम होने के कारण कुण्डली के अन्य भावों का परीक्षण आवश्यक है।'}
                </p>
              </div>

              <div className="w-full bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-500/30 text-sm flex-1">
                <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold mb-2">
                  <ShieldAlert className="w-5 h-5" />
                  <span className="text-lg">मांगलिक (कुज) दोष स्थिति</span>
                </div>
                <p className="text-center leading-relaxed font-bold">{result.manglik.status}</p>
                <div className="mt-6 text-center text-xs text-gray-500">
                  मांगलिक दोष का निर्णय केवल भाव स्थिति के आधार पर किया गया है। पूर्ण परिहार के लिए सम्पूर्ण कुण्डली का विश्लेषण आवश्यक है।
                </div>
              </div>
            </div>

            {/* PAGE 2: 8 Kootas Detailed Grid */}
            <div className="page-section min-h-[900px] print:h-[1050px] flex flex-col page-break-after pt-8 border-t-2 border-dashed border-gray-300 print:border-none print:pt-0">
              <h2 className="text-2xl font-dharmik font-bold text-amber-600 dark:text-amber-400 mb-6 flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                <span>८ अष्टकूट विस्तृत प्राप्ताङ्क विवरण</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {result.kootas.map((koota, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-center justify-between mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="font-bold text-sm">{idx + 1}. {koota.name} कूट</span>
                      <span className="font-mono text-sm font-black px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                        {koota.obtained} / {koota.max}
                      </span>
                    </div>
                    <p className="text-xs mt-2 leading-relaxed">{koota.desc}</p>
                    {koota.cancelled && (
                      <div className="mt-3 text-[11px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-2 py-1 rounded flex items-center gap-1 font-bold inline-flex">
                        <Check className="w-3 h-3" />
                        <span>दोष परिहार लागू</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PAGE 3-5: Deep AI Astrologer Vivah Milan Reading */}
            <div className="page-section min-h-[900px] pt-8 border-t-2 border-dashed border-gray-300 print:border-none print:pt-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-dharmik font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                    <span>विस्तृत मेलापक फलादेश (३-५ पृष्ठ)</span>
                  </h2>
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    ३६ गुण, मांगलिक सामंजस्य, मानसिक तालमेल व वैदिक उपाय
                  </p>
                </div>

                <div className="no-print">
                  <button
                    onClick={handleGenerateAiMilanReading}
                    disabled={isGeneratingAi}
                    className="btn-gold text-xs py-1.5 px-4 flex items-center gap-2"
                  >
                    {isGeneratingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                    <span>{isGeneratingAi ? 'महर्षि गणना कर रहे हैं...' : 'विस्तृत फलादेश उत्पन्न करें'}</span>
                  </button>
                </div>
              </div>

              {/* AI Reading Content Area */}
              {isGeneratingAi ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="font-sanskrit text-5xl text-amber-500 animate-spin mb-4 block">ॐ</span>
                  <p className="text-gray-500">मेलापक शास्त्र व अष्टकूट परिहार के आधार पर फलादेश तैयार किया जा रहा है...</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-amber">
                  {aiMilanReading ? (
                    <div className="whitespace-pre-wrap leading-loose text-justify text-[15px] print:text-[12pt]">
                      {aiMilanReading}
                    </div>
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
