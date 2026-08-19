import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, RotateCcw, ShieldCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';
import confetti from 'canvas-confetti';

const MANTRAS = [
  { id: 'gayatri', name: 'गायत्री महामन्त्र', text: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥', syllables: 24, minSeconds: 2.88 },
  { id: 'mahamrityunjaya', name: 'महामृत्युञ्जय मन्त्र', text: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात् ॥', syllables: 32, minSeconds: 3.84 },
  { id: 'hare_krishna', name: 'हरे कृष्ण महामन्त्र', text: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे । हरे राम हरे राम राम राम हरे हरे ॥', syllables: 32, minSeconds: 3.84 },
  { id: 'om_namah_shivaya', name: 'शिव पञ्चाक्षर मन्त्र', text: 'ॐ नमः शिवाय', syllables: 5, minSeconds: 0.60 }
];

export default function DigitalJapaMala() {
  const [selectedMantra, setSelectedMantra] = useState(MANTRAS[0]);
  const [beadCount, setBeadCount] = useState(0);
  const [malaCycle, setMalaCycle] = useState(0);
  const [lastChantTime, setLastChantTime] = useState(Date.now());
  const [antiCheatStatus, setAntiCheatStatus] = useState('valid');
  const [isSwadhyayaRunning, setIsSwadhyayaRunning] = useState(false);
  const [swadhyayaMinutes, setSwadhyayaMinutes] = useState(0);
  const [tasks, setTasks] = useState(() => storageService.getState().tasks || []);

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

  const handleBeadClick = () => {
    const now = Date.now();
    const elapsedSeconds = (now - lastChantTime) / 1000;
    const requiredMinSeconds = selectedMantra.minSeconds;

    // Anti-Cheat Syllable Velocity Evaluation: T_min = N_s * 120ms
    if (elapsedSeconds < requiredMinSeconds && beadCount > 0) {
      setAntiCheatStatus('mechanical_violation');
      audioService.playBeadClick();
      setBeadCount(prev => (prev + 1) % 108);
    } else {
      setAntiCheatStatus('valid');
      audioService.playBeadClick();
      storageService.addPunya(1, `जप: ${selectedMantra.name}`);

      const nextBead = beadCount + 1;
      if (nextBead >= 108) {
        audioService.playMeruGong();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setBeadCount(0);
        setMalaCycle(prev => prev + 1);
        storageService.incrementMala(selectedMantra.id);
      } else {
        setBeadCount(nextBead);
      }
    }
    setLastChantTime(now);
  };

  const handleTaskToggle = (taskId) => {
    audioService.playTempleBell(528, 0.8);
    storageService.toggleTask(taskId);
    setTasks([...(storageService.getState().tasks || [])]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card-gold p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">१०८ मनके पारम्परिक जप माला</span>
              <span className="badge-saffron">अक्षर वेग रक्षक तकनीक</span>
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
      </div>

      {/* Main Mala & Sadhana Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 108 Bead Japa Mala */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between items-center text-center relative overflow-hidden">
          {/* Mantra Selector */}
          <div className="w-full mb-4">
            <label className="block text-xs font-bold text-slate-300 mb-1">इष्ट मन्त्र चयन करें</label>
            <select
              value={selectedMantra.id}
              onChange={e => {
                const found = MANTRAS.find(m => m.id === e.target.value);
                setSelectedMantra(found);
                setBeadCount(0);
                audioService.playBeadClick();
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-amber-400 font-sans"
            >
              {MANTRAS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Selected Mantra Text Display */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 mb-6 w-full">
            <pre className="font-sanskrit text-sm text-amber-200 whitespace-pre-line leading-relaxed">
              {selectedMantra.text}
            </pre>
          </div>

          {/* Interactive Bead Clicker Wheel */}
          <div className="relative my-2">
            <button
              onClick={handleBeadClick}
              className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-amber-800 p-1.5 shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all group flex items-center justify-center border-4 border-amber-300/40 cursor-pointer"
            >
              <div className="w-full h-full rounded-full bg-[#0E0F1A] flex flex-col items-center justify-center p-4">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">मनका संख्या</span>
                <span className="text-5xl font-black text-amber-200 font-mono my-1">{beadCount}</span>
                <span className="text-[10px] text-slate-400 font-bold">/ १०८ मनके (मेरु)</span>
                <span className="text-[11px] text-amber-300 font-bold mt-1 group-hover:animate-pulse">स्पर्श कर जपें</span>
              </div>
            </button>
          </div>

          {/* Anti-Cheat Syllable Velocity Badge */}
          <div className="mt-4 w-full">
            {antiCheatStatus === 'valid' ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>✓ प्रामाणिक शुद्ध जप (प्रति मनका +१ पुण्य)</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>⚠ अत्यधिक तीव्र गति (पुण्य अंक रोके गए)</span>
              </div>
            )}
          </div>

          {/* Mala Stats & Reset */}
          <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-white/5 text-xs">
            <span className="text-slate-300 font-bold">
              पूर्ण माला चक्र: <strong className="text-amber-300 font-mono text-sm">{malaCycle}</strong>
            </span>
            <button
              onClick={() => {
                setBeadCount(0);
                audioService.playBeadClick();
              }}
              className="text-slate-400 hover:text-amber-300 flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>माला पुनः प्रारम्भ करें</span>
            </button>
          </div>
        </div>

        {/* Right Column: Nitya Karma & Swadhyaya Study Timer */}
        <div className="lg:col-span-6 space-y-6">
          {/* Nitya Karma Checklist */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-dharmik text-base font-bold text-amber-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-amber-400" />
                <span>नित्य कर्म दैनिक नियम</span>
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    task.completed
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                      task.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-600'
                    }`}>
                      {task.completed && '✓'}
                    </div>
                    <span className={`font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">+{task.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Swadhyaya Study Timer */}
          <div className="glass-card p-6 border-t-4 border-cyan-500">
            <h3 className="font-dharmik text-base font-bold text-cyan-300 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>स्वाध्याय (वैदिक ग्रन्थ अध्ययन) समय-मापक</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              प्रति मिनट ग्रन्थ अध्ययन पर +२ पुण्य अर्जित करें।
            </p>

            <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-2xl border border-cyan-500/30 mb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">सत्र समय</span>
                <div className="text-3xl font-black font-mono text-cyan-200">{swadhyayaMinutes} मिनट</div>
              </div>

              <button
                onClick={() => {
                  audioService.playTempleBell(432, 1.0);
                  setIsSwadhyayaRunning(!isSwadhyayaRunning);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSwadhyayaRunning
                    ? 'bg-rose-500 text-slate-950 shadow-lg'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg'
                }`}
              >
                {isSwadhyayaRunning ? 'स्वाध्याय विराम (Pause)' : 'स्वाध्याय प्रारम्भ करें'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
