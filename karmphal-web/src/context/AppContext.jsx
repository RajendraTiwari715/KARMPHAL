import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState(storageService.getState());

  useEffect(() => {
    // Subscribe to any changes from storageService
    const unsubscribe = storageService.subscribe((newState) => {
      setAppState({ ...newState });
    });
    
    return () => unsubscribe();
  }, []);

  const addPunya = (points, reason) => {
    storageService.addPunya(points, reason);
  };

  const toggleTask = (taskId) => {
    storageService.toggleTask(taskId);
  };
  
  const recordSwadhyayaTime = (minutes) => {
     storageService.recordSwadhyayaTime(minutes);
  }

  const incrementJapa = (mantraName, count, isLegitimate) => {
     storageService.incrementJapa(mantraName, count, isLegitimate);
  }
  
  const incrementMala = (mantraId) => {
     storageService.incrementMala(mantraId);
  }

  return (
    <AppContext.Provider value={{ 
      appState, 
      addPunya, 
      toggleTask, 
      recordSwadhyayaTime,
      incrementJapa,
      incrementMala
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
