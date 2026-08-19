import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Star, Sun, Moon, Award, Compass, ShieldCheck } from 'lucide-react';
import { audioService } from '../../services/audioService';

const RASHI_DATA = [
  {
    id: 1,
    name: 'मेष राशि (Aries)',
    sanskrit: 'मेष (Aries)',
    symbol: '🐏',
    lord: 'मंगल (Mangala)',
    element: 'अग्नि तत्व (Fire)',
    luckyColor: 'लाल एवं केसरिया',
    luckyNumber: '९ एवं १',
    luckyDay: 'मंगलवार',
    gemstone: 'मूंगा (Red Coral)',
    traits: 'साहसी, ऊर्जावान, नेतृत्व क्षमता से युक्त, स्पष्टवादी एवं दृढनिश्चयी।',
    career: 'सेना, पुलिस, प्रशासनिक सेवा, चिकित्सा (शल्य-चिकित्सा), रियल एस्टेट एवं तकनीकी क्षेत्र।',
    health: 'सिरदर्द, रक्तचाप एवं क्रोध पर नियन्त्रण रखें। जल का सेवन अधिक करें।',
    mantra: 'ॐ अं अङ्गारकाय नमः',
    remedy: 'नित्य हनुमान चालीसा का पाठ करें और मंगलवार को गुड़-चने का दान करें।'
  },
  {
    id: 2,
    name: 'वृषभ राशि (Taurus)',
    sanskrit: 'वृषभ (Taurus)',
    symbol: '🐂',
    lord: 'शुक्र (Shukra)',
    element: 'पृथ्वी तत्व (Earth)',
    luckyColor: 'सफेद, चमकीला एवं गुलाबी',
    luckyNumber: '६ एवं २',
    luckyDay: 'शुक्रवार',
    gemstone: 'हीरा / ओपल (Diamond/Opal)',
    traits: 'धैर्यवान, सौन्दर्य प्रेमी, विश्वसनीय, व्यावहारिक एवं कला में निपुण।',
    career: 'बैंकिंग, कला, संगीत, फैशन डिजाइनिंग, होटल, सौन्दर्य प्रसाधन एवं कृषि।',
    health: 'गले एवं श्वास नली का ध्यान रखें। अत्यधिक मीठे भोजन से परहेज करें।',
    mantra: 'ॐ शुं शुक्राय नमः',
    remedy: 'शुक्रवार को छोटी कन्याओं को खीर या सफेद मिष्ठान्न का भोजन कराएं।'
  },
  {
    id: 3,
    name: 'मिथुन राशि (Gemini)',
    sanskrit: 'मिथुन (Gemini)',
    symbol: '👥',
    lord: 'बुध (Budha)',
    element: 'वायु तत्व (Air)',
    luckyColor: 'हरा एवं पीला',
    luckyNumber: '५ एवं ३',
    luckyDay: 'बुधवार',
    gemstone: 'पन्ना (Emerald)',
    traits: 'कुशाग्र बुद्धि, वाकपटु, जिज्ञासु, बहुमुखी प्रतिभा के धनी एवं मिलनसार।',
    career: 'पत्रकारिता, मीडिया, लेखन, आईटी, वाणिज्य, शिक्षण एवं शेयर बाजार।',
    health: 'फेफड़े एवं नसों की दुर्बलता से बचें। नियमित प्राणायाम करें।',
    mantra: 'ॐ बुं बुधाय नमः',
    remedy: 'बुधवार को गौशाला में हरा चारा खिलाएं और भगवान् गणेश जी को दूर्वा अर्पित करें।'
  },
  {
    id: 4,
    name: 'कर्क राशि (Cancer)',
    sanskrit: 'कर्क (Cancer)',
    symbol: '🦀',
    lord: 'चन्द्रमा (Chandra)',
    element: 'जल तत्व (Water)',
    luckyColor: 'चांदी जैसा सफेद एवं क्रीम',
    luckyNumber: '२ एवं ७',
    luckyDay: 'सोमवार',
    gemstone: 'मोती (Pearl)',
    traits: 'भावुक, संवेदनशील, परिवार प्रेमी, कल्पनाशील एवं दयालु स्वभाव।',
    career: 'चिकित्सा, नर्सिंग, शिक्षा, जल उद्योग, डेयरी उत्पाद एवं जनसेवा।',
    health: 'पाचन तन्त्र व मानसिक तनाव पर ध्यान दें। शीतल जल से स्नान करें।',
    mantra: 'ॐ सों सोमाय नमः',
    remedy: 'सोमवार को शिवलिंग पर कच्चा दूध एवं जल अर्पित करें तथा माता का चरण स्पर्श करें।'
  },
  {
    id: 5,
    name: 'सिंह राशि (Leo)',
    sanskrit: 'सिंह (Leo)',
    symbol: '🦁',
    lord: 'सूर्य देव (Surya)',
    element: 'अग्नि तत्व (Fire)',
    luckyColor: 'सुनहरा, नारंगी एवं लाल',
    luckyNumber: '१ एवं ५',
    luckyDay: 'रविवार',
    gemstone: 'माणिक्य (Ruby)',
    traits: 'राजसी ठाठ, आत्मविश्वासी, उदार, निष्कपट एवं जन्मजात नेता।',
    career: 'राजनीति, सरकारी उच्च पद, प्रबन्धन, आभूषण एवं उच्च प्रशासनिक सेवाएं।',
    health: 'हृदय एवं नेत्रों का ध्यान रखें। नित्य सूर्य नमस्कार करें।',
    mantra: 'ॐ घृणिः सूर्याय नमः',
    remedy: 'नित्य प्रातः ताम्बे के लोटे से सूर्य देव को कुमकुम युक्त अर्घ्य समर्पित करें।'
  },
  {
    id: 6,
    name: 'कन्या राशि (Virgo)',
    sanskrit: 'कन्या (Virgo)',
    symbol: '👧',
    lord: 'बुध (Budha)',
    element: 'पृथ्वी तत्व (Earth)',
    luckyColor: 'गहरा हरा एवं नीला',
    luckyNumber: '५ एवं ६',
    luckyDay: 'बुधवार',
    gemstone: 'पन्ना (Emerald)',
    traits: 'विश्लेषणात्मक, परिश्रमी, अनुशासित, व्यावहारिक एवं समस्या निवारक।',
    career: 'चार्टर्ड एकाउंटेंट (CA), शोध, डेटा विश्लेषण, चिकित्सा एवं वकालत।',
    health: 'आंतों एवं त्वचा सम्बन्धी समस्याओं के प्रति सजग रहें। सात्विक आहार लें।',
    mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    remedy: 'पक्षियों को नित्य भीगी हुई हरी मूंग की दाल खिलाएं।'
  },
  {
    id: 7,
    name: 'तुला राशि (Libra)',
    sanskrit: 'तुला (Libra)',
    symbol: '⚖️',
    lord: 'शुक्र (Shukra)',
    element: 'वायु तत्व (Air)',
    luckyColor: 'सफेद एवं हल्का नीला',
    luckyNumber: '६ एवं ९',
    luckyDay: 'शुक्रवार',
    gemstone: 'ओपल / हीरा (Opal/Diamond)',
    traits: 'न्यायप्रिय, सन्तुलित, आकर्षक व्यक्तित्व, शान्तिप्रिय एवं कलात्मक।',
    career: 'न्यायाधीश, वकील, कूटनीति, फिल्म उद्योग, व्यापार एवं इंटीरियर डेकोरेशन।',
    health: 'गुर्दे (Kidney) एवं कमर के निचले हिस्से का ध्यान रखें। पर्याप्त जल पिएं।',
    mantra: 'ॐ शुं शुक्राय नमः',
    remedy: 'माँ महालक्ष्मी के मन्दिर में शुक्रवार को इत्र एवं कमल गट्टे अर्पित करें।'
  },
  {
    id: 8,
    name: 'वृश्चिक राशि (Scorpio)',
    sanskrit: 'वृश्चिक (Scorpio)',
    symbol: '🦂',
    lord: 'मंगल (Mangala)',
    element: 'जल तत्व (Water)',
    luckyColor: 'गहरा लाल एवं मैरून',
    luckyNumber: '९ एवं ४',
    luckyDay: 'मंगलवार',
    gemstone: 'मूंगा (Red Coral)',
    traits: 'गम्भीर, रहस्यमयी, तीव्र इच्छाशक्ति, साहसी एवं निष्ठावान मित्र।',
    career: 'जासूसी, वैज्ञानिक शोध, शल्य चिकित्सा, खनन एवं रक्षा विभाग।',
    health: 'अनिद्रा एवं रक्त विकार से बचें। नियमित ध्यान का अभ्यास करें।',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    remedy: 'मंगलवार को सुन्दरकाण्ड का पाठ करें एवं लाल मसूर की दाल का दान करें।'
  },
  {
    id: 9,
    name: 'धनु राशि (Sagittarius)',
    sanskrit: 'धनु (Sagittarius)',
    symbol: '🏹',
    lord: 'बृहस्पति / गुरु (Guru)',
    element: 'अग्नि तत्व (Fire)',
    luckyColor: 'पीला एवं केसरिया',
    luckyNumber: '३ एवं ९',
    luckyDay: 'गुरुवार',
    gemstone: 'पुखराज (Yellow Sapphire)',
    traits: 'धार्मिक, आशावादी, सत्यवादी, दार्शनिक एवं ज्ञान पिपासु।',
    career: 'प्रोफेसर, आध्यात्मिक उपदेशक, परामर्शदाता, कानून एवं उच्च शिक्षा।',
    health: 'यकृत (Liver) एवं मोटापे के प्रति सावधान रहें। सुपाच्य भोजन करें।',
    mantra: 'ॐ बृं बृहस्पतये नमः',
    remedy: 'गुरुवार को केले के वृक्ष का पूजन करें और माथे पर केसर/चन्दन का तिलक लगाएं।'
  },
  {
    id: 10,
    name: 'मकर राशि (Capricorn)',
    sanskrit: 'मकर (Capricorn)',
    symbol: '🐊',
    lord: 'शनि देव (Shani)',
    element: 'पृथ्वी तत्व (Earth)',
    luckyColor: 'नीला, काला एवं स्लेटी',
    luckyNumber: '८ एवं ४',
    luckyDay: 'शनिवार',
    gemstone: 'नीलम (Blue Sapphire)',
    traits: 'अत्यन्त कर्मठ, महत्वाकांक्षी, अनुशासित, व्यावहारिक एवं धैर्यशील।',
    career: 'इंजीनियरिंग, भवन निर्माण, खनिज, लौह उद्योग, राजनीति एवं न्याय।',
    health: 'जोड़ों का दर्द एवं घुटनों का ध्यान रखें। नियमित व्यायाम करें।',
    mantra: 'ॐ शं शनैश्चराय नमः',
    remedy: 'शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं एवं निर्धनों को भोजन कराएं।'
  },
  {
    id: 11,
    name: 'कुम्भ राशि (Aquarius)',
    sanskrit: 'कुम्भ (Aquarius)',
    symbol: '🏺',
    lord: 'शनि देव (Shani)',
    element: 'वायु तत्व (Air)',
    luckyColor: 'आसमानी नीला एवं बैंगनी',
    luckyNumber: '८ एवं ३',
    luckyDay: 'शनिवार',
    gemstone: 'नीलम / नीली (Blue Sapphire)',
    traits: 'मानवतावादी, नवीन विचारक, स्वतन्त्र चेतना, बुद्धिजीवी एवं दूरदर्शी।',
    career: 'अन्तरिक्ष विज्ञान, अनुसंधान, समाज सेवा, सॉफ्टवेयर विकास एवं आविष्कार।',
    health: 'पैरों की पिंडलियों एवं रक्त परिसंचरण का ध्यान रखें।',
    mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    remedy: 'शनिवार को काले तिल और उड़द की दाल का दान करें।'
  },
  {
    id: 12,
    name: 'मीन राशि (Pisces)',
    sanskrit: 'मीन (Pisces)',
    symbol: '🐟',
    lord: 'बृहस्पति / गुरु (Guru)',
    element: 'जल तत्व (Water)',
    luckyColor: 'हल्दी जैसा पीला एवं श्वेत',
    luckyNumber: '३ एवं ७',
    luckyDay: 'गुरुवार',
    gemstone: 'पुखराज (Yellow Sapphire)',
    traits: 'अत्यन्त दयालु, आध्यात्मिक, सहज ज्ञानी, परोपकारी एवं शान्त।',
    career: 'आध्यात्मिक संस्थान, कला, साहित्य, परामर्श, औषधि एवं जल परिवहन।',
    health: 'पैरों के तलवों एवं रोग प्रतिरोधक क्षमता का ध्यान रखें।',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    remedy: 'गुरुवार को भगवान् विष्णु को पीले पुष्प अर्पित करें और विष्णु सहस्रनाम का पाठ करें।'
  }
];

export default function RashiView({ onBack }) {
  const [selectedRashi, setSelectedRashi] = useState(RASHI_DATA[0]);

  const handleSelectRashi = (rashi) => {
    audioService.playTempleBell(432, 1.0);
    setSelectedRashi(rashi);
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

        <span className="badge-gold font-bold text-xs">१२ राशि फल एवं सम्पूर्ण चरित्र</span>
      </div>

      {/* 12 Rashi Icons Selector Grid */}
      <div className="glass-card p-4 sm:p-5">
        <h3 className="font-dharmik text-base font-bold text-amber-300 mb-3 text-center sm:text-left">
          अपनी राशि का चयन करें (Select Your Zodiac Sign)
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {RASHI_DATA.map(rashi => {
            const isSelected = selectedRashi.id === rashi.id;

            return (
              <button
                key={rashi.id}
                onClick={() => handleSelectRashi(rashi)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-500 shadow-lg scale-105 text-amber-100'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-amber-500/30'
                }`}
              >
                <span className="text-2xl mb-1">{rashi.symbol}</span>
                <span className="text-xs font-bold truncate max-w-[80px]">{rashi.sanskrit.split(' ')[0]}</span>
                <span className="text-[10px] text-amber-400/80 font-mono mt-0.5">{rashi.element.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Rashi Full Profile */}
      {selectedRashi && (
        <div className="glass-card-gold p-6 sm:p-8 space-y-6 animate-fade-in">
          {/* Rashi Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-700 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-500/30 border border-amber-300/40">
                {selectedRashi.symbol}
              </div>
              <div>
                <span className="badge-gold text-[10px]">राशि #{selectedRashi.id} • {selectedRashi.element}</span>
                <h2 className="text-2xl sm:text-3xl font-dharmik font-bold text-amber-200 mt-1">
                  {selectedRashi.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  राशि अधिपति (Lord): <strong className="text-amber-300">{selectedRashi.lord}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/20 text-slate-300">
                रंग: <strong className="text-amber-300">{selectedRashi.luckyColor}</strong>
              </span>
              <span className="bg-slate-900 px-3 py-1.5 rounded-xl border border-cyan-500/20 text-slate-300">
                अंक: <strong className="text-cyan-300">{selectedRashi.luckyNumber}</strong>
              </span>
              <span className="bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-slate-300">
                दिन: <strong className="text-emerald-300">{selectedRashi.luckyDay}</strong>
              </span>
            </div>
          </div>

          {/* Rashi Deep Traits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <strong className="text-amber-300 block font-dharmik font-bold">✨ व्यक्तित्व एवं स्वभाव:</strong>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedRashi.traits}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <strong className="text-cyan-300 block font-dharmik font-bold">💼 अनुकूल करियर एवं व्यवसाय:</strong>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedRashi.career}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <strong className="text-rose-300 block font-dharmik font-bold">🩺 स्वास्थ्य एवं सावधानियां:</strong>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedRashi.health}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <strong className="text-emerald-300 block font-dharmik font-bold">💎 शुभ रत्न एवं धारण विधि:</strong>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedRashi.gemstone}</p>
            </div>
          </div>

          {/* Daily Mantra & Remedy */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-amber-950/40 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <strong className="text-amber-300 text-sm font-dharmik font-bold">🪔 दैनिक राशि मन्त्र:</strong>
              <span className="badge-gold text-[10px]">नित्य १०८ जप</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20 text-center">
              <span className="font-sanskrit text-lg text-amber-200 font-bold tracking-wider">{selectedRashi.mantra}</span>
            </div>

            <div className="text-xs sm:text-sm text-slate-200">
              <strong className="text-amber-400 block mb-0.5">सर्वकार्य सिद्धि उपाय:</strong>
              {selectedRashi.remedy}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
