import React, { useState } from 'react';
import { Compass, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Home, Info } from 'lucide-react';
import { VASTU_ZONES_16, evaluateRoomPlacement } from '../../services/vastuEngine';
import { audioService } from '../../services/audioService';

export default function VastuMandala16() {
  const [selectedZone, setSelectedZone] = useState(VASTU_ZONES_16[0]); // N (उत्तर)
  const [roomType, setRoomType] = useState('pujaRoom');
  const [roomPlacementZone, setRoomPlacementZone] = useState('NNE');

  const evaluation = evaluateRoomPlacement(roomType, roomPlacementZone);

  const roomOptions = [
    { id: 'pujaRoom', label: 'पूजा घर / ध्यान कक्ष' },
    { id: 'kitchen', label: 'रसोई घर (अग्नि स्थान)' },
    { id: 'masterBed', label: 'मुख्य शयन कक्ष (Master Bedroom)' },
    { id: 'studyRoom', label: 'अध्ययन कक्ष (Study Room)' },
    { id: 'toilet', label: 'शौचालय / जल विसर्जन' },
    { id: 'mainDoor', label: 'मुख्य प्रवेश द्वार' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card-gold p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">१६-कोणीय वास्तु पुरुष मण्डल</span>
              <span className="badge-saffron">पञ्चमहाभूत सन्तुलन एवं अ-विनाशक उपाय</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              <span>१६-कोणीय वास्तु मण्डल एवं कक्ष अनुकूलता चक्र</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              ब्रह्मस्थान से २२.५° कोणीय विस्तार पर आधारित १६ दिशाओं के अधिष्ठाता देवता, पञ्चतत्व (जल, अग्नि, पृथ्वी, वायु, आकाश) सन्तुलन तथा धातु पट्टी व रंग आधारित अ-विनाशक समाधान।
            </p>
          </div>
        </div>
      </div>

      {/* 16-Zone Interactive Compass Grid & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 16-Zone Compass Selector */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-amber-200 mb-1 flex items-center justify-between">
              <span>१६ वास्तु दिशामण्डल चक्र (२२.५° प्रत्येक)</span>
              <span className="text-[10px] text-amber-400 font-mono">ब्रह्मस्थान केन्द्र</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              किसी भी दिशा खण्ड पर क्लिक करके उसकी तत्वीय ऊर्जा एवं अधिष्ठाता देवता की जानकारी देखें।
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VASTU_ZONES_16.map(zone => {
                const isSelected = selectedZone.code === zone.code;

                return (
                  <button
                    key={zone.code}
                    onClick={() => {
                      audioService.playBeadClick();
                      setSelectedZone(zone);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-500 text-amber-100 shadow-md scale-[1.02]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{zone.code}</span>
                      <span className="text-[10px] text-amber-400 font-mono">{zone.angle}°</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-200 mt-1 truncate">
                      {zone.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {zone.element}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-950/20 border border-amber-500/20 rounded-2xl text-xs text-amber-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              केन्द्रिय ब्रह्मस्थान को सदा रिक्त, स्वच्छ व प्रकाशयुक्त रखें। यहाँ कभी भी भारी स्तम्भ न बनाएं।
            </span>
          </div>
        </div>

        {/* Right Column: Selected Zone In-Depth Architectural Card */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
              <div>
                <span className="badge-gold text-xs">{selectedZone.code} ({selectedZone.angle}° विस्तार)</span>
                <h3 className="text-xl font-serif font-bold text-amber-200 mt-1">
                  {selectedZone.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-bold">पञ्चमहाभूत तत्व</span>
                <span className="text-sm font-bold text-cyan-300">{selectedZone.element}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block font-bold mb-0.5">अधिष्ठाता देवता / ऊर्जा क्षेत्र</span>
                <span className="text-slate-100 font-semibold">{selectedZone.deity}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block font-bold mb-0.5">आध्यात्मिक गुणधर्म एवं जीवन प्रभाव</span>
                <span className="text-slate-200">{selectedZone.domain}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block font-bold mb-0.5">अनुकूल निर्माण (Ideal Activity)</span>
                <span className="text-emerald-300 font-semibold">{selectedZone.ideal}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block font-bold mb-0.5">वर्जित निर्माण (Avoid Activity)</span>
                <span className="text-rose-300 font-semibold">{selectedZone.avoid}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs">
            <strong className="text-amber-400 font-bold block mb-1">अ-विनाशक वास्तु दोष निवारण (Non-Destructive Remedy):</strong>
            <span className="text-amber-200">{selectedZone.remedy}</span>
          </div>
        </div>
      </div>

      {/* Room Placement Evaluator Tool */}
      <div className="glass-card p-6 border-t-4 border-amber-500">
        <h3 className="font-serif text-lg font-bold text-amber-200 mb-2 flex items-center gap-2">
          <Home className="w-5 h-5 text-amber-400" />
          <span>गृह कक्ष अनुकूलता एवं वास्तु दोष मूल्यांकन यन्त्र</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          अपने घर के किसी भी कक्ष की दिशा चुनकर वास्तु अनुकूलता अंक तथा दोष परिहार उपाय देखें।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">कक्ष प्रकार (Room Type)</label>
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
            <label className="block text-xs font-bold text-slate-300 mb-1">वर्तमान दिशा खण्ड (Zone)</label>
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
            <div className={`w-full p-3.5 rounded-2xl border flex items-center justify-between ${
              evaluation.score >= 80 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : evaluation.score >= 50 
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div>
                <span className="text-xs font-bold block">{evaluation.verdict}</span>
                <span className="text-[11px] text-slate-300 mt-0.5 block">{evaluation.advice}</span>
              </div>
              <span className="text-2xl font-black font-mono ml-4">{evaluation.score} %</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
