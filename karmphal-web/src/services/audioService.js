import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

class AudioAndHapticService {
  async playBeadClick() {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        console.warn('Haptics not available:', e);
      }
    }
  }

  async playMeruGong() {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {
        console.warn('Haptics not available:', e);
      }
    }
  }

  playTempleBell() {}
  playShankh() {}
  
  toggleMute() { return true; }
  isSoundMuted() { return true; }
}

export const audioService = new AudioAndHapticService();
