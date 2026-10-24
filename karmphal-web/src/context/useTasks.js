import { useContext } from 'react';
import { TaskContext } from './context';
import { storageService } from '../services/storageService';

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    const s = storageService.getState();
    return {
      tasks: s.tasks || [],
      swadhyayaMinutes: s.swadhyayaMinutes || 0,
      toggleTask: (id) => storageService.toggleTask(id),
      recordSwadhyayaTime: (min) => storageService.recordSwadhyayaTime(min)
    };
  }
  return context;
};
