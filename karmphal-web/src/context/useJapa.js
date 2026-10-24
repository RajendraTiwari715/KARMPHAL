import { useContext } from 'react';
import { JapaContext } from './context';
import { storageService } from '../services/storageService';

export const useJapa = () => {
  const context = useContext(JapaContext);
  if (!context) {
    const s = storageService.getState();
    return {
      japaStats: s.japaStats || { totalBeads: 0, completedMalas: 0, mantraCounters: {} },
      incrementJapa: (m, c, l) => storageService.incrementJapa(m, c, l),
      incrementMala: (id) => storageService.incrementMala(id)
    };
  }
  return context;
};
