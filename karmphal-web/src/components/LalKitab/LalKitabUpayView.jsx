import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Sparkles, ShieldCheck, Sun, Coins, Briefcase, Heart, Activity, Users, Flame } from 'lucide-react';
import { audioService } from '../../services/audioService';

const LAL_KITAB_CATEGORIES = [
  {
    id: 'dhan',
    title: 'धन लाभ एवं व्यापार वृद्धि',
    icon: Coins,
    color: 'from-amber-500 to-yellow-600',
    remedies: [
      {
        name: 'चांदी की ठोस गोली धारण करना',
        desc: 'अपनी जेब अथवा तिजोरी में चांदी की एक ठोस गोली (बिना जोड़ की) रखें।',
        benefit: 'शुक्र एवं चन्द्रमा के समन्वय से धन का अनावश्यक अपव्यय रुकता है और बरकत होती है।',
        rules: 'गोली को सदा शुद्ध रखें और किसी अन्य को न दें।'
      },
      {
        name: 'शनिवार को सरसों तेल में छाया पात्र दान',
        desc: 'कांस्य या लोहे के पात्र में सरसों का तेल भरकर उसमें अपना मुख देखकर दान करें।',
        benefit: 'व्यापार में आ रही आकस्मिक रुकावटें दूर होती हैं और ग्राहक वृद्धि होती है।',
        rules: 'यह उपाय शनिवार को दोपहर १२ बजे से पूर्व करें।'
      },
      {
        name: 'ताम्बे के लोटे में जल भरकर सिरहाने रखना',
        desc: 'रात्रि को सोते समय सिरहाने ताम्बे के पात्र में जल रखें और प्रातः उसे बबूल या कांटेदार पौधे की जड़ में डाल दें।',
        benefit: 'व्यापारिक तनाव एवं कर्जे से मुक्ति मिलती है।',
        rules: 'कम से कम ४३ दिन निरन्तर करें।'
      }
    ]
  },
  {
    id: 'naukri',
    title: 'नौकरी एवं करियर पदोन्नति',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-600',
    remedies: [
      {
        name: 'बहते जल में तांबे का सिक्का प्रवाहित करना',
        desc: 'बिना छेद वाला तांबे का गोल सिक्का बहती नदी या स्वच्छ नहर में प्रवाहित करें।',
        benefit: 'सूर्य देव की कृपा से सरकारी नौकरी एवं उच्च पद की प्राप्ति होती है।',
        rules: 'रविवार के दिन सूर्योदय के समय यह उपाय करें।'
      },
      {
        name: 'पक्षियों को ७ प्रकार का अनाज (सतनजा) डालना',
        desc: 'गेहूं, चावल, जौ, चना, मूंग, बाजरा और मक्का मिलाकर नित्य प्रातः पक्षियों को डालें।',
        benefit: 'राहु और केतु के कारण कार्यक्षेत्र में आ रहे अवरोध नष्ट होते हैं।',
        rules: 'छत के स्थान पर खुले मैदान या सार्वजनिक स्थान पर डालें।'
      },
      {
        name: 'काले कुत्ते को मीठी रोटी खिलाना',
        desc: 'तवे पर बनी पहली रोटी पर थोड़ा सा सरसों तेल या मीठा गुड़ लगाकर काले श्वान को खिलाएं।',
        benefit: 'अधिकारियों से सहयोग मिलता है और नौकरी में स्थिरता आती है।',
        rules: 'नित्य अथवा शनिवार को अवश्य करें।'
      }
    ]
  },
  {
    id: 'vivah',
    title: 'विवाह बाधा निवारण',
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    remedies: [
      {
        name: 'केले के वृक्ष में हल्दी युक्त जल अर्पित करना',
        desc: 'गुरुवार के दिन स्नान के जल में चुटकी भर हल्दी डालें और केले की जड़ में हल्दी-मिश्रित जल चढ़ाएं।',
        benefit: 'बृहस्पति देव की अनुकम्पा से शीघ्र योग्य जीवनसाथी की प्राप्ति होती है।',
        rules: 'गुरुवार को पीले वस्त्र धारण करें और नमक का सेवन कम करें।'
      },
      {
        name: 'कन्याओं को हरी चूड़ियां एवं मिष्ठान्न भेंट',
        desc: 'बुधवार के दिन छोटी कन्याओं को हरे रंग की चूड़ियां और बेसन के लड्डू भेंट करें।',
        benefit: 'विवाह में आ रहे रिश्ते बार-बार टूटने का दोष समाप्त होता है।',
        rules: 'मन में पवित्र भाव रखकर आशीर्वाद लें।'
      },
      {
        name: 'सफेद गाय को नित्य गुड़-रोटी खिलाना',
        desc: 'शुक्रवार को विशेष रूप से सफेद गौमाता को घी चुपड़ी रोटी में गुड़ रखकर खिलाएं।',
        benefit: 'सप्तमेश शुक्र प्रबल होकर दांपत्य जीवन के सुख का मार्ग प्रशस्त करता है।',
        rules: 'गौमाता के मस्तक पर तिलक लगाकर प्रणाम करें।'
      }
    ]
  },
  {
    id: 'swasthya',
    title: 'स्वास्थ्य एवं असाध्य रोग मुक्ति',
    icon: Activity,
    color: 'from-emerald-500 to-teal-600',
    remedies: [
      {
        name: 'जौ को दूध से धोकर जल प्रवाह करना',
        desc: 'रोगी के वजन के अनुसार अथवा मुट्ठी भर जौ को कच्चे दूध से धोकर बहते जल में बहाएं।',
        benefit: 'दीर्घकालिक असाध्य रोगों एवं शनि-राहु की पीड़ा से मुक्ति मिलती है।',
        rules: 'सोमवार अथवा शनिवार को दिन के समय करें।'
      },
      {
        name: 'चांदी के गिलास में जल पीना',
        desc: 'नित्य पीने का पानी शुद्ध चांदी के पात्र या गिलास में रखकर ग्रहण करें।',
        benefit: 'चित्त शांत रहता है, अनिद्रा एवं रक्तचाप की समस्या में लाभ होता है।',
        rules: 'चांदी के पात्र को सदैव स्वच्छ रखें।'
      },
      {
        name: 'अस्पताल में मरीजों को औषधि या फल वितरण',
        desc: 'अपने जन्मदिन अथवा शुभ अवसर पर किसी धर्मार्थ चिकित्सालय में निःशुल्क दवा या फल दान करें।',
        benefit: 'अकाल मृत्यु और दुर्घटनाओं का भय समाप्त होता है।',
        rules: 'गुप्त दान का भाव रखें।'
      }
    ]
  },
  {
    id: 'shatru',
    title: 'शत्रु बाधा एवं नजर दोष निवारण',
    icon: ShieldCheck,
    color: 'from-red-500 to-orange-600',
    remedies: [
      {
        name: 'सूखा जटा वाला नारियल जल में प्रवाहित करना',
        desc: 'एक पानी वाला जटा नारियल अपने सिर से ७ बार घड़ी की दिशा में घुमाकर बहते जल में बहा दें।',
        benefit: 'शत्रुओं के षड्यन्त्र एवं नजर दोष की नकारात्मक ऊर्जा तुरन्त कट जाती है।',
        rules: 'मंगलवार या शनिवार की संध्या से पूर्व करें।'
      },
      {
        name: 'घर के मुख्य द्वार पर फिटकरी का टुकड़ा',
        desc: 'काले कपड़े में फिटकरी का एक टुकड़ा बांधकर मुख्य द्वार के ऊपर लटकाएं।',
        benefit: 'घर में नकारात्मक शक्तियों एवं बुरी नजर का प्रवेश रुकता है।',
        rules: 'प्रत्येक मास में एक बार इसे बदलकर नया लगाएं।'
      }
    ]
  },
  {
    id: 'graha',
    title: '९ ग्रहों के सरल लाल किताब उपाय',
    icon: Sun,
    color: 'from-purple-500 to-indigo-600',
    remedies: [
      {
        name: 'सूर्य (Sun): पिता का सम्मान व तांबा दान',
        desc: 'पिता के चरण स्पर्श करें, गुड़ खाकर पानी पिएं और मंदिर में गेहूं व तांबे का दान करें।',
        benefit: 'आत्मविश्वास, यश एवं मान-सम्मान की वृद्धि।',
        rules: 'रविवार को नमक का त्याग हितकर है।'
      },
      {
        name: 'चन्द्र (Moon): माता की सेवा व चांदी धारण',
        desc: 'माता से कभी विवाद न करें, माता के हाथ से चांदी का चौकोर टुकड़ा लेकर अपने पास रखें।',
        benefit: 'मानसिक शान्ति एवं धन की स्थिरता।',
        rules: 'कुएं या जल स्रोत के पास गंदगी न करें।'
      },
      {
        name: 'मंगल (Mars): मीठी रोटी व भाई-प्रेम',
        desc: 'तन्दूर में मीठी रोटी बनाकर कुत्तों व गरीबों को बांटें, भाइयों से मधुर सम्बन्ध रखें।',
        benefit: 'रक्त विकार व क्रोध शान्ति, भूमि लाभ।',
        rules: 'व्यर्थ के वाद-विवाद से बचें।'
      },
      {
        name: 'बुध (Mercury): कन्या पूजन व नाक छिदवाना',
        desc: 'छोटी कन्याओं की सेवा करें, तोते को पिंजरे से मुक्त कराएं, फिटकरी से दांत साफ करें।',
        benefit: 'बुद्धि, व्यापार एवं वाणी में आकर्षण।',
        rules: 'घर में खराब इलेक्ट्रॉनिक सामान न रखें।'
      },
      {
        name: 'गुरु (Jupiter): पीपल पूजन व केसर तिलक',
        desc: 'माथे, नाभि और जिह्वा पर नित्य केसर का तिलक लगाएं, पीपल की सेवा करें।',
        benefit: 'ज्ञान, सन्तान सुख एवं भाग्य वृद्धि।',
        rules: 'पुस्तकों का अनादर न करें।'
      },
      {
        name: 'शुक्र (Venus): गौसेवा व स्वच्छ वस्त्र',
        desc: 'नित्य स्वच्छ व सुगंधित वस्त्र पहनें, पत्नी का सम्मान करें, गाय को हरा चारा व गुड़ खिलाएं।',
        benefit: 'वैवाहिक सुख, ऐश्वर्य एवं आकर्षण।',
        rules: 'चरित्र को सदैव निष्कलंक रखें।'
      },
      {
        name: 'शनि (Saturn): तेल दान व कौवों को रोटी',
        desc: 'शनिवार को सरसों तेल का दान करें, कौवों और अंधे व्यक्तियों को भोजन कराएं।',
        benefit: 'कष्टों, मुकदमों एवं कर्ज से मुक्ति।',
        rules: 'मदिरा और जुए से सर्वथा दूर रहें।'
      },
      {
        name: 'राहु (Rahu): मूली दान व ससुराल से सम्बन्ध',
        desc: 'रात्रि को सिरहाने मूली रखकर प्रातः मंदिर में दान करें, रसोई में बैठकर भोजन करें।',
        benefit: 'भ्रम, अनिद्रा एवं अचानक नुकसान से बचाव।',
        rules: 'ससुराल पक्ष से मधुर सम्बंध रखें।'
      },
      {
        name: 'केतु (Ketu): दोरंगी कम्बल व तिल दान',
        desc: 'काले-सफेद रंग का कम्बल किसी असहाय साधु को दान करें, कान में सोना धारण करें।',
        benefit: 'सन्तान सुख, जोड़ों के दर्द से मुक्ति।',
        rules: 'कुत्तों को कभी न सताएं।'
      }
    ]
  }
];

export default function LalKitabUpayView({ onBack }) {
  const [activeCategory, setActiveCategory] = useState(LAL_KITAB_CATEGORIES[0]);

  const handleSelectCategory = (cat) => {
    audioService.playTempleBell(432, 1.0);
    setActiveCategory(cat);
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

        <span className="badge-gold font-bold text-xs">लाल किताब सम्पूर्ण महा-उपाय</span>
      </div>

      {/* Hero Banner */}
      <div className="glass-card-gold p-6 sm:p-8 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-gold">अचूक पारम्परिक लाल किताब उपाय</span>
            <span className="badge-saffron">दिन के समय करने का विधान</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-dharmik font-bold text-amber-200 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>लाल किताब सर्व-समस्या निवारक महा-उपाय</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
            धन, व्यापार, नौकरी, विवाह, स्वास्थ्य, शत्रु शान्ति एवं नवग्रहों के लिए बिना महंगे रत्नों के अत्यंत सरल, सात्विक एवं प्रामाणिक टोटके व उपाय।
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {LAL_KITAB_CATEGORIES.map(cat => {
          const isSelected = activeCategory.id === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs whitespace-nowrap font-bold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg scale-105'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-amber-500/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Remedies List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-dharmik text-lg font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{activeCategory.title} — विस्तारपूर्वक उपाय</span>
          </h3>
          <span className="text-xs text-slate-400">कुल {activeCategory.remedies.length} सिद्ध उपाय</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCategory.remedies.map((rem, idx) => (
            <div key={idx} className="glass-card p-5 sm:p-6 flex flex-col justify-between space-y-4 border-l-4 border-amber-400 hover:border-amber-500/80 transition-all">
              <div>
                <span className="badge-gold text-[10px] mb-2 inline-block">उपाय #{idx + 1}</span>
                <h4 className="font-dharmik text-base font-bold text-amber-200">
                  {rem.name}
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed font-sans">
                  {rem.desc}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-emerald-300">
                  <strong className="block text-[11px] text-emerald-400 mb-0.5">✨ लाभ / फल:</strong>
                  {rem.benefit}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-amber-200">
                  <strong className="block text-[11px] text-amber-400 mb-0.5">⚠️ शास्त्रीय नियम व सावधानी:</strong>
                  {rem.rules}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Golden Rules of Lal Kitab */}
      <div className="glass-card p-6 border-t-4 border-purple-500 space-y-3">
        <h4 className="font-dharmik text-base font-bold text-purple-300 flex items-center gap-2">
          <span>📜 लाल किताब के आधारभूत नियम एवं सावधानियां</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-200 font-sans">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <strong className="text-amber-300 block mb-1">१. दिन के समय उपाय:</strong>
            लाल किताब के सभी उपाय केवल सूर्य के प्रकाश में (दिन के समय) किए जाने चाहिए। रात्रि में उपाय वर्जित हैं।
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <strong className="text-cyan-300 block mb-1">२. ४० से ४३ दिन की निरन्तरता:</strong>
            जो उपाय निरन्तर करने को कहा जाए, उसे बिना किसी बाधा के लगातार ४३ दिन पूर्ण करें।
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <strong className="text-emerald-300 block mb-1">३. सात्विक जीवन एवं सेवा:</strong>
            उपाय के दौरान मांस, मदिरा एवं अनैतिक कर्मों से दूर रहें तथा माता-पिता व बुजुर्गों का आशीर्वाद लें।
          </div>
        </div>
      </div>
    </div>
  );
}
