import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

class AudioAndHapticService {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    
    // Read persisted mute state (default to false / unmuted)
    if (typeof window !== 'undefined' && window.localStorage) {
      this.isMuted = window.localStorage.getItem('karmphal_audio_muted') === 'true';
    }

    // Unlocking AudioContext on first user interaction for autoplay policy (Capacitor & Web)
    if (typeof window !== 'undefined') {
      const unlock = () => {
        try {
          const ctx = this.getAudioContext();
          if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
        } catch (e) {
          console.warn('[AudioService] First tap unlock error:', e);
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  isSoundMuted() {
    return this.isMuted;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('karmphal_audio_muted', String(this.isMuted));
      window.dispatchEvent(new CustomEvent('karmphal_audio_mute_changed', { detail: { isMuted: this.isMuted } }));
    }
    return this.isMuted;
  }

  /**
   * Authentic Temple Bell (घंटी नाद)
   * Multi-oscillator harmonic physical synthesis of an Indian brass/bronze temple bell
   */
  async playTempleBell(frequency = 528, duration = 3.2) {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }

    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.4, now);
      masterGain.connect(ctx.destination);

      // Authentic Bell Harmonic Ratios (strike + partials + hum tone)
      const harmonics = [
        { ratio: 1.0, gain: 0.5, decay: duration },          // Fundamental / Hum
        { ratio: 1.189, gain: 0.35, decay: duration * 0.7 }, // Tierce (Minor 3rd)
        { ratio: 1.503, gain: 0.3, decay: duration * 0.5 },  // Quint
        { ratio: 2.0, gain: 0.25, decay: duration * 0.4 },   // Octave
        { ratio: 2.76, gain: 0.2, decay: duration * 0.3 },   // Superquint
        { ratio: 4.07, gain: 0.1, decay: duration * 0.2 }    // High strike transient
      ];

      harmonics.forEach(({ ratio, gain, decay }) => {
        const osc = ctx.createOscillator();
        const partialGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency * ratio, now);

        partialGain.gain.setValueAtTime(0, now);
        partialGain.gain.linearRampToValueAtTime(gain, now + 0.005); // Rapid strike attack
        partialGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(decay, 0.1));

        osc.connect(partialGain);
        partialGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + decay);
      });
    } catch (e) {
      console.warn('[AudioService] playTempleBell failed:', e);
    }
  }

  /**
   * Sacred Shankh Naad (शंख ध्वनि)
   * Frequency-modulated resonant horn synthesis simulating blowing of a sacred conch
   */
  async playShankh() {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
    }

    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 3.6;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      // Gentle swell attack (0.6s), hold (1.8s), noble release (1.2s)
      masterGain.gain.linearRampToValueAtTime(0.55, now + 0.6);
      masterGain.gain.setValueAtTime(0.55, now + 2.2);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Resonant Horn Filter (Bandpass)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(520, now);
      filter.Q.setValueAtTime(2.2, now);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // Natural Vibrato LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(4.2, now); // ~4.2 Hz human breath vibrato
      lfoGain.gain.setValueAtTime(4.5, now);
      lfo.connect(lfoGain);

      // Fundamental & Overtones
      const partials = [
        { type: 'sawtooth', baseFreq: 220, targetFreq: 261.6, gain: 0.4 }, // Pitch rises from 220Hz to 261.6Hz (Middle C)
        { type: 'triangle', baseFreq: 440, targetFreq: 523.2, gain: 0.3 }, // 2nd harmonic
        { type: 'sine', baseFreq: 660, targetFreq: 784.8, gain: 0.2 }       // 3rd harmonic
      ];

      partials.forEach(({ type, baseFreq, targetFreq, gain }) => {
        const osc = ctx.createOscillator();
        const pGain = ctx.createGain();

        osc.type = type;
        // Rising pitch bend on attack
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.55);

        lfoGain.connect(osc.frequency);

        pGain.gain.setValueAtTime(gain, now);

        osc.connect(pGain);
        pGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });

      lfo.start(now);
      lfo.stop(now + duration);
    } catch (e) {
      console.warn('[AudioService] playShankh failed:', e);
    }
  }

  /**
   * Tactile Wooden Bead Click (मनका स्पर्श ध्वनि)
   */
  async playBeadClick() {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }

    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.035);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignore background audio interruptions
    }
  }

  /**
   * Meru Gong on 108th Bead (मेरु घण्टा नाद)
   */
  async playMeruGong() {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    }

    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 4.2;
      const masterGain = ctx.createGain();

      masterGain.gain.setValueAtTime(0.6, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      masterGain.connect(ctx.destination);

      [130.81, 261.63, 392.0, 523.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        g.gain.setValueAtTime(0.4 / (idx + 1), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration / (idx * 0.5 + 1));

        osc.connect(g);
        g.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch (e) {
      console.warn('[AudioService] playMeruGong failed:', e);
    }
  }
}

export const audioService = new AudioAndHapticService();
