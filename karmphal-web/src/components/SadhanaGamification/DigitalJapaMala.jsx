import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, RotateCcw, ShieldCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';
import { useJapaTelemetry } from './useJapaTelemetry';
import { Button, Badge, Card } from '../shared';

const MANTRAS = [
  { id: 'gayatri', name: 'गायत्री महामन्त्र', text: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥', syllables: 24, minSeconds: 2.88 },
  { id: 'mahamrityunjaya', name: 'महामृत्युञ्जय मन्त्र', text: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात् ॥', syllables: 32, minSeconds: 3.84 },
  { id: 'hare_krishna', name: 'हरे कृष्ण महामन्त्र', text: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे । हरे राम हरे राम राम राम हरे हरे ॥', syllables: 32, minSeconds: 3.84 },
  { id: 'om_namah_shivaya', name: 'शिव पञ्चाक्षर मन्त्र', text: 'ॐ नमः शिवाय', syllables: 5, minSeconds: 0.60 }
];

export default function DigitalJapaMala() {
  const [selectedMantra, setSelectedMantra] = useState(MANTRAS[0]);
  const [isSwadhyayaRunning, setIsSwadhyayaRunning] = useState(false);
  const [swadhyayaMinutes, setSwadhyayaMinutes] = useState(0);
  const [tasks, setTasks] = useState(() => storageService.getState().tasks || []);

  const { beadCount, malaCycle, antiCheatStatus, handleBeadChant, resetMala } = useJapaTelemetry(selectedMantra);

  // Swadhyaya Timer logic
  useEffect(() => {
    let interval = null;
    if (isSwadhyayaRunning) {
      interval = setInterval(() => {
        setSwadhyayaMinutes(prev => prev + 1);
        storageService.addPunya(2, 'स्वाध्याय ग्रन्थ अध्ययन');
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isSwadhyayaRunning]);

  const handleTaskToggle = (taskId) => {
    audioService.playTempleBell(528, 0.8);
    storageService.toggleTask(taskId);
    setTasks([...(storageService.getState().tasks || [])]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card variant="gold" className="p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold">१०८ मनके पारम्परिक जप माला</Badge>
              <Badge variant="saffron">अक्षर वेग रक्षक तकनीक</Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-dharmik font-bold text-amber-200 flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-400" />
              <span>डिजिटल जप माला, नित्य कर्म एवं स्वाध्याय</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
              १०८वें मनके पर मेरु घण्टा नाद, सात्विक नित्य कर्म चेकलिस्ट एवं ग्रन्थ स्वाध्याय समय-मापक।
            </p>
          </div>
        </div>
      </Card>

      {/* Main Mala & Sadhana Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 108 Bead Japa Mala */}
        <Card variant="glass" className="lg:col-span-6 p-6 flex flex-col justify-between items-center text-center relative overflow-hidden">
          {/* Mantra Selector */}
          <div className="w-full mb-4">
            <label className="block text-xs font-bold text-slate-300 mb-1 text-left">इष्ट मन्त्र चयन करें</label>
            <select
              value={selectedMantra.id}
              onChange={(e) => {
                const found = MANTRAS.find(m => m.id === e.target.value);
                if (found) {
                  setSelectedMantra(found);
                  resetMala();
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 text-amber-300 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 font-sans"
            >
              {MANTRAS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Active Mantra Shloka Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 mb-6 w-full shadow-inner">
            <pre className="font-sanskrit text-sm text-amber-200 whitespace-pre-line leading-relaxed font-bold">
              {selectedMantra.text}
            </pre>
          </div>

          {/* 108 Bead Visual Circular Dial */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Outer Progress Circle */}
            <svg className="w-56 h-56 transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={2 * Math.PI * 96 * (1 - beadCount / 108)}
                strokeLinecap="round"
                className="text-amber-400 transition-all duration-150"
                fill="transparent"
              />
            </svg>

            {/* Inner Tap Button */}
            <button
              onClick={handleBeadChant}
              className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex flex-col items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-transform border-4 border-amber-200 cursor-pointer"
            >
              <span className="font-mono text-3xl font-black">{beadCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 mt-0.5">मनका स्पर्श (Tap)</span>
              <span className="text-[10px] font-semibold text-slate-900/80">/ १०८ मनके</span>
            </button>
          </div>

          {/* Status & Anti-cheat indicator */}
          <div className="w-full flex items-center justify-between text-xs pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-slate-300 font-medium">सम्पूर्ण माला चक्र: <strong className="text-amber-300">{malaCycle}</strong></span>
            </div>

            {antiCheatStatus === 'mechanical_violation' ? (
              <Badge variant="rose" icon={AlertTriangle}>
                अति-तीव्र वेग (चेतावनी)
              </Badge>
            ) : (
              <Badge variant="emerald" icon={ShieldCheck}>
                शुद्ध वेग प्रमाणित
              </Badge>
            )}
          </div>
        </Card>

        {/* Right Column: Nitya Karmas & Swadhyaya Tracker */}
        <div className="lg:col-span-6 space-y-6">
          {/* Nitya Karma Checklist */}
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-dharmik text-lg font-bold text-amber-200">
                  दैनिक सात्विक नित्य कर्म
                </h3>
              </div>
              <Badge variant="gold">नित्य सङ्कल्प</Badge>
            </div>

            <div className="space-y-2 text-xs">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    task.completed
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-700 bg-slate-900"
                    />
                    <span className={`font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>
                      {task.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-amber-400">+{task.punya} पुण्य</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Swadhyaya Timer Card */}
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-dharmik text-lg font-bold text-amber-200">
                  दैनिक शास्त्र स्वाध्याय
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">{swadhyayaMinutes} मिनट</span>
            </div>

            <p className="text-xs text-slate-300 font-sans">
              शास्त्र स्वाध्याय के प्रत्येक मिनट पर २ पुण्य अंक अर्जित होते हैं।
            </p>

            <Button
              variant={isSwadhyayaRunning ? 'outline' : 'gold'}
              onClick={() => setIsSwadhyayaRunning(!isSwadhyayaRunning)}
              className="w-full text-xs py-2.5"
            >
              {isSwadhyayaRunning ? 'स्वाध्याय विराम दें (Pause)' : 'स्वाध्याय प्रारम्भ करें (Start)'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
