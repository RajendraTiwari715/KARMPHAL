import { useContext } from 'react';
import { ProfileContext } from './context';
import { storageService } from '../services/storageService';

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    const s = storageService.getState();
    return {
      punyaLedger: s.punyaLedger,
      currentStreak: s.currentStreak,
      bestStreak: s.bestStreak,
      lastCheckInDate: s.lastCheckInDate,
      location: null,
      addPunya: (pts, rsn) => storageService.addPunya(pts, rsn),
      updateLocation: () => {},
      updateCity: () => {}
    };
  }
  return context;
};
