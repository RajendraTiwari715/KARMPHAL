import { useMemo } from 'react';
import { useProfile } from './useProfile';
import { useTasks } from './useTasks';
import { useJapa } from './useJapa';

export const useApp = () => {
  const profile = useProfile();
  const tasks = useTasks();
  const japa = useJapa();

  const appState = useMemo(() => ({
    punyaLedger: profile.punyaLedger,
    currentStreak: profile.currentStreak,
    bestStreak: profile.bestStreak,
    lastCheckInDate: profile.lastCheckInDate,
    tasks: tasks.tasks,
    swadhyayaMinutes: tasks.swadhyayaMinutes,
    japaStats: japa.japaStats
  }), [profile, tasks, japa]);

  return useMemo(() => ({
    appState,
    addPunya: profile.addPunya,
    toggleTask: tasks.toggleTask,
    recordSwadhyayaTime: tasks.recordSwadhyayaTime,
    incrementJapa: japa.incrementJapa,
    incrementMala: japa.incrementMala
  }), [appState, profile.addPunya, tasks.toggleTask, tasks.recordSwadhyayaTime, japa.incrementJapa, japa.incrementMala]);
};

export { useProfile } from './useProfile';
export { useTasks } from './useTasks';
export { useJapa } from './useJapa';
