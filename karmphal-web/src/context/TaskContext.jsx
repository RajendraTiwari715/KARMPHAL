import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { TaskContext } from './context';

export const TaskProvider = ({ children }) => {
  const [taskState, setTaskState] = useState(() => {
    const s = storageService.getState();
    return {
      tasks: s.tasks || [],
      swadhyayaMinutes: s.swadhyayaMinutes || 0
    };
  });

  useEffect(() => {
    const unsubscribe = storageService.subscribe((newState) => {
      setTaskState(prev => {
        if (
          prev.tasks === newState.tasks &&
          prev.swadhyayaMinutes === newState.swadhyayaMinutes
        ) {
          return prev;
        }
        return {
          tasks: newState.tasks || [],
          swadhyayaMinutes: newState.swadhyayaMinutes || 0
        };
      });
    });

    return () => unsubscribe();
  }, []);

  const toggleTask = useCallback((taskId) => {
    storageService.toggleTask(taskId);
  }, []);

  const recordSwadhyayaTime = useCallback((minutes) => {
    storageService.recordSwadhyayaTime(minutes);
  }, []);

  const value = useMemo(() => ({
    tasks: taskState.tasks,
    swadhyayaMinutes: taskState.swadhyayaMinutes,
    toggleTask,
    recordSwadhyayaTime
  }), [taskState, toggleTask, recordSwadhyayaTime]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
