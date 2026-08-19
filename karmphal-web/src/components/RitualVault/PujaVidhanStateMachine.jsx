import React, { useState } from 'react';
import { Bell, Sparkles, ChevronRight, ChevronLeft, Check, ShieldCheck, Award } from 'lucide-react';
import { storageService } from '../../services/storageService';
import confetti from 'canvas-confetti';

const PUJA_STAGES = [
  {
    id: 1,
    name: '१. आचमन एवं पवित्रीकरण',
    desc: 'हृदय, वाणी एवं मन की शुद्धि हेतु ताम्र पात्र से त्रिवार जल ग्रहण।',
    mantra: 'ॐ केशवाय नमः स्वाहा । ॐ नारायणाय नमः स्वाहा । ॐ माधवाय नमः स्वाहा ।\nॐ हृषीकेशाय नमः (हस्त प्रक्षालन) ॥',
    action: 'दाहिने हाथ में जल लेकर तीन बार आचमन करें और हाथ धो लें।',
    accentNote: 'उदात्त (उच्च स्वर), अनुदात्त (मन्द्र स्वर) एवं स्वरित (मध्यम स्वर) का ध्यान रखें।'
  },
  {
    id: 2,
    name: '२. प्राणायाम एवं नाड़ी शोधन',
    desc: 'इड़ा, पिङ्गला एवं सुषुम्ना नाड़ियों का शोधन तथा प्राण वायु का नियमन।',
    mantra: 'ॐ प्रणवस्य परब्रह्म ऋषिः परमात्मा देवता दैवी गायत्री छन्दः प्राणायामे विनियोगः ॥\nॐ भूः ॐ भुवः ॐ स्वः ॐ महः ॐ जनः ॐ तपः ॐ सत्यम् ॥',
    action: 'पूरक, कुम्भक और रेचक द्वारा तीन बार प्राण वायु का नियमन करें।',
    accentNote: 'कुम्भक काल में मन ही मन मन्त्र का स्मरण करें।'
  },
  {
    id: 3,
    name: '३. देश-काल सङ्कल्प',
    desc: 'वर्तमान संवत्सर, अयन, ऋतु, मास, पक्ष, तिथि एवं अपने गोत्र-नाम का उच्चारण।',
    mantra: 'ॐ तत्सत् अद्य श्रीब्रह्मणो द्वितीये परार्धे श्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे कलियुगे कलिप्रथमचरणे...',
    action: 'अक्षत, पुष्प और जल हाथ में लेकर पूर्व दिशा की ओर मुख करके सङ्कल्प छोड़ें।',
    accentNote: 'सङ्कल्प से मानसिक एकाग्रता एवं कर्म का फल सुनिश्चित होता है।'
  },
  {
    id: 4,
    name: '४. ध्यान एवं आवाहन',
    desc: 'इष्ट देव अथवा भगवान् सूर्यनारायण के दिव्य रूप का हृदय कमल में चिन्तन।',
    mantra: 'ध्येयः सदा सवितृमण्डलमध्यवर्ती नारायणः सरसिजासनसन्निविष्टः ।\nकेयूरवान् मकरकुण्डलवान् किरीटी हारी हिरण्मयवपुर्धृतशङ्खचक्रः ॥',
    action: 'हाथ जोड़कर भगवान् का आवाहन एवं पाद्य-अर्घ्य समर्पित करें।',
    accentNote: 'सात्विक भाव से प्रभु के सगुण साकार रूप का ध्यान करें।'
  },
  {
    id: 5,
    name: '५. षोडशोपचार पूजन',
    desc: 'पाद्य, अर्घ्य, आचमन, स्नान, वस्त्र, यज्ञोपवीत, चन्दन, पुष्प, धूप, दीप, नैवेद्य आदि १६ उपचार।',
    mantra: 'ॐ इदं पाद्यम्, इदम् अर्घ्यम्, इदम् आचमनीयम्, स्नानीयं जलं समर्पयामि ।\nगन्धं, पुष्पं, धूपं, दीपं, नैवेद्यं ताम्बूलं च निवेदयामि ॥',
    action: 'क्रमशः गन्ध, अक्षत, पुष्प, धूप, दीप और मिष्ठान्न नैवेद्य अर्पित करें।',
    accentNote: 'घण्टा नाद करते हुए धूप-दीप अर्पित करें।'
  },
  {
    id: 6,
    name: '६. महा आरती एवं पुष्पाञ्जलि',
    desc: 'कपूर अथवा पञ्चमुखी दीप द्वारा भगवान् की आरती एवं मन्त्रपुष्पाञ्जलि।',
    mantra: 'कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम् ।\nसदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि ॥\nॐ यज्ञेन यज्ञमयजन्त देवास्तानि धर्माणि प्रथमान्यासन् ॥',
    action: 'खड़े होकर आरती घुमाएं और दोनों हाथों से पुष्पाञ्जलि अर्पित करें।',
    accentNote: 'आरती लेते समय दोनों हथेलियों को दीप शिखा पर स्पर्श कर नेत्रों से लगाएं।'
  },
  {
    id: 7,
    name: '७. क्षमा प्रार्थना एवं पूर्णाहूति',
    desc: 'पूजन में ज्ञात-अज्ञात त्रुटियों हेतु भगवान् से क्षमा याचना एवं समर्पण।',
    mantra: 'आवाहनं न जानामि न जानामि विसर्जनम् । पूजां चैव न जानामि क्षमस्व परमेश्वर ॥\nयदक्षरपदभ्रष्टं मात्राहीनं च यद्भवेत् । तत्सर्वं क्षम्यतां देव प्रसीद परमेश्वर ॥',
    action: 'साष्टाङ्ग अथवा पञ्चाङ्ग प्रणाम करके चरणामृत व प्रसाद ग्रहण करें।',
    accentNote: 'समस्त पूजा का फल भगवान् श्रीमन नारायण को समर्पित करें।'
  }
];

export default function PujaVidhanStateMachine() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const stage = PUJA_STAGES[currentStageIndex];

  const handleNext = () => {
    if (currentStageIndex < PUJA_STAGES.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    } else {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      storageService.addPunya(50, '७-चरणीय नित्य पूजा विधान पूर्णाहूति');
    }
  };

  const handlePrev = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card-gold p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">७-चरणीय शास्त्रोक्त नित्य पूजा विधान</span>
              <span className="badge-saffron">वैदिक स्वर क्रम</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#F3CA9D] flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#E0A96D]" />
              <span>नित्य पूजा विधान एवं षोडशोपचार क्रम</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl font-sans">
              आचमन से क्षमा प्रार्थना तक ७ सोपानों में विभाजित प्रामाणिक दैनिक देव-पूजा क्रम एवं मन्त्रोच्चार निर्देश।
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar of 7 Stages */}
      <div className="glass-card p-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {PUJA_STAGES.map((s, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={s.id}
                onClick={() => setCurrentStageIndex(idx)}
                className={`flex-1 p-2.5 rounded-2xl border cursor-pointer text-center transition-all ${
                  isCurrent
                    ? 'bg-[#C58B4E]/30 border-[#E0A96D] text-[#FFF] shadow-lg scale-105'
                    : isCompleted
                    ? 'bg-[#1C1008] border-emerald-500/40 text-emerald-300'
                    : 'bg-[#140B06] border-[#C58B4E]/20 text-[#A67C52]'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                  {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span>चरण #{s.id}</span>}
                </div>
                <div className="text-xs font-bold mt-1 truncate">{s.name.split('.')[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Active Stage Detailed Ritual Card */}
      <div className="glass-card-gold p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C58B4E]/20">
          <div>
            <span className="badge-gold text-xs">चरण {currentStageIndex + 1} / ७</span>
            <h3 className="text-2xl font-serif font-bold text-[#F3CA9D] mt-1">{stage.name}</h3>
            <p className="text-xs text-slate-300 mt-1 font-sans">{stage.desc}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStageIndex === 0}
              className="p-2.5 rounded-xl bg-[#140B06] border border-[#C58B4E]/30 text-slate-300 hover:text-[#F3CA9D] disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="btn-gold px-5 py-2.5"
            >
              <span>{currentStageIndex === PUJA_STAGES.length - 1 ? 'पूजा पूर्णाहूति (+५० पुण्य)' : 'अगला चरण'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sanskrit Mool Mantra */}
        <div className="p-5 rounded-2xl bg-[#140B06] border border-[#C58B4E]/30">
          <div className="text-xs text-[#E0A96D] font-bold mb-2 flex items-center justify-between">
            <span>शास्त्रोक्त मन्त्र (Sanskrit Mantra)</span>
            <span className="text-[11px] text-[#C58B4E]">{stage.accentNote}</span>
          </div>
          <pre className="font-sanskrit text-base text-[#F7E7D6] whitespace-pre-line leading-relaxed">
            {stage.mantra}
          </pre>
        </div>

        {/* Practical Action Instruction */}
        <div className="p-4 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/20 text-xs">
          <strong className="text-[#E0A96D] block font-bold mb-1">क्रिया निर्देश (Action To Perform):</strong>
          <p className="text-[#E6D0BA] text-sm leading-relaxed font-sans">{stage.action}</p>
        </div>
      </div>
    </div>
  );
}
