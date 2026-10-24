import React from 'react';
import { ProfileProvider } from './ProfileContext';
import { TaskProvider } from './TaskContext';
import { JapaProvider } from './JapaContext';

/**
 * AppProvider composes the split domain contexts:
 * - ProfileProvider (Punya ledger, user stats)
 * - TaskProvider (Daily checklist, Swadhyaya)
 * - JapaProvider (Mala stats, bead persistence)
 *
 * This completely decouples high-frequency bead taps from unrelated UI components.
 */
export const AppProvider = ({ children }) => {
  return (
    <ProfileProvider>
      <TaskProvider>
        <JapaProvider>
          {children}
        </JapaProvider>
      </TaskProvider>
    </ProfileProvider>
  );
};
