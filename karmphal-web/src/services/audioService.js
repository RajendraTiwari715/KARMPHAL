// Audio Service disabled as requested (Silent Mode)

class SilentAudioService {
  playBeadClick() {}
  playMeruGong() {}
  playTempleBell() {}
  playShankh() {}
  toggleMute() { return true; }
  isSoundMuted() { return true; }
}

export const audioService = new SilentAudioService();
