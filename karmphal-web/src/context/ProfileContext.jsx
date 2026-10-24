import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { locationService } from '../services/locationService';
import { ProfileContext } from './context';

export const ProfileProvider = ({ children }) => {
  const [profileState, setProfileState] = useState(() => {
    const s = storageService.getState();
    return {
      punyaLedger: s.punyaLedger,
      currentStreak: s.currentStreak,
      bestStreak: s.bestStreak,
      lastCheckInDate: s.lastCheckInDate,
      location: locationService.getLocation()
    };
  });

  useEffect(() => {
    const unsubStorage = storageService.subscribe((newState) => {
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
          ...prev,
          punyaLedger: newState.punyaLedger,
          currentStreak: newState.currentStreak,
          bestStreak: newState.bestStreak,
          lastCheckInDate: newState.lastCheckInDate
        };
      });
    });

    const unsubLocation = locationService.subscribe((newLocation) => {
      setProfileState(prev => {
        if (
          prev.location?.lat === newLocation.lat &&
          prev.location?.lon === newLocation.lon &&
          prev.location?.cityName === newLocation.cityName &&
          prev.location?.isDefaultLocation === newLocation.isDefaultLocation
        ) {
          return prev;
        }
        return {
          ...prev,
          location: newLocation
        };
      });
    });

    return () => {
      unsubStorage();
      unsubLocation();
    };
  }, []);

  const addPunya = useCallback((points, reason) => {
    storageService.addPunya(points, reason);
  }, []);

  const updateLocation = useCallback((loc) => {
    locationService.setLocation(loc);
  }, []);

  const updateCity = useCallback((cityName) => {
    locationService.setCity(cityName);
  }, []);

  const value = useMemo(() => ({
    punyaLedger: profileState.punyaLedger,
    currentStreak: profileState.currentStreak,
    bestStreak: profileState.bestStreak,
    lastCheckInDate: profileState.lastCheckInDate,
    location: profileState.location,
    addPunya,
    updateLocation,
    updateCity
  }), [profileState, addPunya, updateLocation, updateCity]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
