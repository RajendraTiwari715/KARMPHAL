import React, { useState } from 'react';
import PanchangView from '../components/AstrologicalCore/PanchangView';
import KundaliView from '../components/AstrologicalCore/KundaliView';
import VivahMilanView from '../components/VivahMilan/VivahMilanView';
import RashiView from '../components/AstrologicalCore/RashiView';
import VastuView from '../components/VastuShastra/VastuView';
import LalKitabUpayView from '../components/LalKitab/LalKitabUpayView';
import { Calendar, Compass, HeartHandshake, Star, Home, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { audioService } from '../services/audioService';

const JYOTISH_MODULES = [
  {
    id: 'panchang',
    title: '१. दैनिक पञ्चाङ्ग',
    subtitle: 'शुद्ध वैदिक हिन्दू कैलेण्डर एवं त्यौहार',
    desc: 'तिथि, नक्षत्र, योग, करण, वार, अभिजित व राहु काल मुहूर्त, अंग्रेजी दिनांक व समय एवं वर्ष भर के प्रमुख व्रत-पर्व।',
    icon: Calendar,
    color: 'from-amber-500 to-orange-600',
    badge: 'दैनिक पञ्चाङ्ग'
  },
  {
    id: 'kundali',
    title: '२. जन्म कुण्डली एवं जीवन चक्र',
    subtitle: 'नाम, जन्म तिथि व समय से सम्पूर्ण पत्रिका',
    desc: 'लग्न कुण्डली चक्र (उत्तर व दक्षिण), मांगलिक, कालसर्प व शनि साढ़े साती दोष परीक्षण, तथा करियर व सफलता कब मिलेगी इसका सटीक फलकथन।',
    icon: Compass,
    color: 'from-blue-500 to-indigo-600',
    badge: 'जन्म पत्रिका'
  },
  {
    id: 'vivah',
    title: '३. ३६ गुण विवाह मिलन',
    subtitle: 'वर एवं कन्या कुण्डली गुण मिलान',
    desc: 'वर-वधू के नाम व जन्म विवरण से अष्टकूट (वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट, नाड़ी) ३६ गुण मिलान एवं दोष परिहार।',
    icon: HeartHandshake,
    color: 'from-rose-500 to-pink-600',
    badge: 'अष्टकूट मिलान'
  },
  {
    id: 'rashi',
    title: '४. १२ राशि फल एवं ज्ञान',
    subtitle: 'मेष से मीन पर्यन्त सम्पूर्ण राशि विवरण',
    desc: 'अपनी राशि पर क्लिक करके अपना स्वभाव, अनुकूल करियर, स्वास्थ्य, शुभ रंग, शुभ अंक, शुभ दिन, रत्न एवं दैनिक सिद्ध मन्त्र जानें।',
    icon: Star,
    color: 'from-yellow-500 to-amber-600',
    badge: 'राशि ज्ञान'
  },
  {
    id: 'vastu',
    title: '५. वास्तु शास्त्र एवं गृह मण्डल',
    subtitle: '१६ दिशाएं, कक्ष अनुकूलता एवं उपाय',
    desc: 'किस दिशा में क्या निर्माण होना चाहिए और क्या नहीं, वास्तु दोष का क्या प्रभाव होता है, तथा बिना तोड़-फोड़ के सरल वैदिक उपाय।',
    icon: Home,
    color: 'from-emerald-500 to-teal-600',
    badge: '१६-कोणीय वास्तु'
  },
  {
    id: 'lalkitab',
    title: '६. लाल किताब के महा-उपाय',
    subtitle: 'धन, नौकरी, विवाह, स्वास्थ्य व नवग्रह उपाय',
    desc: 'व्यापार वृद्धि, सरकारी नौकरी, विवाह बाधा निवारण, असाध्य रोग मुक्ति, शत्रु शान्ति एवं सूर्य से केतु तक ९ ग्रहों के अचूक उपाय।',
    icon: BookOpen,
    color: 'from-purple-500 to-indigo-600',
    badge: 'लाल किताब'
  }
];

export default function JyotishSection({ panchangData }) {
  const [activeModule, setActiveModule] = useState(null); // 'panchang', 'kundali', 'vivah', 'rashi', 'vastu', 'lalkitab'

  const handleOpenModule = (moduleId) => {
    audioService.playTempleBell(432, 1.2);
    setActiveModule(moduleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHub = () => {
    audioService.playBeadClick();
    setActiveModule(null);
  };

  // Render Sub-Module Pages
  if (activeModule === 'panchang') {
    return <PanchangView onBack={handleBackToHub} panchangData={panchangData} />;
  }

  if (activeModule === 'kundali') {
    return <KundaliView onBack={handleBackToHub} />;
  }

  if (activeModule === 'vivah') {
    return <VivahMilanView onBack={handleBackToHub} />;
  }

  if (activeModule === 'rashi') {
    return <RashiView onBack={handleBackToHub} />;
  }

  if (activeModule === 'vastu') {
    return <VastuView onBack={handleBackToHub} />;
  }

  if (activeModule === 'lalkitab') {
    return <LalKitabUpayView onBack={handleBackToHub} />;
  }

  // Master Jyotish Hub View (6 Cards Grid)
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 6 Jyotish Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {JYOTISH_MODULES.map(mod => {
          const Icon = mod.icon;

          return (
            <div
              key={mod.id}
              onClick={() => handleOpenModule(mod.id)}
              className="glass-card p-6 flex flex-col justify-between cursor-pointer group hover:border-amber-500/60 hover:scale-[1.02] transition-all relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-gold text-[10px]">{mod.badge}</span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-dharmik text-lg sm:text-xl font-bold text-amber-200 group-hover:text-amber-300 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-amber-400/80 font-medium mt-0.5">
                  {mod.subtitle}
                </p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed font-sans line-clamp-3">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">क्लिक करके खोलें</span>
                <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>प्रवेश करें</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
