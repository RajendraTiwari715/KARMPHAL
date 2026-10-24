import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { ProfileContext } from './context';

export const ProfileProvider = ({ children }) => {
  const [profileState, setProfileState] = useState(() => {
    const s = storageService.getState();
    return {
      punyaLedger: s.punyaLedger,
      currentStreak: s.currentStreak,
      bestStreak: s.bestStreak,
      lastCheckInDate: s.lastCheckInDate
    };
  });

  useEffect(() => {
    const unsubscribe = storageService.subscribe((newState) => {
      setProfileState(prev => {
        if (
          prev.punyaLedger === newState.punyaLedger &&
          prev.currentStreak === newState.currentStreak &&
          prev.bestStreak === newState.bestStreak &&
          prev.lastCheckInDate === newState.lastCheckInDate
        ) {
          return prev; // Reference equality prevents re-render!
        }
        return {
          punyaLedger: newState.punyaLedger,
          currentStreak: newState.currentStreak,
          bestStreak: newState.bestStreak,
          lastCheckInDate: newState.lastCheckInDate
        };
      });
    });

    return () => unsubscribe();
  }, []);

  const addPunya = useCallback((points, reason) => {
    storageService.addPunya(points, reason);
  }, []);

  const value = useMemo(() => ({
    punyaLedger: profileState.punyaLedger,
    currentStreak: profileState.currentStreak,
    bestStreak: profileState.bestStreak,
    lastCheckInDate: profileState.lastCheckInDate,
    addPunya
  }), [profileState, addPunya]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
