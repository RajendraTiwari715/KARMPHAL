import { useState, useCallback } from 'react';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';
import confetti from 'canvas-confetti';

export function useJapaTelemetry(selectedMantra, onCompleteMala = null) {
  const [beadCount, setBeadCount] = useState(0);
  const [malaCycle, setMalaCycle] = useState(0);
  const [lastChantTime, setLastChantTime] = useState(Date.now());
  const [antiCheatStatus, setAntiCheatStatus] = useState('valid');

  const triggerHaptic = useCallback((isMeru = false) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (isMeru) {
          navigator.vibrate([100, 50, 100]); // Dual pulse for Meru 108th bead
        } else {
          navigator.vibrate(20); // Micro-haptic for beads 1-107
        }
      } catch (e) {
        // Haptics unavailable
      }
    }
  }, []);

  const handleBeadChant = useCallback(() => {
    const now = Date.now();
    const elapsedSeconds = (now - lastChantTime) / 1000;
    const requiredMinSeconds = selectedMantra?.minSeconds || 0.6;

    // Anti-Cheat Syllable Velocity Evaluation: T_min = N_s * 120ms
    if (elapsedSeconds < requiredMinSeconds && beadCount > 0) {
      setAntiCheatStatus('mechanical_violation');
      audioService.playBeadClick();
      triggerHaptic(false);
      setBeadCount(prev => (prev + 1) % 108);
    } else {
      setAntiCheatStatus('valid');
      audioService.playBeadClick();
      storageService.addPunya(1, `जप: ${selectedMantra?.name || 'मन्त्र'}`);

      const nextBead = beadCount + 1;
      if (nextBead >= 108) {
        audioService.playMeruGong();
        triggerHaptic(true);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setBeadCount(0);
        setMalaCycle(prev => prev + 1);
        storageService.incrementMala(selectedMantra?.id || 'mantra');
        if (onCompleteMala) onCompleteMala();
      } else {
        triggerHaptic(false);
        setBeadCount(nextBead);
      }
    }
    setLastChantTime(now);
  }, [beadCount, lastChantTime, selectedMantra, onCompleteMala, triggerHaptic]);

  const resetMala = useCallback(() => {
    setBeadCount(0);
    setAntiCheatStatus('valid');
    setLastChantTime(Date.now());
  }, []);

  return {
    beadCount,
    malaCycle,
    antiCheatStatus,
    handleBeadChant,
    resetMala
  };
}

export default useJapaTelemetry;
