import React, { useState } from 'react';
import { ArrowLeft, Compass, Sparkles, Home, ShieldCheck, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { VASTU_ZONES_16, evaluateRoomPlacement } from '../../services/vastuEngine';
import { audioService } from '../../services/audioService';

export default function VastuView({ onBack }) {
  const [selectedZone, setSelectedZone] = useState(VASTU_ZONES_16[0]); // N (उत्तर)
  const [roomType, setRoomType] = useState('pujaRoom');
  const [roomPlacementZone, setRoomPlacementZone] = useState('NE');

  const evaluation = evaluateRoomPlacement(roomType, roomPlacementZone);

  const roomOptions = [
    { id: 'pujaRoom', label: 'पूजा घर / ध्यान मन्दिर' },
    { id: 'kitchen', label: 'रसोई घर (अग्नि स्थान)' },
    { id: 'masterBed', label: 'मुख्य शयन कक्ष (Master Bedroom)' },
    { id: 'studyRoom', label: 'अध्ययन कक्ष (Study Room)' },
    { id: 'toilet', label: 'शौचालय / जल विसर्जन' },
    { id: 'mainDoor', label: 'मुख्य प्रवेश द्वार' }
  ];

  const handleSelectZone = (zone) => {
    audioService.playBeadClick();
    setSelectedZone(zone);
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

        <span className="badge-gold font-bold text-xs">१६-कोणीय वास्तु पुरुष मण्डल</span>
      </div>

      {/* Hero Banner */}
      <div className="glass-card-gold p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">वास्तु शास्त्र सम्पूर्ण ज्ञान</span>
              <span className="badge-saffron">पञ्चमहाभूत एवं दिशा सन्तुलन</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-dharmik font-bold text-amber-200 flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              <span>वास्तु शास्त्र एवं गृह दिशा अनुकूलता यन्त्र</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
              कौन सी दिशा में क्या निर्माण होना चाहिए, किस दिशा में दोष होने पर क्या प्रभाव पड़ता है, तथा बिना तोड़-फोड़ के अ-विनाशक धातु व रंग आधारित सरल वैदिक उपाय।
            </p>
          </div>
        </div>
      </div>

      {/* Room Placement Evaluator Tool */}
      <div className="glass-card p-6 border-t-4 border-amber-500 space-y-4">
        <h3 className="font-dharmik text-lg font-bold text-amber-300 flex items-center gap-2">
          <Home className="w-5 h-5 text-amber-400" />
          <span>कक्ष अनुकूलता एवं वास्तु दोष परीक्षण (Room Placement Checker)</span>
        </h3>
        <p className="text-xs text-slate-400 font-sans">
          अपने घर का कोई भी कमरा और उसकी दिशा चुनें, यन्त्र आपको बताएगा कि वह स्थान कितना शुभ है और यदि कोई दोष है तो उसका क्या उपाय है।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">कक्ष का प्रकार (Room Type)</label>
            <select
              value={roomType}
              onChange={e => setRoomType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-amber-400 font-sans"
            >
              {roomOptions.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">वर्तमान दिशा (Direction)</label>
            <select
              value={roomPlacementZone}
              onChange={e => setRoomPlacementZone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-amber-400 font-sans"
            >
              {VASTU_ZONES_16.map(z => (
                <option key={z.code} value={z.code}>{z.code} - {z.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center">
            <div className={`w-full p-4 rounded-2xl border flex items-center justify-between ${
              evaluation.score >= 80 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : evaluation.score >= 50 
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div>
                <span className="text-xs font-bold block">{evaluation.verdict}</span>
                <span className="text-[11px] text-slate-200 mt-0.5 block font-sans">{evaluation.advice}</span>
              </div>
              <span className="text-2xl font-black font-mono ml-4 shrink-0">{evaluation.score}%</span>
            </div>
          </div>
        </div>

        {evaluation.remedy && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs text-amber-200">
            <strong className="text-amber-400 font-bold block mb-0.5">शास्त्रोक्त अ-विनाशक उपाय:</strong>
            {evaluation.remedy}
          </div>
        )}
      </div>

      {/* 16 Zones Interactive Encyclopedia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Zone Selector Buttons */}
        <div className="lg:col-span-6 glass-card p-6 space-y-4">
          <div>
            <h3 className="font-dharmik text-base font-bold text-amber-200 flex items-center justify-between">
              <span>१६ वास्तु दिशा मण्डल चक्र</span>
              <span className="text-[10px] text-amber-400 font-mono">ब्रह्मस्थान केन्द्र</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              किसी भी दिशा पर क्लिक करके उसकी तत्वीय ऊर्जा, क्या होना चाहिए और क्या नहीं, इसका विस्तार देखें।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VASTU_ZONES_16.map(zone => {
              const isSelected = selectedZone.code === zone.code;

              return (
                <button
                  key={zone.code}
                  onClick={() => handleSelectZone(zone)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-500 text-amber-100 shadow-md scale-105'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{zone.code}</span>
                    <span className="text-[10px] text-amber-400 font-mono">{zone.angle}°</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                    {zone.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {zone.element.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Zone Full Deep-Dive */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3">
              <div>
                <span className="badge-gold text-[10px]">{selectedZone.code} ({selectedZone.angle}° विस्तार)</span>
                <h3 className="text-xl sm:text-2xl font-dharmik font-bold text-amber-200 mt-1">
                  {selectedZone.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">तत्व</span>
                <span className="text-xs sm:text-sm font-bold text-cyan-300">{selectedZone.element}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block font-bold mb-0.5">अधिष्ठाता देवता / ऊर्जा:</span>
                <span className="text-slate-100 font-semibold">{selectedZone.deity}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block font-bold mb-0.5">जीवन पर प्रभाव:</span>
                <span className="text-slate-200">{selectedZone.domain}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block font-bold mb-0.5">यहाँ क्या होना चाहिए (अनुकूल निर्माण):</span>
                <span className="text-emerald-300 font-semibold">{selectedZone.ideal}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block font-bold mb-0.5">यहाँ क्या नहीं होना चाहिए (वर्जित):</span>
                <span className="text-rose-300 font-semibold">{selectedZone.avoid}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs">
            <strong className="text-amber-400 font-bold block mb-1">दोष निवारण सरल उपाय (Non-Destructive Remedy):</strong>
            <span className="text-amber-200">{selectedZone.remedy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
