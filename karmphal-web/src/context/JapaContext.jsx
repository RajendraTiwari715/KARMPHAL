import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { JapaContext } from './context';

export const JapaProvider = ({ children }) => {
  const [japaStats, setJapaStats] = useState(() => {
    const s = storageService.getState();
    return s.japaStats || {
      totalBeads: 0,
      completedMalas: 0,
      mantraCounters: {}
    };
  });

  useEffect(() => {
    const unsubscribe = storageService.subscribe((newState) => {
      setJapaStats(prev => {
        const next = newState.japaStats;
        if (!next) return prev;
        if (
          prev.totalBeads === next.totalBeads &&
          prev.completedMalas === next.completedMalas &&
          prev.mantraCounters === next.mantraCounters
        ) {
          return prev;
        }
        return next;
      });
    });

    return () => unsubscribe();
  }, []);

  const incrementJapa = useCallback((mantraName, count, isLegitimate) => {
    storageService.incrementJapa(mantraName, count, isLegitimate);
  }, []);

  const incrementMala = useCallback((mantraId) => {
    storageService.incrementMala(mantraId);
  }, []);

  const value = useMemo(() => ({
    japaStats,
    incrementJapa,
    incrementMala
  }), [japaStats, incrementJapa, incrementMala]);

  return (
    <JapaContext.Provider value={value}>
      {children}
    </JapaContext.Provider>
  );
};
